/**
 * SCRIPT PRINCIPAL - CCMG Évangélisation
 * Version Cloud Firebase (v1.1) — Synchronisation en temps réel entre tous les évangélistes.
 * Les contacts sont désormais partagés et accessibles depuis n'importe quel appareil.
 */

// Configuration des différentes églises
const CONFIG_EGLISES = {
    "Angers": {
        nom: "CCMG Angers",
        adresse: "3 rue Carl Linné, 49000 Angers\nArrêt de tram : Terminus Roseraie",
        lien_wa: "https://whatsapp.com/channel/0029Vb70A780rGiN3kXVCU13"
    },
    "Brest": { nom: "CCMG Brest", adresse: "Adresse à définir...", lien_wa: "" },
    "Châteaubriant": { nom: "CCMG Châteaubriant", adresse: "Adresse à définir...", lien_wa: "" },
    "La Roche sur Yon": { nom: "CCMG La Roche sur Yon", adresse: "Adresse à définir...", lien_wa: "" },
    "La Rochelle": { nom: "CCMG La Rochelle", adresse: "Adresse à définir...", lien_wa: "" },
    "Le Mans": { nom: "CCMG Le Mans", adresse: "Adresse à définir...", lien_wa: "" },
    "Morlaix": { nom: "CCMG Morlaix", adresse: "Adresse à définir...", lien_wa: "" },
    "Nantes": { nom: "CCMG Nantes", adresse: "Adresse à définir...", lien_wa: "" },
    "Paris": { nom: "CCMG Paris", adresse: "Adresse à définir...", lien_wa: "" },
    "Quimper": { nom: "CCMG Quimper", adresse: "Adresse à définir...", lien_wa: "" },
    "Saint-Nazaire": { nom: "CCMG Saint-Nazaire", adresse: "Adresse à définir...", lien_wa: "" },
    "Saumur": { nom: "CCMG Saumur", adresse: "Adresse à définir...", lien_wa: "" },
    "Tours": { nom: "CCMG Tours", adresse: "Adresse à définir...", lien_wa: "" },
    "Vannes - Redon": { nom: "CCMG Vannes - Redon", adresse: "Adresse à définir...", lien_wa: "" }
};

// Configuration des évènements / programmes
const CONFIG_PROGRAMMES = {
    "EBED": { nom: "Convention EBED 2026", adresse: "Lieu EBED à définir", lien_wa: "" },
    "Nuit": { nom: "La Nuit de la Bonne Nouvelle", adresse: "Lieu à définir", lien_wa: "" },
    "Evan_Rennes": { nom: "Evangélisation à Rennes", adresse: "Rennes", lien_wa: "" },
    "Evan_Tours": { nom: "Evangélisation à Tours", adresse: "Tours", lien_wa: "" }
};

/* === DONNÉES GLOBALES === */
let familleActuelle = "";
let tousLesContacts = []; // Tableau mis à jour automatiquement par Firebase en temps réel

// Contexte actuellement sélectionné (Ville ou Programme)
// Remise à null à chaque relancement pour obliger la sélection
let villeActuelle = "";
let programmeActuel = "";
let roleActuel = ""; // "pasteur", "ouvrier", "evangeliste"

// Cadenas Virtuel - Variables temporaires
let contextKeyTemporaire = "";
let typeContextTemporaire = ""; // "ville" ou "programme"
let roleSelectionneTemporaire = "";

// Variable pour stocker la connexion Firebase active afin de pouvoir l'arrêter
let unsubscribeFirebase = null;


/* ===================================================
   INITIALISATION
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

    // Restaure le thème sauvegardé (clair ou sombre)
    if (localStorage.getItem('ccmg_theme') === 'clair') {
        document.body.classList.add('theme-clair');
        var btnTheme = document.getElementById('btn-theme');
        if (btnTheme) btnTheme.textContent = '☀️';
    }

    // Surveille l'état de connexion de l'utilisateur.
    // onAuthStateChanged se déclenche automatiquement :
    //   - Au chargement de la page (utilisateur connecté ou non)
    //   - Quand l'utilisateur se connecte
    //   - Quand l'utilisateur se déconnecte
    firebase.auth().onAuthStateChanged(function (utilisateur) {
        if (utilisateur) {
            // Utilisateur Google connecté, on vérifie s'il est VIP
            verifierAccesVIP(utilisateur);
        } else {
            // ❌ UTILISATEUR NON CONNECTÉ — on affiche l'écran de connexion
            naviguerVers('page-connexion');

            // Cache les boutons utilisateur
            var userInfo = document.getElementById('user-info');
            var btnDeconnexion = document.getElementById('btn-deconnexion');
            if (userInfo) userInfo.style.display = 'none';
            if (btnDeconnexion) btnDeconnexion.style.display = 'none';
        }
    });
});

/**
 * Vérifie si l'e-mail de l'utilisateur est présent dans la liste blanche de Firebase.
 * Si la liste est vide (première connexion), ajoute le premier compte en tant qu'admin.
 */
function verifierAccesVIP(utilisateur) {
    db.collection('configuration').doc('emails_autorises').get()
        .then(function(doc) {
            if (!doc.exists) {
                // Initialisation : Aucune liste n'existe, on ajoute le tout premier a se connecter
                console.log("[Sécurité] Initialisation de la base : ajout du premier VIP", utilisateur.email);
                db.collection('configuration').doc('emails_autorises').set({
                    liste: [utilisateur.email]
                }).then(function() {
                    accepterUtilisateur(utilisateur);
                });
            } else {
                var data = doc.data();
                var liste = data.liste || [];
                
                if (liste.includes(utilisateur.email)) {
                    // C'est un VIP !
                    accepterUtilisateur(utilisateur);
                } else {
                    // Intrus détecté
                    rejeterUtilisateur();
                }
            }
        })
        .catch(function(erreur) {
            console.error("[Sécurité] Erreur lors de la vérification VIP :", erreur);
            alert("Erreur Firebase : " + erreur.message);
        });
}

/**
 * Fonction appelée si l'utilisateur est autorisé
 */
function accepterUtilisateur(utilisateur) {
    // ✅ UTILISATEUR AUTORISÉ — on affiche l'app
    
    // Mise à jour de l'interface : affiche l'avatar et le prénom
    var userInfo = document.getElementById('user-info');
    var userAvatar = document.getElementById('user-avatar');
    var userPrenom = document.getElementById('user-prenom');
    var btnDeconnexion = document.getElementById('btn-deconnexion');

    if (userInfo) userInfo.style.display = 'flex';
    if (btnDeconnexion) btnDeconnexion.style.display = 'block';
    if (userAvatar && utilisateur.photoURL) userAvatar.src = utilisateur.photoURL;
    if (userPrenom) userPrenom.textContent = utilisateur.displayName
        ? utilisateur.displayName.split(' ')[0] 
        : utilisateur.email;

    // Démarre le splash screen puis navigue vers le MENU PRINCIPAL
    naviguerVers('page-bienvenue');
    setTimeout(function () {
        villeActuelle = "";
        programmeActuel = "";
        genererBoutonsVilles();
        genererBoutonsProgrammes();
        naviguerVers('page-accueil-menu');
    }, 2500);

    // Migration unique depuis l'ancien localStorage (si données existantes)
    migrerDepuisLocalStorage();
}

