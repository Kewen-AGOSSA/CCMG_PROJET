const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();
const db = admin.firestore();

// IMPORTANT: Remplacer par la vraie clé API de Resend plus tard
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_123");

/**
 * Cloud Function déclenchée lors de la création d'un document dans "transferts".
 */
exports.envoyerEmailTransfert = functions.region('europe-west1').firestore
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
                from: 'UDAMG Évangélisation <notifications@udamg.com>', // Nécessite un domaine vérifié sur Resend
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
