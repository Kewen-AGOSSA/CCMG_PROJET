const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();
const db = admin.firestore();

// Clé API Resend
const resend = new Resend(process.env.RESEND_API_KEY || "re_YUGLJcSz_Bw67LzWLgGvHNFvDLvh5L7Cb");

/**
 * Cloud Function déclenchée lors de la création d'un document dans "transferts".
 */
exports.envoyerEmailTransfert = functions.region('europe-west1')
    .runWith({ serviceAccount: "ccmg-evangelisation@appspot.gserviceaccount.com" })
    .firestore
    .document('transferts/{transfertId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const transfertId = context.params.transfertId;

        console.log(`Nouveau transfert détecté [${transfertId}]:`, data);

        // Vérification des champs requis
        if (!data.emailDestinataire || !data.contactNom || !data.villeDestination) {
            console.error("Données de transfert incomplètes, annulation de l'envoi.");
            return null;
        }

        try {
            // Construction de l'e-mail avec HTML
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0c2d3a; color: #ffd700; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Nouveau Transfert de Contact</h2>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <p>Bonjour Pasteur,</p>
                        <p>Un nouveau contact vient d'être transféré vers votre église (<strong>${data.villeDestination}</strong>).</p>
                        
                        <div style="background-color: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>👤 Nom :</strong> ${data.contactNom} ${data.contactPrenom || ""}</p>
                            <p style="margin: 5px 0;"><strong>📞 Téléphone :</strong> ${data.contactTel || "Non renseigné"}</p>
                            <p style="margin: 5px 0;"><strong>🏢 Ville d'origine :</strong> ${data.villeOrigine}</p>
                            <p style="margin: 5px 0;"><strong>🕊️ Évangéliste ayant fait le transfert :</strong> ${data.evangeliste || "Inconnu"}</p>
                        </div>
                        
                        <p>Merci de prendre en charge ce contact pour le suivi.</p>
                        <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                            Ceci est un e-mail automatique envoyé par l'application UDAMG Évangélisation.
                        </p>
                    </div>
                </div>
            `;

            // Envoi via l'API Resend
            const response = await resend.emails.send({
                from: 'onboarding@resend.dev', // Adresse de test. Pour utiliser UDAMG, il faudra vérifier le domaine.
                to: [data.emailDestinataire],
                subject: `Nouveau Contact transféré à ${data.villeDestination} : ${data.contactNom}`,
                html: emailContent
            });

            console.log("Email envoyé avec succès :", response);

            // Marquer le document comme envoyé
            await snap.ref.update({
                statut: 'envoye',
                dateEnvoi: admin.firestore.FieldValue.serverTimestamp(),
                resendId: response.id
            });

            return response;
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail :", error);
            
            // Marquer le document en erreur
            await snap.ref.update({
                statut: 'erreur',
                erreurMessage: error.message
            });
            
            return null;
        }
    });

/**
 * Fonction générique pour envoyer les notifications Push lors d'un ajout de contact.
 */
async function sendPushNotificationForNewContact(snap, context, isProgramme) {
    const data = snap.data();
    const contactId = context.params.contactId;
    const villeOuProgId = isProgramme ? context.params.progId : context.params.villeId;
    const nomLieu = isProgramme ? context.params.progId : context.params.villeId; // Idéalement, il faudrait le nom formaté

    console.log(`Nouvel ajout de contact détecté dans ${isProgramme ? 'Programme' : 'Ville'} ${villeOuProgId} :`, data);

    // Si on n'a pas l'email de l'évangéliste ou le nom du contact, on ne peut pas faire grand chose
    if (!data.createurEmail || !data.nom) {
        console.log("Pas d'email créateur ou de nom, annulation de la notification.");
        return null;
    }

    try {
        // 1. Chercher la liste des pasteurs pour cette église/programme
        const configDoc = await db.collection('configuration').doc('emails_autorises').get();
        if (!configDoc.exists) return null;
        const configData = configDoc.data();
        
        let pasteursEmails = [];
        let locationKey = villeOuProgId.toLowerCase().replace(/[\s\-]/g, '');
        
        if (isProgramme && configData['_programmes_speciaux'] && configData['_programmes_speciaux'].pasteur) {
            // Pour les programmes spéciaux, le pasteur est souvent global dans '_programmes_speciaux'
            pasteursEmails = configData['_programmes_speciaux'].pasteur;
        } else if (configData[locationKey] && configData[locationKey].pasteur) {
            pasteursEmails = configData[locationKey].pasteur;
        }

        // 2. Préparer la liste des destinataires (Pasteurs + l'Évangéliste lui-même)
        let destinatairesEmails = [...pasteursEmails];
        // On ajoute l'évangéliste s'il n'est pas déjà dans la liste
        if (!destinatairesEmails.includes(data.createurEmail)) {
            destinatairesEmails.push(data.createurEmail);
        }

        if (destinatairesEmails.length === 0) {
            console.log("Aucun destinataire à notifier.");
            return null;
        }

        // 3. Récupérer les tokens FCM des destinataires
        const tokensDocs = await db.collection('users_tokens').where('email', 'in', destinatairesEmails).get();
        if (tokensDocs.empty) {
            console.log("Aucun token FCM trouvé pour ces e-mails:", destinatairesEmails);
            return null;
        }

        const tokens = [];
        tokensDocs.forEach(doc => {
            const tokenData = doc.data();
            if (tokenData.token) tokens.push(tokenData.token);
        });

        if (tokens.length === 0) return null;

        // 4. Préparer le message
        const payload = {
            notification: {
                title: "Nouveau contact ajouté ! 🎉",
                body: `Un invité (${data.nom} ${data.prenom || ""}) a été enregistré dans la famille ${data.famille || "?"}.`
            }
        };

        // 5. Envoyer la notification via FCM
        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log(`Notification envoyée à ${tokens.length} appareils. Succès: ${response.successCount}, Échecs: ${response.failureCount}`);
        
        return response;
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification Push :", error);
        return null;
    }
}

/**
 * Déclencheur pour les ajouts dans une VILLE
 */
exports.onContactAjouteVille = functions.region('europe-west1')
    .firestore
    .document('villes/{villeId}/donnees/{contactId}')
    .onCreate((snap, context) => {
        return sendPushNotificationForNewContact(snap, context, false);
    });

/**
 * Déclencheur pour les ajouts dans un PROGRAMME
 */
exports.onContactAjouteProgramme = functions.region('europe-west1')
    .firestore
    .document('programmes/{progId}/donnees/{contactId}')
    .onCreate((snap, context) => {
        return sendPushNotificationForNewContact(snap, context, true);
    });