/**
 * Fonction appelée si l'utilisateur n'est pas dans la liste VIP
 */
function rejeterUtilisateur() {
    alert("⛔ Accès Refusé\nVotre adresse e-mail n'est pas autorisée par l'administration UDAMG.\nVeuillez contacter le responsable.");
    firebase.auth().signOut();
}

/**
 * Lance la connexion avec le compte Google de l'utilisateur.
 * Une popup Google s'ouvre pour choisir le compte.
 */
function connexionGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(function (result) {
            console.log('[Auth] Connecté :', result.user.displayName);
            // onAuthStateChanged se charge automatiquement du reste
        })
        .catch(function (erreur) {
            console.error('[Auth] Erreur de connexion :', erreur);
            if (erreur.code !== 'auth/popup-closed-by-user') {
                alert('Impossible de se connecter. Vérifiez votre connexion internet.');
            }
        });
}

/**
 * Déconnecte l'utilisateur et retourne à l'écran de connexion.
 * Appelée par l'ancienne fonction (sécurité) ou par le bouton de déconnexion.
 */
function deconnexion() {
    ouvrirModalConfirmation(
        'Voulez-vous vraiment vous déconnecter de l\'application UDAMG ?',
        function() {
            familleActuelle = '';
            tousLesContacts = [];
            firebase.auth().signOut()
                .then(function () {
                    console.log('[Auth] Déconnecté avec succès.');
                    fermerModalConfirmation();
                    // onAuthStateChanged gère automatiquement la navigation vers l'écran login
                })
                .catch(function (erreur) {
                    console.error('[Auth] Erreur de déconnexion :', erreur);
                    alert("Erreur lors de la déconnexion.");
                    fermerModalConfirmation();
                });
        }
    );
}

// Alias pour compatibilité avec d'anciennes versions or typos
function logoutGoogle() { deconnexion(); }

/**
 * ==========================================
 * GESTION DE LA MODALE DE CONFIRMATION
 * ==========================================
 */
function ouvrirModalConfirmation(message, onValider) {
    var modal = document.getElementById('modal-confirmation');
    var msgEl = document.getElementById('confirmation-message');
    var btnValider = document.getElementById('btn-valider-confirmation');
    
    if (modal && msgEl && btnValider) {
        msgEl.textContent = message;
        modal.style.display = 'flex';
        
        // On attache l'action de validation
        btnValider.onclick = onValider;
    }
}

function fermerModalConfirmation() {
    var modal = document.getElementById('modal-confirmation');
    if (modal) modal.style.display = 'none';
}



/**
 * Migration unique depuis localStorage vers Firebase.
 * Si des contacts existent en local (ancienne version), ils sont envoyés vers Firebase
 * puis supprimés du stockage local pour éviter les doublons.
 */
function migrerDepuisLocalStorage() {
    var vieuxContacts = JSON.parse(localStorage.getItem('contactsCCMG'));
    if (!vieuxContacts || vieuxContacts.length === 0) return;

    console.log('[Migration] ' + vieuxContacts.length + ' contact(s) en cours de transfert vers Firebase...');

    var promesses = vieuxContacts.map(function (c) {
        return db.collection('contacts').add(c);
    });

    Promise.all(promesses)
        .then(function () {
            localStorage.removeItem('contactsCCMG');
            console.log('[Migration] Transfert terminé avec succès ! ✓');
        })
        .catch(function (err) {
            console.error('[Migration] Erreur lors du transfert :', err);
        });
}


/* ===================================================
   NAVIGATION ENTRE LES ÉCRANS
   =================================================== */

/**
 * Gère les transitions entre les écrans de l'application.
 * Le CSS déclenche l'animation fadeSlideIn automatiquement via la classe .active.
 * @param {string} idEcran - L'ID de la section HTML à afficher
 */
function naviguerVers(idEcran) {
    document.querySelectorAll('.ecran').forEach(function (el) {
        el.classList.remove('active');
    });
    var ecranCible = document.getElementById(idEcran);
    if (ecranCible) {
        ecranCible.classList.add('active');
    }
    
    // Après chaque changement d'écran, on applique les masquages selon le rôle
    if (typeof appliquerDroitsInterface === 'function') {
        appliquerDroitsInterface();
    }
}

/**
 * Sélectionne une famille et affiche la liste de ses contacts.
 * @param {string} nom - Nom de la famille (ex: 'JAC', 'GÉDÉON', 'MIDL')
 */
function selectionnerFamille(nom) {
    familleActuelle = nom;
    document.getElementById('titre-liste-famille').innerText = t('family') + ' ' + nom;
    naviguerVers('page-liste');
    document.getElementById('recherche').value = '';
    afficherContacts();
}

/**
 * Retourne à l'écran de sélection des familles.
 */
function retourFamilles() {
    naviguerVers('page-familles');
}


/* ===================================================
   GESTION DU FORMULAIRE D'AJOUT / MODIFICATION
   =================================================== */

/**
 * Ouvre la modale du formulaire.
 * Si on est en mode "nouvel ajout" (pas d'ID stocké), tous les champs sont vidés.
 */
function ouvrirFormulaire() {
    if (document.getElementById('input-contact-id').value === '') {
        // Nouvel ajout : vide tous les champs
        document.getElementById('input-nom').value = '';
        document.getElementById('input-prenom').value = '';
        document.getElementById('input-tel').value = '';
        document.getElementById('input-evangeliste').value = '';
        document.getElementById('input-notes').value = '';
    }
    document.getElementById('modal-ajout').classList.add('active');
}

/**
 * Ferme la modale et réinitialise le mode (retour en mode "nouvel ajout").
 */
function fermerFormulaire() {
    document.getElementById('modal-ajout').classList.remove('active');
    setTimeout(function () {
        document.getElementById('input-contact-id').value = '';
    }, 300);
}

/**
 * Enregistre ou met à jour un contact dans Firebase.
 * - Si input-contact-id est vide → NOUVEL ajout (Firebase génère un ID unique)
 * - Sinon → MODIFICATION du document existant (identifié par son ID)
 */
