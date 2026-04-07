/**
 * Fichier de gestion des traductions (i18n)
 * Permet de basculer l'interface en plusieurs langues (Français, Anglais).
 */

const translations = {
    fr: {
        welcome: "Bienvenue",
        subtitle_evangelism: "Union Des Assemblées Maison de Grâce",
        title_evangelism: "UDAMG Évangélisation",
        quote_evangelism: '"Sauvé par Grâce pour Sauver"',
        choose_family: "Choisissez une famille",
        under_18: "Moins de 18 ans",
        age_18_30: "18 - 30 ans",
        over_30: "+ de 30 ans",
        dashboard_btn: "📊 TABLEAU DE BORD",
        family: "Famille",
        search_placeholder: "Rechercher un nom...",
        back_stats: "←",
        global_stats: "Statistiques Globales",
        total_souls: "ÂMES TOUCHÉES AU TOTAL",
        family_ranking: "CLASSEMENT DES FAMILLES",
        followup_quality: "QUALITÉ DU SUIVI PAR FAMILLE",
        restarted: "🔴 Relancés",
        presented: "🟡 Présentés",
        invited: "🟢 Invités",
        new_contact: "Nouveau Contact",
        input_last_name: "Nom",
        input_first_name: "Prénom",
        input_phone: "Numéro (ex: 06...)",
        input_evangelist: "Ton nom (Évangéliste)",
        cancel: "Annuler",
        save: "Enregistrer",
        alert_fill_fields: "Oups ! Remplis bien le nom, le prénom et le numéro.",
        remove_confirm: "Voulez-vous vraiment retirer ce contact ?",
        level: "Niv",
        phone_abbr: "Tél",
        relaunch: "RELANCER",
        msg_level1: `Bonsoir {prenom},
C'est l'équipe d'évangélisation de l'église {nom_eglise}. Nous étions très heureux de vous rencontrer récemment ! Nous prions que le Seigneur vous garde, vous et toute votre famille.

Nous vous invitons à notre culte de célébration ce dimanche à partir de 10H à l’église. Nous serions vraiment heureux de vous accueillir parmi nous, de célébrer le Seigneur ensemble et de partager cette communion avec vous.

Adresse de l’église :
{adresse_eglise}

Retrouvez-nous aussi ici :
- WhatsApp (Groupe) : {lien_wa}
- Instagram : https://www.instagram.com/ccmg.angers
- Tél : 06 35 38 07 58
- Email : ccmgangers@gmail.com

Si vous avez des questions, n’hésitez pas à nous contacter. Que Dieu vous bénisse !
L’équipe d’évangélisation - Église {nom_eglise}`,
        msg_level2: `Bonsoir {prenom}, c'est l'équipe d'évangélisation de l'église {nom_eglise} !
J’espère que vous allez bien par la grâce de Dieu.

Lamentations 3:22-23 
« Les bontés de l'Éternel ne sont pas épuisées, Ses compassions ne sont pas à leur terme ; Elles se renouvellent chaque matin. Oh! que ta fidélité est grande! »

Nous prions que le Seigneur vous fortifie, qu’il vous accompagne et que sa main repose sur votre vie. On tenait à vous rappeler notre grand culte de célébration ce dimanche à partir de 10H à l’église. Nous nous préparons pour ce rendez-vous divin et nous espérons de tout cœur que vous serez présent ! 

Adresse de l’église : 
{adresse_eglise}

Si vous avez des questions, n’hésitez pas. Que Dieu vous bénisse !
L’équipe d’évangélisation - Église {nom_eglise}`,
        msg_level3: `Bonsoir {prenom},
J’espère que vous allez bien par la grâce de Dieu et que votre semaine s’est bien passée !

Nous vous invitons chaleureusement à notre culte de célébration ce dimanche à partir de 10H à l’église. C’est un rendez-vous divin où la gloire de Dieu va se manifester puissamment. Un temps de louange, de prière, et de transformation. Ne ratons pas ce moment exceptionnel dans la présence de Dieu. Ne venez pas seul, vous pouvez inviter quelqu’un !  

Adresse de l’église : 
{adresse_eglise}

À dimanche ! Que Dieu vous bénisse grandement.
L’équipe d’évangélisation - Église {nom_eglise}`,
        wa_vs_sms: "Cliquez sur OK pour envoyer par WHATSAPP \nCliquez sur ANNULER pour envoyer par SMS DIRECT",
        empty_search: "Aucun contact trouvé.",
        export_btn: "📥 Télécharger le Rapport Excel",
        input_notes: "Notes (ex: intéressé par la jeunesse...)",
        theme_toggle_dark: "Mode sombre",
        theme_toggle_light: "Mode clair",
        added_on: "Ajouté le",
        relaunch_title: "Quel message envoyer ?",
        level_1_btn: "Niv 1 : Prise de contact",
        level_2_btn: "Niv 2 : Présentation Église",
        level_3_btn: "Niv 3 : Invitation Culte"
    },
    en: {
        welcome: "Welcome",
        subtitle_evangelism: "Union Des Assemblées Maison de Grâce",
        title_evangelism: "UDAMG Evangelism",
        quote_evangelism: '"Saved by Grace to Save"',
        choose_family: "Choose a family",
        under_18: "Under 18 years",
        age_18_30: "18 - 30 years",
        over_30: "Over 30 years",
        dashboard_btn: "📊 DASHBOARD",
        family: "Family",
        search_placeholder: "Search for a name...",
        back_stats: "←",
        global_stats: "Global Statistics",
        total_souls: "TOTAL SOULS REACHED",
        family_ranking: "FAMILY RANKING",
        followup_quality: "FOLLOW-UP QUALITY BY FAMILY",
        restarted: "🔴 Followed-up",
        presented: "🟡 Presented",
        invited: "🟢 Invited",
        new_contact: "New Contact",
        input_last_name: "Last Name",
        input_first_name: "First Name",
        input_phone: "Phone Number",
        input_evangelist: "Your Name (Evangelist)",
        cancel: "Cancel",
        save: "Save",
        alert_fill_fields: "Oops! Please fill in the last name, first name, and phone number.",
        remove_confirm: "Do you really want to remove this contact?",
        level: "Lvl",
        phone_abbr: "Ph",
        relaunch: "FOLLOW-UP",
        msg_level1: "Hello {prenom}, this is {referent} from UDAMG. Nice to meet you! Let's stay in touch. See you soon!",
        msg_level2: "Hi {prenom}! Here is a presentation of our church: https://ccmg.fr. A great family awaits you!",
        msg_level3: "Hello {prenom}! We have a great service this Sunday at 10am. I would love to see you there. Are you available?",
        wa_vs_sms: "Click OK to send via WHATSAPP \nClick CANCEL to send via DIRECT SMS",
        empty_search: "No contacts found.",
        export_btn: "📥 Download Excel Report",
        input_notes: "Notes (e.g. interested in youth group...)",
        theme_toggle_dark: "Dark mode",
        theme_toggle_light: "Light mode",
        added_on: "Added on",
        relaunch_title: "Which message to send?",
        level_1_btn: "Lvl 1 : Follow-up",
        level_2_btn: "Lvl 2 : Church Presentation",
        level_3_btn: "Lvl 3 : Service Invitation"
    }
};

