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
        global_stats: "Bilan (Cette Église/Programme)",
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
        input_evangelist: "Evangélisé par",
        cancel: "Annuler",
        save: "Enregistrer",
        alert_fill_fields: "Oups ! Remplis bien le nom, le prénom et le numéro.",
        remove_confirm: "Voulez-vous vraiment retirer ce contact ?",
        level: "Niv",
        phone_abbr: "Tél",
        relaunch: "RELANCER",
        msg_level1: `Bonjour {prenom} 🙏

Vous avez été approché(e) par {referent} qui fait partie de notre équipe d’évangélisation, et nous rendons grâce à Dieu pour cette rencontre, convaincus qu’elle n’est point le fruit du hasard, mais l’expression de Son amour pour vous.

Pour nous connaître un peu plus et afin d’être régulièrement édifié(e), nous vous invitons à nous rejoindre sur nos différents canaux :

👉 WhatsApp : https://whatsapp.com/channel/0029Vb70A780rGiN3kXVCU13
👉 Facebook : https://www.facebook.com/ccmgangersfrance
👉 Instagram : https://www.instagram.com/ccmg.angers
👉 TikTok : https://www.tiktok.com/@ccmg_angers

Que la grâce, la paix et l’amour de notre Seigneur Jésus-Christ reposent abondamment sur vous.
Soyez richement béni(e) ✨

Équipe d’évangélisation du CCMG ANGERS`,
        msg_level2: `Bonsoir {prenom}🙏

C'est avec joie que nous revenons vers vous — l'équipe d'évangélisation de l'église CCMG Angers. Nous espérons que vous allez bien, par la grâce de Dieu.

Nous souhaitons vous encourager à garder en mémoire que le Seigneur vous aime profondément et qu'Il a pour votre vie des desseins de paix, d'espérance et de gloire.

📅 Nos programmes de la semaine
🔵 Tous les mercredis (19h - 21h) : Enseignement biblique suivi de questions/réponses.

🔵 Tous les dimanches (10h - 12h30) : Culte de célébration.

Nous nous préparons à vous recevoir et espérons de tout cœur que vous serez présent à l'un de nos programmes !

📍 Coordonnées et Accès
Adresse : 3 rue Carl Linné, 49000 Angers

Pour nous rejoindre, voici les différents moyens de transport :

🚋 Tram Ligne A ou C : Direction Roseraie, descendre au terminus Roseraie (compter environ 10 min de marche).

🚌 Bus Ligne 3 : Direction Mûrs-Erigné, descendre à l'arrêt Allard (environ 5 min de marche vers l'église).

🚌 Bus Ligne 5a ou 5b : Direction Aquavita, descendre à l'arrêt Cevert (l'église se trouve juste à côté).

Si vous avez des questions, n'hésitez pas à me contacter ou à joindre le secrétariat de l'église au 06 35 38 07 58.

Que Dieu vous bénisse !
L'équipe d'évangélisation du CCMG Angers`,
        msg_level3: `Bonjour {prenom} 🙏

👉 Que diriez-vous, cette fois-ci, de venir nous rencontrer à l’église {nom_eglise} ce dimanche ?

Nous aimerions vous inviter chaleureusement à venir célébrer Dieu avec nous ce dimanche à partir de 10h 🙌

« Je suis dans la joie quand on me dit : Allons à la maison de l’Éternel ! » (Psaume 122:1) ✨

Ce sera un moment de paix, de joie et de bénédiction dans la présence de Dieu. Votre présence sera une grande joie pour nous !

Au plaisir de vous y voir 😊
Que Dieu vous bénisse 🙏`,
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
        level_3_btn: "Niv 3 : Invitation Culte",
        level_4_btn: "Niv 4 : Invitation Dernière Minute",
        msg_level4: `Bonjour {prenom} 🙏

Nous espérons que tu vas bien par la grâce de Dieu ✨

👉 Et si tu venais nous rencontrer ce dimanche ?
Nous serions ravis de t’accueillir à l’église {nom_eglise} à partir de 10h 🙌

📍 ce sera un moment pour te recentrer et te reconnecter à l’essentiel
💬 Une parole inspirée qui parle à ton cœur
🤝 Une communauté chaleureuse prête à t’accueillir

Peu importe d’où tu viens ou avec qui tu viens… il y a une place pour toi ❤️

📍 {adresse_eglise}
🚋 Tram A ou C : Terminus Roseraie (10 min de marche)
🚌 Bus 3 : arrêt Allard (5 min de marche)
🚌 Bus 5a / 5b : arrêt Cevert (juste en face)

📞 06 35 38 07 58

Au plaisir de te voir 😊
Que Dieu te bénisse 🙏

Rappel : 
📅 Nos programmes de la semaine
🔵 Mercredi (19h - 21h) : Enseignement biblique + échanges
🔵 Dimanche (10h - 12h30) : Culte de célébration

Équipe d’évangélisation du {nom_eglise}`
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
        level_3_btn: "Lvl 3 : Service Invitation",
        level_4_btn: "Lvl 4 : Last-minute Invitation",
        msg_level4: "Hello {prenom}! It's not too late to join us tomorrow at 10am at {nom_eglise}. We would be so happy to welcome you! God bless you."
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