function enregistrerContact() {
    if (villeActuelle === 'GLOBAL') {
        alert("Action impossible ⛔\nVous ne pouvez pas ajouter ou modifier un contact depuis le Bilan Global.\nVeuillez vous connecter à une église spécifique pour gérer ses contacts.");
        return;
    }
    
    var nom        = document.getElementById('input-nom').value.trim();
    var prenom     = document.getElementById('input-prenom').value.trim();
    var telBrut    = document.getElementById('input-tel').value.trim();
    var ref        = document.getElementById('input-evangeliste').value.trim();
    var notes      = document.getElementById('input-notes').value.trim();
    var contactId  = document.getElementById('input-contact-id').value;

    if (nom !== '' && prenom !== '' && telBrut !== '') {

        // Nettoyage : on ne garde que les chiffres et le '+'
        var telNettoye = telBrut.replace(/[^\d+]/g, '');

        // Formatage France : le '0' initial devient l'indicatif '33'
        if (telNettoye.startsWith('0') && !telNettoye.startsWith('00')) {
            telNettoye = '33' + telNettoye.substring(1);
        }

        // Retrouve le contact existant (pour conserver la date et le niveau)
        var contactExistant = contactId
            ? tousLesContacts.find(function (c) { return c.id === contactId; })
            : null;

        var contactData = {
            nom:       nom,
            prenom:    prenom,
            tel:       telNettoye,
            referent:  ref,
            notes:     notes,
            famille:   familleActuelle,
            ville:     villeActuelle || "", // Si ville, stocke la ville
            programme: programmeActuel || "", // Si programme, stocke le programme
            // La date d'ajout n'est enregistrée qu'à la création, jamais modifiée
            dateAjout: contactId
                ? (contactExistant ? contactExistant.dateAjout || '' : '')
                : new Date().toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'fr-FR'),
            // Le niveau est conservé lors d'une modification, sinon commence à 1
            niveau: contactId
                ? (contactExistant ? contactExistant.niveau : 1)
                : 1
        };

        if (contactId === '') {
            // MODE AJOUT : Firebase crée automatiquement un identifiant unique
            db.collection('contacts').add(contactData)
                .catch(function (err) {
                    console.error('[Firebase] Erreur lors de l\'ajout :', err);
                });
        } else {
            // MODE MODIFICATION : mise à jour du document existant
            db.collection('contacts').doc(contactId).update(contactData)
                .catch(function (err) {
                    console.error('[Firebase] Erreur lors de la modification :', err);
                });
        }

        fermerFormulaire();

        // Vide les champs après enregistrement
        document.getElementById('input-nom').value = '';
        document.getElementById('input-prenom').value = '';
        document.getElementById('input-tel').value = '';
        document.getElementById('input-notes').value = '';

    } else {
        alert(t('alert_fill_fields'));
    }
}


/* ===================================================
   AFFICHAGE ET FILTRAGE DES CONTACTS
   =================================================== */

/**
 * Affiche la liste des contacts de la famille actuellement sélectionnée.
 * @param {Array|null} listeFiltree - Si fourni, affiche uniquement ces contacts (résultats de recherche).
 */
function afficherContacts(listeFiltree) {
    var container = document.getElementById('liste-des-noms');
    container.innerHTML = '';

    // Tri alphabétique par nom
    tousLesContacts.sort(function (a, b) {
        return a.nom.localeCompare(b.nom);
    });

    var contactsAAfficher = (listeFiltree !== undefined && listeFiltree !== null)
        ? listeFiltree
        : tousLesContacts;

    var compteur = 0;

    contactsAAfficher.forEach(function (c) {

        if (c.famille === familleActuelle || (familleActuelle === 'Mission JAC' && c.famille === 'JAC') || (familleActuelle === 'CCMG' && c.famille === 'MIDL')) {
            compteur++;

            // Couleur de la pastille selon le niveau de suivi
            var couleurPastille = 'var(--ccmg-red)';
            if (c.niveau === 2) couleurPastille = 'var(--ccmg-gold)';
            if (c.niveau === 3) couleurPastille = 'var(--ccmg-green)';

            // Ligne "Ajouté le..." (affichée en doré si la date existe)
            var htmlDate = c.dateAjout
                ? '<div class="contact-date">' + t('added_on') + ' ' + escapeHTML(c.dateAjout) + '</div>'
                : '';

            // Bloc notes (affiché avec bordure or si des notes existent)
            var htmlNotes = c.notes
                ? '<div class="contact-notes">' + escapeHTML(c.notes) + '</div>'
                : '';

            // IMPORTANT : on utilise c.id (ID Firebase) au lieu d'un index tableau
            // Cela garantit que les opérations (edit, delete, relance) ciblent toujours
            // le bon contact, même si l'ordre du tableau change.
            var relanceHtml = '';
            if (roleActuel !== 'ouvrier') {
                relanceHtml = '<button class="action-btn btn-relance" onclick="gererRelance(\'' + c.id + '\')">' + t('relaunch') + '</button>';
            }

            var modifierHtml = '<button class="action-btn" onclick="modifierContact(\'' + c.id + '\')">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
            '</button>';

            var supprimerHtml = '';
            if (roleActuel !== 'ouvrier') {
                supprimerHtml = '<button class="action-btn" onclick="supprimerContact(\'' + c.id + '\')">' +
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
                '</button>';
            }

            var template =
                '<div class="contact-card">' +
                    '<div class="contact-info">' +
                        '<div class="contact-indic" style="background:' + couleurPastille + '; color:' + couleurPastille + '"></div>' +
                        '<div class="contact-texte">' +
                            htmlDate +
                            '<h4>' + escapeHTML(c.nom).toUpperCase() + ' ' + escapeHTML(c.prenom) + '</h4>' +
                            '<p>' + t('level') + ' ' + c.niveau + ' | ' + t('phone_abbr') + ': ' + escapeHTML(c.tel) + '</p>' +
                            htmlNotes +
                        '</div>' +
                    '</div>' +
                    '<div class="contact-actions">' +
                        relanceHtml +
                        modifierHtml +
                        supprimerHtml +
                    '</div>' +
                '</div>';

            container.innerHTML += template;
        }
    });

    if (compteur === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:30px;">' + t('empty_search') + '</p>';
    }
}

/**
 * Filtre les contacts en temps réel (Nom, Prénom ou Téléphone).
 */
function filtrerContacts() {
    var terme = document.getElementById('recherche').value.toLowerCase();

    var resultats = tousLesContacts.filter(function (c) {
        return c.nom.toLowerCase().includes(terme) ||
               c.prenom.toLowerCase().includes(terme) ||
               c.tel.includes(terme);
    });

    afficherContacts(resultats);
}

/**
 * Échappe les caractères HTML pour protéger contre les injections XSS.
 * @param {string} str - Chaîne à sécuriser
 * @returns {string} Chaîne sécurisée
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/'/g,  '&#39;')
        .replace(/"/g,  '&quot;');
}


/* ===================================================
   ACTIONS SUR LES CONTACTS
   =================================================== */

/**
 * Supprime un contact dans Firebase après confirmation.
 * @param {string} id - Identifiant Firebase unique du contact
 */
function supprimerContact(id) {
    if (confirm(t('remove_confirm'))) {
        db.collection('contacts').doc(id).delete()
            .catch(function (err) {
                console.error('[Firebase] Erreur lors de la suppression :', err);
            });
    }
}

/**
 * Ouvre le formulaire pré-rempli pour modifier un contact existant.
 * @param {string} id - Identifiant Firebase unique du contact
 */