// Langue par défaut
let currentLang = localStorage.getItem('ccmg_lang') || 'fr';

/**
 * Change la langue de l'application et met à jour l'interface
 */
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ccmg_lang', lang);
    applyTranslations();
    
    // Mettre à jour les styles des boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${lang}'`)) {
            btn.classList.add('active');
        }
    });
}

/**
 * Retourne la traduction de la clé demandée
 */
function t(key) {
    return translations[currentLang][key] || key;
}

/**
 * Applique toutes les traductions aux éléments possédant l'attribut data-i18n
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        
        // Pour les inputs, on modifie le placeholder
        if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'tel')) {
            el.placeholder = t(key);
        } else {
            // Pour le reste, on modifie le texte
            el.innerText = t(key);
        }
    });

    // Gère le titre de la liste s'il est affiché
    const titreListe = document.getElementById('titre-liste-famille');
    if (titreListe && typeof familleActuelle !== 'undefined' && familleActuelle !== "") {
        titreListe.innerText = t("family") + " " + familleActuelle;
    }
    
    // Si nous sommes sur l'écran liste, nous devons re-rendre la liste pour traduire les boutons "RELANCER"
    if (typeof afficherContacts === 'function' && document.getElementById('page-liste').classList.contains('active')) {
        afficherContacts();
    }
}

// Initialisation de la langue au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});