function modifierContact(id) {
    var c = tousLesContacts.find(function (contact) { return contact.id === id; });
    if (!c) return;

    document.getElementById('input-nom').value         = c.nom   || '';
    document.getElementById('input-prenom').value      = c.prenom || '';
    document.getElementById('input-tel').value         = c.tel   || '';
    document.getElementById('input-evangeliste').value = c.referent || '';
    document.getElementById('input-notes').value       = c.notes || '';

    // Stocke l'ID Firebase pour que enregistrerContact() sache qu'on est en mode édition
    document.getElementById('input-contact-id').value  = id;

    ouvrirFormulaire();
}


/* ===================================================
   SYSTÈME DE RELANCE (WhatsApp / SMS)
   =================================================== */

/**
 * Ouvre la modale pour choisir le niveau de message à envoyer.
 * @param {string} id - Identifiant Firebase du contact à relancer
 */
function gererRelance(id) {
    document.getElementById('input-relance-id').value = id;
    document.getElementById('modal-relance').classList.add('active');
}

/**
 * Ferme la modale de choix de relance.
 */
function fermerModalRelance() {
    document.getElementById('modal-relance').classList.remove('active');
    setTimeout(function () {
        document.getElementById('input-relance-id').value = '';
        document.getElementById('input-relance-niveau').value = '';
        document.getElementById('relance-step-1').style.display = 'block';
        document.getElementById('relance-step-2').style.display = 'none';
        document.getElementById('btn-retour-relance').style.display = 'none';
    }, 300);
}

/**
 * Étape 1 : Enregistre le niveau choisi et affiche l'étape 2 (moyen d'envoi).
 */
function choisirNiveauRelance(niveau) {
    document.getElementById('input-relance-niveau').value = niveau;
    document.getElementById('relance-step-1').style.display = 'none';
    document.getElementById('relance-step-2').style.display = 'block';
    
    var btnRetour = document.getElementById('btn-retour-relance');
    if(btnRetour) btnRetour.style.display = 'inline-block';
}

/**
 * Retourne à l'étape 1 du choix de la relance.
 */
function retourStep1Relance() {
    document.getElementById('relance-step-2').style.display = 'none';
    document.getElementById('relance-step-1').style.display = 'block';
    
    var btnRetour = document.getElementById('btn-retour-relance');
    if(btnRetour) btnRetour.style.display = 'none';
}

/**
 * Étape 2 : Génère le message, l'envoie via la méthode et met à jour Firebase.
 * @param {string} methode - 'whatsapp' ou 'sms'
 */
function envoyerRelance(methode) {
    var id = document.getElementById('input-relance-id').value;
    var niveauSelectionne = parseInt(document.getElementById('input-relance-niveau').value, 10);
    var c = tousLesContacts.find(function (contact) { return contact.id === id; });
    
    if (!c || isNaN(niveauSelectionne)) {
        fermerModalRelance();
        return;
    }

    var configContexte = villeActuelle 
        ? (CONFIG_EGLISES[villeActuelle] || CONFIG_EGLISES["Angers"]) 
        : (CONFIG_PROGRAMMES[programmeActuel] || {nom: "UDAMG", adresse: "", lien_wa: ""});

    // Récupère le template de message selon le niveau CHOISI
    var messageTemplate = t('msg_level' + niveauSelectionne);
    var message = messageTemplate
        .replace(/{prenom}/g, c.prenom)
        .replace(/{referent}/g, c.referent || '')
        .replace(/{nom_eglise}/g, configContexte.nom)
        .replace(/{adresse_eglise}/g, configContexte.adresse)
        .replace(/{lien_wa}/g, configContexte.lien_wa);

    if (methode === 'whatsapp') {
        var urlWA = 'https://api.whatsapp.com/send?phone=' + c.tel + '&text=' + encodeURIComponent(message);
        window.open(urlWA, '_blank');
    } else {
        var urlSMS = 'sms:' + c.tel + '?body=' + encodeURIComponent(message);
        window.location.href = urlSMS;
    }

    // Fait progresser le niveau dans Firebase uniquement si on avance dans le processus
    var nouveauNiveau = Math.max(c.niveau || 1, niveauSelectionne);
    
    if (nouveauNiveau > c.niveau) {
        db.collection('contacts').doc(id).update({ niveau: nouveauNiveau })
            .catch(function (err) {
                console.error('[Firebase] Erreur mise à jour niveau :', err);
            });
    }

    fermerModalRelance();
}


/* ===================================================
   TABLEAU DE BORD DES STATISTIQUES
   =================================================== */

/**
 * Applique les restrictions d'affichage selon le rôle de l'utilisateur actif
 * Gère l'accès aux boutons de statistiques, d'ajout et d'export Excel.
 */
function appliquerDroitsInterface() {
    if (!roleActuel) return;

    var estPasteur = (roleActuel === 'pasteur');
    var estOuvrier = (roleActuel === 'ouvrier');
    var estEvangeliste = (roleActuel === 'evangeliste');

    // 1. Bouton Statistiques : Accessible à tous
    var btnStats = document.querySelectorAll('.btn-stats');
    btnStats.forEach(btn => {
        btn.style.display = 'inline-block';
    });

    // 2. Bouton d'ajout "+" : Accessible à tous (Ouvrier et BIAZO)
    var addButtons = document.querySelectorAll('.btn-ajouter');
    addButtons.forEach(btn => {
        btn.style.display = 'flex';
    });

    // 3. Boutons Export Excel/PDF : Accessible à tous
    var btnExport = document.querySelector('.btn-export');
    var btnExportPdf = document.querySelector('.btn-export-pdf');
    if (btnExport) btnExport.style.display = 'flex';
    if (btnExportPdf) btnExportPdf.style.display = 'flex';
}

/**
 * Ouvre l'écran des statistiques et actualise les données.
 */
function ouvrirStats() {
    naviguerVers('page-stats');
    actualiserTableauDeBord();
}

/**
 * Retourne à l'écran de sélection des familles depuis les statistiques.
 */
function retourDepuisStats() {
    if (villeActuelle === 'GLOBAL') {
        villeActuelle = '';
        roleActuel = '';
        if (typeof unsubscribeFirebase === 'function') {
            unsubscribeFirebase();
        }
        document.getElementById('titre-app').textContent = 'UDAMG Évangélisation';
        naviguerVers('page-accueil-menu');
    } else {
        naviguerVers('page-familles');
    }
}

/**
 * Met à jour tous les indicateurs du tableau de bord.
 */
function actualiserTableauDeBord() {
    var total = tousLesContacts.length;
    document.getElementById('total-general').innerText = total;

    if (total === 0) return;

    var nGedeon = tousLesContacts.filter(function (c) { return c.famille === 'GÉDÉON'; }).length;
    var nJac    = tousLesContacts.filter(function (c) { return c.famille === 'Mission JAC' || c.famille === 'JAC'; }).length;
    var nMidl   = tousLesContacts.filter(function (c) { return c.famille === 'CCMG' || c.famille === 'MIDL'; }).length;

    animerChiffre('count-gedeon', nGedeon);
    animerChiffre('count-jac', nJac);
    animerChiffre('count-midl', nMidl);

    setTimeout(function () {
        document.getElementById('bar-gedeon').style.height = ((nGedeon / total) * 100 + 15) + '%';
        document.getElementById('bar-jac').style.height    = ((nJac / total) * 100 + 15) + '%';
        document.getElementById('bar-midl').style.height   = ((nMidl / total) * 100 + 15) + '%';
    }, 100);

    remplirBarreFamille('GÉDÉON', 'prog-gedeon');
    remplirBarreFamille('Mission JAC', 'prog-jac');
    remplirBarreFamille('CCMG', 'prog-midl');
}

/**
 * Remplit les 3 segments de jauge (niveaux 1, 2, 3) pour une famille donnée.
 */
function remplirBarreFamille(nomFamille, prefixeId) {
    var contactsFamille = tousLesContacts.filter(function (c) { 
        return c.famille === nomFamille || 
               (nomFamille === 'Mission JAC' && c.famille === 'JAC') || 
               (nomFamille === 'CCMG' && c.famille === 'MIDL'); 
    });
    var totalFam = contactsFamille.length;

    var n1 = contactsFamille.filter(function (c) { return c.niveau === 1; }).length;
    var n2 = contactsFamille.filter(function (c) { return c.niveau === 2; }).length;
    var n3 = contactsFamille.filter(function (c) { return c.niveau === 3; }).length;

    var b1 = document.getElementById(prefixeId + '-n1');
    var b2 = document.getElementById(prefixeId + '-n2');
    var b3 = document.getElementById(prefixeId + '-n3');

    setTimeout(function () {
        if (totalFam > 0) {
            b1.style.width = (n1 / totalFam * 100) + '%';
            b1.innerText   = n1 > 0 ? n1 : '';
            b2.style.width = (n2 / totalFam * 100) + '%';
            b2.innerText   = n2 > 0 ? n2 : '';
            b3.style.width = (n3 / totalFam * 100) + '%';
            b3.innerText   = n3 > 0 ? n3 : '';
        } else {
            b1.style.width = b2.style.width = b3.style.width = '0%';
            b1.innerText   = b2.innerText   = b3.innerText   = '';
        }
    }, 200);
}

/**
 * Anime un chiffre de 0 jusqu'à sa valeur finale (effet visuel premium).
 * @param {string} id         - L'ID de l'élément HTML à animer
 * @param {number} finalValue - La valeur cible
 */
function animerChiffre(id, finalValue) {
    var element = document.getElementById(id);
    var start = 0;
    if (finalValue === 0) { element.innerText = '0'; return; }
    var vitesse = Math.max(20, Math.floor(500 / finalValue));
    var interval = setInterval(function () {
        start++;
        element.innerText = start;
        if (start >= finalValue) clearInterval(interval);
    }, vitesse);
}


/* ===================================================
   THÈME CLAIR / SOMBRE
   =================================================== */

/**
 * Bascule entre le thème sombre (défaut) et le thème clair (utilisation en extérieur).
 * La préférence est mémorisée dans localStorage.
 */
function basculerTheme() {
    var btnTheme = document.getElementById('btn-theme');
    var estClair = document.body.classList.toggle('theme-clair');

    if (estClair) {
        if (btnTheme) btnTheme.textContent = '☀️';
        localStorage.setItem('ccmg_theme', 'clair');
    } else {
        if (btnTheme) btnTheme.textContent = '🌙';
        localStorage.setItem('ccmg_theme', 'sombre');
    }
}


/* ===================================================
   EXPORT EXCEL (SheetJS)
   =================================================== */

/**
 * Génère et télécharge un rapport Excel complet (.xlsx) avec 4 onglets :
 * - Résumé global (stats + tous les contacts)
 * - GÉDÉON, JAC, MIDL (onglets par famille)
 */
function exporterExcel() {
    if (typeof XLSX === 'undefined') {
        alert('La librairie Excel est en cours de chargement, veuillez réessayer dans quelques secondes.');
        return;
    }
    if (tousLesContacts.length === 0) {
        alert('Aucun contact à exporter pour le moment.');
        return;
    }

    var btnExport = document.querySelector('.btn-export');
    if (btnExport) { btnExport.classList.add('loading'); btnExport.disabled = true; }

    setTimeout(function () {

        var entetes = ['Nom', 'Prénom', 'Téléphone', 'Famille', 'BIAZO Référent', 'Niveau', 'Statut', 'Notes', 'Date d\'ajout'];

        function niveauEnTexte(niveau) {
            if (niveau === 1) return 'Relancé (Niv. 1)';
            if (niveau === 2) return 'Présenté (Niv. 2)';
            if (niveau === 3) return 'Invité (Niv. 3)';
            return 'Inconnu';
        }

        function contactEnLigne(c) {
            return [
                c.nom       || '',
                c.prenom    || '',
                '\'' + (c.tel || ''), // Préfixe ' pour forcer le format texte dans Excel
                c.famille   || '',
                c.referent  || '',
                c.niveau    || 1,
                niveauEnTexte(c.niveau),
                c.notes     || '',
                c.dateAjout || ''
            ];
        }

        function creerFeuille(contacts) {
            var donnees = [entetes];
            contacts.forEach(function (c) { donnees.push(contactEnLigne(c)); });
            return XLSX.utils.aoa_to_sheet(donnees);
        }

        var maintenant = new Date();
        var dateStr  = maintenant.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        var heureStr = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        var donneesSummary = [
            ['RAPPORT UDAMG ÉVANGÉLISATION'],
            ['Généré le : ' + dateStr + ' à ' + heureStr],
            [''],
            ['STATISTIQUES GÉNÉRALES'],
            ['Total des âmes touchées',  tousLesContacts.length],
            ['Famille GÉDÉON', tousLesContacts.filter(function(c){ return c.famille === 'GÉDÉON'; }).length],
            ['Famille Mission JAC', tousLesContacts.filter(function(c){ return c.famille === 'Mission JAC' || c.famille === 'JAC'; }).length],
            ['Famille CCMG', tousLesContacts.filter(function(c){ return c.famille === 'CCMG' || c.famille === 'MIDL'; }).length],
            [''],
            ['NIVEAU DE SUIVI GLOBAL'],
            ['Niveau 1 - Relancés',  tousLesContacts.filter(function(c){ return c.niveau === 1; }).length],
            ['Niveau 2 - Présentés', tousLesContacts.filter(function(c){ return c.niveau === 2; }).length],
            ['Niveau 3 - Invités',   tousLesContacts.filter(function(c){ return c.niveau === 3; }).length],
            [''], ['']
        ];

        // Injection du détail par église si on est sur le Bilan Global
        if (villeActuelle === 'GLOBAL') {
            donneesSummary.push(['DÉTAIL PAR ÉGLISE']);
            donneesSummary.push(['Église', 'Total Âmes', 'Gédéon', 'Mission JAC', 'CCMG', 'Niv 1', 'Niv 2', 'Niv 3']);
            Object.keys(CONFIG_EGLISES).forEach(function(villeKey) {
                var cVille = tousLesContacts.filter(function(c) { return c.ville === villeKey; });
                if (cVille.length > 0) {
                    var tg = cVille.filter(function(c){ return c.famille === 'GÉDÉON'; }).length;
                    var tj = cVille.filter(function(c){ return c.famille === 'Mission JAC' || c.famille === 'JAC'; }).length;
                    var tm = cVille.filter(function(c){ return c.famille === 'CCMG' || c.famille === 'MIDL'; }).length;
                    var n1 = cVille.filter(function(c){ return c.niveau === 1; }).length;
                    var n2 = cVille.filter(function(c){ return c.niveau === 2; }).length;
                    var n3 = cVille.filter(function(c){ return c.niveau === 3; }).length;
                    
                    donneesSummary.push([
                        CONFIG_EGLISES[villeKey].nom.replace("CCMG ", ""),
                        cVille.length, tg, tj, tm, n1, n2, n3
                    ]);
                }
            });
            donneesSummary.push(['']);
            donneesSummary.push(['LISTE DÉTAILLÉE DES CONTACTS DE FRANCE']);
        }

        donneesSummary.push(entetes);
        tousLesContacts
            .slice()
            .sort(function (a, b) { return a.nom.localeCompare(b.nom); })
            .forEach(function (c) { donneesSummary.push(contactEnLigne(c)); });

        var feuilleResume = XLSX.utils.aoa_to_sheet(donneesSummary);
        var classeur = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(classeur, feuilleResume, 'Résumé');
        XLSX.utils.book_append_sheet(classeur, creerFeuille(tousLesContacts.filter(function(c){ return c.famille === 'GÉDÉON'; })), 'GÉDÉON');
        XLSX.utils.book_append_sheet(classeur, creerFeuille(tousLesContacts.filter(function(c){ return c.famille === 'Mission JAC' || c.famille === 'JAC'; })), 'Mission JAC');
        XLSX.utils.book_append_sheet(classeur, creerFeuille(tousLesContacts.filter(function(c){ return c.famille === 'CCMG' || c.famille === 'MIDL'; })), 'CCMG');

        var nomFichier = 'CCMG_Rapport_' + maintenant.getFullYear() +
                         '_' + String(maintenant.getMonth() + 1).padStart(2, '0') +
                         '_' + String(maintenant.getDate()).padStart(2, '0') + '.xlsx';

        // Méthode Blob — fiable sur tous les navigateurs modernes
        var donneesBinaires = XLSX.write(classeur, { bookType: 'xlsx', type: 'array' });
        var blob = new Blob([donneesBinaires], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var lien = document.createElement('a');
        lien.href = URL.createObjectURL(blob);
        lien.download = nomFichier;
        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);
        URL.revokeObjectURL(lien.href);

        if (btnExport) { btnExport.classList.remove('loading'); btnExport.disabled = false; }

    }, 50);
}

/* ===================================================
   EXPORT PDF (jsPDF + AutoTable)
   =================================================== */

/**
 * Génère et télécharge un rapport PDF complet des statistiques et des contacts
 */
function exporterPDF() {
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        alert('La librairie PDF est en cours de chargement, veuillez réessayer dans quelques secondes.');
        return;
    }
    if (tousLesContacts.length === 0) {
        alert('Aucun contact à exporter pour le moment.');
        return;
    }

    var btnExport = document.querySelector('.btn-export-pdf');
    if (btnExport) { btnExport.classList.add('loading'); btnExport.disabled = true; }

    setTimeout(function() {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF('portrait', 'pt', 'a4');
        
        var maintenant = new Date();
        var dateStr  = maintenant.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        var heureStr = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        var nomContexte = villeActuelle 
            ? (CONFIG_EGLISES[villeActuelle] ? CONFIG_EGLISES[villeActuelle].nom : villeActuelle) 
            : (programmeActuel ? CONFIG_PROGRAMMES[programmeActuel].nom : "Général");

        // Titre
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80);
        doc.text("Bilan d'Evangelisation UDAMG", 40, 50);
        
        doc.setFontSize(14);
        doc.setTextColor(192, 57, 43);
        doc.text("Lieu / Eglise : " + nomContexte, 40, 75);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Genere le " + dateStr + " a " + heureStr, 40, 95);

        // Statistiques Globales (Mini encadré)
        var total = tousLesContacts.length;
        var nGedeon = tousLesContacts.filter(function(c){ return c.famille === 'GÉDÉON'; }).length;
        var nJac = tousLesContacts.filter(function(c){ return c.famille === 'Mission JAC' || c.famille === 'JAC'; }).length;
        var nMidl = tousLesContacts.filter(function(c){ return c.famille === 'CCMG' || c.famille === 'MIDL'; }).length;

        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.rect(40, 110, 515, 60, 'FD'); // Boîte grise

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        doc.text("Total des ames : " + total, 50, 130);
        doc.text("GEDEON : " + nGedeon, 180, 130);
        doc.text("Mission JAC : " + nJac, 300, 130);
        doc.text("CCMG : " + nMidl, 440, 130);
        
        // Niveau Global
        var n1 = tousLesContacts.filter(function(c){ return c.niveau === 1; }).length;
        var n2 = tousLesContacts.filter(function(c){ return c.niveau === 2; }).length;
        var n3 = tousLesContacts.filter(function(c){ return c.niveau === 3; }).length;
        doc.text("Relances (N1): " + n1 + "   |   Presentes (N2): " + n2 + "   |   Invites (N3): " + n3, 50, 155);

        // Tableau des contacts
        function niveauEnTexte(niveau) {
            if (niveau === 1) return 'Niv 1';
            if (niveau === 2) return 'Niv 2';
            if (niveau === 3) return 'Niv 3';
            return '?';
        }

        var tableData = tousLesContacts
            .slice()
            .sort(function (a, b) { 
                var nA = a.nom ? a.nom.toLowerCase() : "";
                var nB = b.nom ? b.nom.toLowerCase() : "";
                return nA.localeCompare(nB); 
            })
            .map(function(c) {
                return [
                    (c.nom || '').toUpperCase() + ' ' + (c.prenom || ''),
                    c.tel || '',
                    c.famille || '',
                    niveauEnTexte(c.niveau),
                    c.referent || '',
                    c.notes || ''
                ];
            });

        var startYContacts = 190;

        // Sous-tableau de résumé par église si GLOBAL
        if (villeActuelle === 'GLOBAL') {
            var statsEgliseData = [];
            Object.keys(CONFIG_EGLISES).forEach(function(villeKey) {
                var cVille = tousLesContacts.filter(function(c) { return c.ville === villeKey; });
                if (cVille.length > 0) {
                    var tg = cVille.filter(function(c){ return c.famille === 'GÉDÉON'; }).length;
                    var tj = cVille.filter(function(c){ return c.famille === 'Mission JAC' || c.famille === 'JAC'; }).length;
                    var tm = cVille.filter(function(c){ return c.famille === 'CCMG' || c.famille === 'MIDL'; }).length;
                    var n1 = cVille.filter(function(c){ return c.niveau === 1; }).length;
                    var n2 = cVille.filter(function(c){ return c.niveau === 2; }).length;
                    var n3 = cVille.filter(function(c){ return c.niveau === 3; }).length;
                    
                    statsEgliseData.push([
                        CONFIG_EGLISES[villeKey].nom.replace("CCMG ", ""),
                        cVille.length, tg, tj, tm, n1, n2, n3
                    ]);
                }
            });
            
            doc.autoTable({
                startY: 190,
                head: [['Église', 'Total', 'Gédéon', 'JAC', 'CCMG', 'Niv 1', 'Niv 2', 'Niv 3']],
                body: statsEgliseData,
                theme: 'grid',
                headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 10 },
                bodyStyles: { fontSize: 9, halign: 'center' },
                columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
            });
            
            startYContacts = doc.lastAutoTable.finalY + 30; // Position dynamique pour la liste qui suit
        }

        doc.autoTable({
            startY: startYContacts,
            head: [['Nom & Prenom', 'Telephone', 'Famille', 'Niveau', 'BIAZO', 'Notes']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 70 },
                2: { cellWidth: 60 },
                3: { cellWidth: 45 },
                4: { cellWidth: 70 },
                5: { cellWidth: 'auto' } // Notes prend l'espace restant
            },
            styles: { overflow: 'linebreak' },
            margin: { top: 40, right: 40, bottom: 40, left: 40 }
        });

        // Enregistrer le PDF
        var nomFichierSafe = nomContexte.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save('Rapport_UDAMG_' + nomFichierSafe + '_' + dateStr.replace(/\//g, '') + '.pdf');

        if (btnExport) { btnExport.classList.remove('loading'); btnExport.disabled = false; }
    }, 500);
}

/* ===================================================
   GESTION DES VILLES ET FIREBASE
   =================================================== */

/**
 * Génère dynamiquement les boutons pour chaque église (ville) configurée.
 */
function genererBoutonsVilles() {
    var container = document.getElementById('liste-villes-container');
    if (!container) return;
    container.innerHTML = '';
    
    Object.keys(CONFIG_EGLISES).forEach(function(villeKey) {
        var btn = document.createElement('button');
        btn.className = 'bouton-famille'; // On réutilise ce style qui est propre
        btn.style.height = 'auto';
        btn.innerHTML = '<span class="nom-famille" style="margin:0;">' + CONFIG_EGLISES[villeKey].nom + '</span>';
        btn.onclick = function() {
            choisirVille(villeKey);
        };
        container.appendChild(btn);
    });
    
    // Bouton Spécial Bilan Global (Toutes les églises)
    var btnGlobal = document.createElement('button');
    btnGlobal.className = 'bouton-famille';
    btnGlobal.style.height = 'auto';
    btnGlobal.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05))';
    btnGlobal.style.borderColor = 'var(--ccmg-gold)';
    btnGlobal.innerHTML = '<span class="nom-famille" style="margin:0; color:var(--ccmg-gold);">🌍 Bilan Général (Réservé BIAZO)</span>';
    btnGlobal.onclick = function() {
        choisirVille('GLOBAL');
    };
    container.appendChild(btnGlobal);
}

/**
 * Filtre les boutons de la liste des églises.
 */
function filtrerVilles() {
    var recherche = document.getElementById('input-recherche-ville').value.toLowerCase();
    var container = document.getElementById('liste-villes-container');
    if (!container) return;
    var boutons = container.getElementsByTagName('button');
    
    for (var i = 0; i < boutons.length; i++) {
        var nom = boutons[i].textContent.toLowerCase();
        if (nom.includes(recherche)) {
            boutons[i].style.display = "";
        } else {
            boutons[i].style.display = "none";
        }
    }
}

/**
 * Enregistre la ville choisie (après vérification du mot de passe si nécessaire)
 */
function choisirVille(villeKey) {
    console.log('[UDAMG] Ville choisie :', villeKey);
    console.log('[UDAMG] Ouverture du cadenas...');
    contextKeyTemporaire = villeKey;
    typeContextTemporaire = 'ville';
    ouvrirModalRole();
}

/**
 * Permet de revenir à l'écran de sélection de la ville en cas d'erreur depuis l'écran des familles
 * Modifié pour revenir au menu HUB principal
 */
function retourAuMenu() {
    villeActuelle = "";
    programmeActuel = "";
    roleActuel = "";
    sessionStorage.clear();
    
    if (unsubscribeFirebase) {
        unsubscribeFirebase(); // Arrête d'écouter les données de la ville/programme précédente
    }
    tousLesContacts = []; // Vide la liste de l'écran
    if (familleActuelle) afficherContacts();
    
    naviguerVers('page-accueil-menu');
}

/**
 * Active l'écoute Firebase uniquement pour la ville de l'utilisateur ou le programme
 */
function initialiserEcouteFirebase() {
    if (!villeActuelle && !programmeActuel) return;
    
    if (unsubscribeFirebase) {
        unsubscribeFirebase(); // Sécurité pour désabonner l'ancienne écoute
    }
    
    var requete = db.collection('contacts');
    
    // Si nous ne sommes pas sur le Bilan Global, on filtre les résultats
    if (villeActuelle && villeActuelle !== 'GLOBAL') {
        requete = requete.where('ville', '==', villeActuelle);
    } else if (programmeActuel) {
        requete = requete.where('programme', '==', programmeActuel);
    }
    
    unsubscribeFirebase = requete.onSnapshot(function (snapshot) {
          tousLesContacts = [];
          snapshot.forEach(function (doc) {
              var data = doc.data();
              data.id = doc.id;
              tousLesContacts.push(data);
          });

          if (familleActuelle) afficherContacts();

          var pageStats = document.getElementById('page-stats');
          if (pageStats && pageStats.classList.contains('active')) {
              actualiserTableauDeBord();
          }

      }, function (erreur) {
          console.error('[Firebase] Erreur de synchronisation :', erreur);
          if (erreur.message.includes('index')) {
              alert('Firebase requiert un index ! Ouvrez la console Firestore pour le créer.');
          }
      });
}

/**
 * Génère dynamiquement les boutons pour chaque programme configuré.
 */
function genererBoutonsProgrammes() {
    var container = document.getElementById('liste-programmes-container');
    if (!container) return;
    container.innerHTML = '';
    
    Object.keys(CONFIG_PROGRAMMES).forEach(function(progKey) {
        var btn = document.createElement('button');
        btn.className = 'bouton-famille'; // On réutilise le style
        btn.style.height = 'auto';
        btn.innerHTML = '<span class="nom-famille" style="margin:0;">' + CONFIG_PROGRAMMES[progKey].nom + '</span>';
        btn.onclick = function() {
            contextKeyTemporaire = progKey;
            typeContextTemporaire = 'programme';
            ouvrirModalRole();
        };
        container.appendChild(btn);
    });
}

/**
 * ==========================================
 * GESTION DU CADENAS VIRTUEL ET DES RÔLES
 * ==========================================
 */
/**
 * Ouvre la modale de sécurité (Cadenas Virtuel) de manière sécurisée.
 */
function ouvrirModalRole() {
    console.log('[UDAMG] Ouverture du cadenas virtuel...');
    
    var modal = document.getElementById('modal-mot-de-passe');
    if (!modal) return console.error('[UDAMG] Modale introuvable.');

    // Configuration des affichages par défaut
    var config = {
        'etape-choix-role': 'block',
        'etape-saisie-mdp': 'none',
        'btn-fermer-modal-mdp': 'flex',
        'mdp-erreur': 'none',
        'role-erreur': 'none'
    };

    Object.keys(config).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = config[id];
    });

    var input = document.getElementById('input-mdp');
    if (input) input.value = '';

    modal.classList.add('active');
}

function choisirRole(role) {
    // Blocage strict dès la sélection de rôle si Bilan Global demandé
    if (contextKeyTemporaire === 'GLOBAL' && role !== 'evangeliste') {
        var errRole = document.getElementById('role-erreur');
        if (errRole) errRole.style.display = 'block';
        
        // Tremblement
        var modalContent = document.querySelector('#modal-mot-de-passe .modal-content');
        if (modalContent) {
            modalContent.style.animation = 'none';
            setTimeout(function() {
                modalContent.style.animation = 'shake 0.4s';
            }, 10);
        }
        return; // Interdire de passer à l'étape suivante
    }
    
    // On efface l'erreur si tout va bien
    var errRoleReset = document.getElementById('role-erreur');
    if (errRoleReset) errRoleReset.style.display = 'none';

    roleSelectionneTemporaire = role;
    
    var step1 = document.getElementById('etape-choix-role');
    var step2 = document.getElementById('etape-saisie-mdp');
    var btnFermer = document.getElementById('btn-fermer-modal-mdp');
    
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    if (btnFermer) btnFermer.style.display = 'none';
    
    var input = document.getElementById('input-mdp');
    if (input) {
        input.value = '';
        input.type = 'password';
        var toggle = document.getElementById('toggle-mdp');
        if (toggle) toggle.textContent = '👁️';
    }
    
    var labelEl = document.getElementById('label-role');
    if (labelEl) {
        var labels = { 'pasteur': '👑 Pasteur', 'ouvrier': '📝 Ouvrier', 'evangeliste': '🕊️ BIAZO' };
        labelEl.textContent = labels[role] || role;
    }
    
    if (input) setTimeout(function() { input.focus(); }, 100);
}

function retourChoixRole() {
    document.getElementById('etape-saisie-mdp').style.display = 'none';
    document.getElementById('etape-choix-role').style.display = 'block';
    document.getElementById('btn-fermer-modal-mdp').style.display = 'flex';
    document.getElementById('mdp-erreur').style.display = 'none';
    document.getElementById('input-mdp').value = '';
    
    // Reset visibilité
    document.getElementById('input-mdp').type = 'password';
    document.getElementById('toggle-mdp').textContent = '👁️';
}

/**
 * Alterne l'affichage du mot de passe entre clair et masqué
 */
function basculerVisibiliteMdp() {
    var input = document.getElementById('input-mdp');
    var icone = document.getElementById('toggle-mdp');
    
    if (input.type === 'password') {
        input.type = 'text';
        icone.textContent = '🙈'; // Œil masqué
        icone.style.opacity = '1';
    } else {
        input.type = 'password';
        icone.textContent = '👁️'; // Œil ouvert
        icone.style.opacity = '0.7';
    }
}

function fermerModalMdp() {
    var modal = document.getElementById('modal-mot-de-passe');
    if (modal) modal.classList.remove('active');
    contextKeyTemporaire = "";
    typeContextTemporaire = "";
    roleSelectionneTemporaire = "";
}

function validerMotDePasse() {
    var mdpSaisi = document.getElementById('input-mdp').value.trim();
    if (!mdpSaisi || !contextKeyTemporaire || !roleSelectionneTemporaire) return;
    
    // Mots de passe fixes et uniques (plus de lecture Firebase pour éviter les anciens mots de passe modifiés)
    var mdpPast = "PAST2026";
    var mdpOuv = "ouvrier2026";
    var mdpEvan = "ccmg2026";
    
    verifierMdpLocal(mdpPast, mdpOuv, mdpEvan, mdpSaisi);
}

function verifierMdpLocal(mdpPast, mdpOuv, mdpEvan, mdpSaisi) {
    var mdpReel = "";
    if (roleSelectionneTemporaire === 'pasteur') mdpReel = mdpPast;
    if (roleSelectionneTemporaire === 'ouvrier') mdpReel = mdpOuv;
    if (roleSelectionneTemporaire === 'evangeliste') mdpReel = mdpEvan;

    if (mdpSaisi === mdpReel) {
        // Succès !
        roleActuel = roleSelectionneTemporaire;
        validerChoixContexte(typeContextTemporaire, contextKeyTemporaire);
        fermerModalMdp();
    } else {
        // Échec
        var errEl2 = document.getElementById('mdp-erreur');
        errEl2.innerHTML = "❌ Mot de passe incorrect";
        errEl2.style.display = 'block';
        
        // Tremblement
        var modalContent2 = document.querySelector('#modal-mot-de-passe .modal-content');
        modalContent2.style.animation = 'none';
        setTimeout(function() {
            modalContent2.style.animation = 'shake 0.4s';
        }, 10);
    }
}

function validerChoixContexte(type, id) {
    var titre = document.getElementById('titre-app');
    
    if (type === 'ville') {
        villeActuelle = id;
        programmeActuel = "";
        if (titre) {
            if (id === 'GLOBAL') {
                titre.textContent = 'UDAMG - BILAN FRANCE ENTIÈRE';
            } else {
                titre.textContent = 'UDAMG Évangélisation - ' + CONFIG_EGLISES[id].nom.replace('CCMG ', '');
            }
        }
    } else {
        programmeActuel = id;
        villeActuelle = "";
        if (titre) titre.textContent = CONFIG_PROGRAMMES[id].nom;
    }
    
    initialiserEcouteFirebase();
    
    // Si c'est le Bilan Global, on va directement sur la page des Stats, sinon Familles
    if (id === 'GLOBAL') {
        naviguerVers('page-stats');
    } else {
        naviguerVers('page-familles');
    }
    
    // On applique les droits tout de suite après le déverrouillage
    appliquerDroitsInterface();
}



// Ajout de l'animation Shake pour erreur
var styleShake = document.createElement('style');
styleShake.innerHTML = `
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-10px); }
        100% { transform: translateX(0); }
    }
`;
document.head.appendChild(styleShake);