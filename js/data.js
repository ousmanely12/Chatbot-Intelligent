/* =================================================================
   MODULE 3 : GESTION DES DONNÉES JSON
   Fichier: js/data.js
   
   Ce fichier gère :
   - Le chargement des données depuis students.json
   - La recherche et le filtrage
   - La génération de réponses selon les modes
   - L'interprétation des questions
   ================================================================= */

// Variable globale pour stocker les données
let studentsData = null;

// ============================================
// 1. CHARGEMENT DES DONNÉES
// ============================================

/**
 * Charge les données des étudiants depuis le fichier JSON
 * @returns {Promise<Object>} Les données chargées ou null si erreur
 */
async function chargerDonneesEtudiants() {
    try {
        console.log('📥 Chargement des données étudiants...');
        
        const response = await fetch('data/student.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validation basique
        if (!data.etudiants || !Array.isArray(data.etudiants)) {
            throw new Error('Format de données invalide');
        }
        
        studentsData = data;
        console.log(`✅ ${data.etudiants.length} étudiants chargés depuis ${data.etablissement}`);
        
        return data;
        
    } catch (error) {
        console.error('❌ Erreur de chargement:', error);
        return null;
    }
}

/**
 * Vérifie si les données sont chargées
 * @returns {boolean}
 */
function donneesChargees() {
    return studentsData !== null && studentsData.etudiants && studentsData.etudiants.length > 0;
}

// ============================================
// 2. FONCTIONS DE RECHERCHE
// ============================================

/**
 * Recherche un étudiant par son nom ou prénom
 * @param {string} nom - Nom ou prénom à rechercher
 * @returns {Array} Liste des étudiants correspondants
 */
function rechercherEtudiant(nom) {
    if (!donneesChargees()) {
        console.error('Données non chargées');
        return [];
    }
    
    const nomLower = nom.toLowerCase().trim();
    
    return studentsData.etudiants.filter(etudiant => {
        const prenomMatch = etudiant.prenom.toLowerCase().includes(nomLower);
        const nomMatch = etudiant.nom.toLowerCase().includes(nomLower);
        const nomComplet = `${etudiant.prenom} ${etudiant.nom}`.toLowerCase();
        const nomCompletInverse = `${etudiant.nom} ${etudiant.prenom}`.toLowerCase();
        
        return prenomMatch || nomMatch || 
               nomComplet.includes(nomLower) || 
               nomCompletInverse.includes(nomLower);
    });
}

/**
 * Trouve un étudiant par son ID
 * @param {number} id - ID de l'étudiant
 * @returns {Object|null} L'étudiant trouvé ou null
 */
function trouverParId(id) {
    if (!donneesChargees()) return null;
    return studentsData.etudiants.find(e => e.id === id);
}

/**
 * Filtre les étudiants par filière
 * @param {string} filiere - Nom de la filière
 * @returns {Array} Liste des étudiants de cette filière
 */
function filtrerParFiliere(filiere) {
    if (!donneesChargees()) return [];
    
    const filiereLower = filiere.toLowerCase();
    return studentsData.etudiants.filter(e => 
        e.filiere.toLowerCase().includes(filiereLower)
    );
}

/**
 * Trouve les étudiants qui ont un intérêt spécifique
 * @param {string} interet - L'intérêt recherché
 * @returns {Array} Liste des étudiants
 */
function filtrerParInteret(interet) {
    if (!donneesChargees()) return [];
    
    const interetLower = interet.toLowerCase();
    return studentsData.etudiants.filter(e =>
        e.interets.some(i => i.toLowerCase().includes(interetLower))
    );
}

/**
 * Obtient un étudiant aléatoire
 * @returns {Object|null} Un étudiant aléatoire
 */
function etudiantAleatoire() {
    if (!donneesChargees()) return null;
    const index = Math.floor(Math.random() * studentsData.etudiants.length);
    return studentsData.etudiants[index];
}

/**
 * Obtient un fun fact aléatoire d'un étudiant
 * @param {Object} etudiant - L'étudiant
 * @returns {string} Un fun fact aléatoire
 */
function funFactAleatoire(etudiant) {
    if (!etudiant || !etudiant.funFacts || etudiant.funFacts.length === 0) {
        return "Pas de fun fact disponible";
    }
    const index = Math.floor(Math.random() * etudiant.funFacts.length);
    return etudiant.funFacts[index];
}

// ============================================
// 3. GÉNÉRATION DE RÉPONSES
// ============================================

/**
 * Génère une présentation d'un étudiant selon le mode
 * @param {Object} etudiant - L'étudiant à présenter
 * @param {string} mode - Le mode (naturel, roast, sympathique, philosophique)
 * @returns {string} La présentation formatée
 */
function presenterEtudiant(etudiant, mode = 'naturel') {
    switch(mode) {
        case 'roast':
            return genererPresentationRoast(etudiant);
        case 'sympathique':
            return genererPresentationSympathique(etudiant);
        case 'philosophique':
            return genererPresentationPhilosophique(etudiant);
        default:
            return genererPresentationNaturelle(etudiant);
    }
}

function genererPresentationNaturelle(e) {
    return `
📋 **${e.prenom} ${e.nom}** (${e.age} ans) ${e.photo}

🎓 **Formation :** ${e.filiere} - ${e.niveau}

👤 **Personnalité :** ${e.personnalite.traits.join(', ')}
💪 **Force :** ${e.personnalite.force}
😅 **Faiblesse :** ${e.personnalite.faiblesse}

✨ **Fun Facts :**
${e.funFacts.map(f => `• ${f}`).join('\n')}

🎯 **Intérêts :** ${e.interets.join(', ')}

💬 **Citation :** "${e.citation}"

📊 **Stats :** ${e.statistiques.projetsRealises} projets | ${e.statistiques.cafeParJour} ☕/jour | ${e.statistiques.lignesDeCode.toLocaleString()} lignes de code
    `.trim();
}

function genererPresentationRoast(e) {
    const roasts = [
        `${e.prenom} ${e.nom} ? Ah oui, le/la "${e.personnalite.traits[0]}" ! On a remarqué surtout le "${e.personnalite.faiblesse}" 😏🔥`,
        `En ${e.filiere} ? Original... comme les ${studentsData.etudiants.filter(et => et.filiere === e.filiere).length} autres ! 🙄`,
        `${e.statistiques.cafeParJour} cafés par jour ? C'est pas du sang qui coule dans tes veines, c'est de l'arabica ! ☕😂`,
        `Fun fact numéro 1 : "${e.funFacts[0]}". Cool story bro, j'ai failli m'endormir. 😴💀`,
        `"${e.citation}" - Profond. T'as trouvé ça sur Instagram ? 😏`,
        `${e.statistiques.projetsRealises} projets et ${e.statistiques.lignesDeCode} lignes de code... mais combien de bugs ? 🐛🔥`
    ];
    return roasts.join('\n\n');
}

function genererPresentationSympathique(e) {
    return `
Oh ${e.prenom} ! 💖 Quelle personne formidable !

${e.prenom} est tellement ${e.personnalite.traits[0]}, ${e.personnalite.traits[1]} et ${e.personnalite.traits[2]} ! C'est juste INCROYABLE ! 🌟✨

**Fun fact adorable :** ${e.funFacts[0]} 🥰

En ${e.filiere}, ${e.prenom} brille vraiment ! Avec ${e.statistiques.projetsRealises} projets à son actif, c'est tout simplement EXCEPTIONNEL ! 👏💫

Sa citation préférée : "${e.citation}" - Tellement inspirant ! 💕

Un vrai talent en ${e.personnalite.force} ! Le monde a vraiment besoin de plus de personnes comme ${e.prenom} ! 🌈💖

${e.prenom}, tu es une star ! ⭐
    `.trim();
}

function genererPresentationPhilosophique(e) {
    return `
🧘 Contemplons l'essence de ${e.prenom} ${e.nom}...

Dans ce monde numérique en perpétuelle mutation, que signifie vraiment être "${e.personnalite.traits[0]}" ? N'est-ce pas là une construction sociale ? 🤔

${e.prenom} poursuit l'étude de ${e.filiere}... Mais la connaissance est-elle une destination ou un voyage sans fin ? 📚💭

"${e.citation}" - Ces mots résonnent-ils avec une vérité universelle, ou ne sont-ils que l'écho de notre propre subjectivité ? 

${e.statistiques.lignesDeCode} lignes de code écrites... Chaque ligne est-elle une pensée matérialisée dans le monde digital, ou simplement des instructions pour une machine dénuée de conscience ? 🖥️✨

La dichotomie entre sa force (${e.personnalite.force}) et sa faiblesse (${e.personnalite.faiblesse}) n'est-elle pas qu'une question de perspective temporelle ? 

Qui est vraiment ${e.prenom} ? Qui sommes-nous tous ? 🌅🔮
    `.trim();
}

// ============================================
// 4. STATISTIQUES ET ANALYSES
// ============================================

/**
 * Calcule les statistiques globales
 * @returns {Object} Les statistiques
 */
function calculerStatistiques() {
    if (!donneesChargees()) return null;
    
    const etudiants = studentsData.etudiants;
    
    return {
        total: etudiants.length,
        ageMoyen: (etudiants.reduce((sum, e) => sum + e.age, 0) / etudiants.length).toFixed(1),
        
        parFiliere: etudiants.reduce((acc, e) => {
            acc[e.filiere] = (acc[e.filiere] || 0) + 1;
            return acc;
        }, {}),
        
        totalProjets: etudiants.reduce((sum, e) => sum + e.statistiques.projetsRealises, 0),
        totalCafes: etudiants.reduce((sum, e) => sum + e.statistiques.cafeParJour, 0),
        totalLignesCode: etudiants.reduce((sum, e) => sum + e.statistiques.lignesDeCode, 0),
        
        plusProductif: etudiants.reduce((max, e) => 
            e.statistiques.projetsRealises > max.statistiques.projetsRealises ? e : max
        ),
        
        plusCafeine: etudiants.reduce((max, e) => 
            e.statistiques.cafeParJour > max.statistiques.cafeParJour ? e : max
        )
    };
}

/**
 * Trouve les intérêts les plus populaires
 * @returns {Array} Top 5 des intérêts
 */
function interetsPopulaires() {
    if (!donneesChargees()) return [];
    
    const compteur = {};
    
    studentsData.etudiants.forEach(etudiant => {
        etudiant.interets.forEach(interet => {
            compteur[interet] = (compteur[interet] || 0) + 1;
        });
    });
    
    return Object.entries(compteur)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([interet, count]) => ({ interet, count }));
}

// ============================================
// 5. INTERPRÉTATION DES QUESTIONS
// ============================================

/**
 * Interprète une question de l'utilisateur
 * @param {string} question - La question posée
 * @returns {Object} L'intention détectée et les paramètres
 */
function interpreterQuestion(question) {
    const q = question.toLowerCase().trim();
    
    // Détection : "Qui est..." ou "Parle-moi de..."
    if (q.includes('qui est') || q.includes('parle') || q.includes('connais') || q.includes('présente')) {
        const nom = extraireNom(question);
        return { type: 'presentation', nom };
    }
    
    // Détection : "Fun fact..."
    if (q.includes('fun fact') || q.includes('anecdote')) {
        const nom = extraireNom(question);
        return { type: 'funfact', nom };
    }
    
    // Détection : POTINS/GOSSIP
    if (q.includes('potin') || q.includes('gossip') || q.includes('rumeur') || q.includes('ragot')) {
        if (q.includes('aléatoire') || q.includes('hasard') || q.includes('random')) {
            return { type: 'potin-aleatoire' };
        }
        
        // Potins sur quelqu'un
        const nom = extraireNom(question);
        if (nom) {
            return { type: 'potin-personne', nom };
        }
        
        // Potins par catégorie
        if (q.includes('romance') || q.includes('amour') || q.includes('couple')) {
            return { type: 'potin-categorie', categorie: 'romance' };
        }
        if (q.includes('drôle') || q.includes('drole') || q.includes('marrant')) {
            return { type: 'potin-categorie', categorie: 'drole' };
        }
        
        return { type: 'potin-aleatoire' };
    }
    
    // Détection : ÉVÉNEMENTS
    if (q.includes('événement') || q.includes('evenement') || q.includes('event')) {
        if (q.includes('dernier') || q.includes('récent') || q.includes('recent')) {
            return { type: 'dernier-evenement' };
        }
        if (q.includes('hackathon')) {
            return { type: 'evenement-type', typeEvent: 'hackathon' };
        }
        if (q.includes('competition')) {
            return { type: 'evenement-type', typeEvent: 'competition' };
        }
        return { type: 'liste-evenements' };
    }
    
    // Détection : LIEUX
    if (q.includes('lieu') || q.includes('salle') || q.includes('où') || q.includes('ou')) {
        if (q.includes('cantine') || q.includes('manger')) {
            return { type: 'lieu', lieu: 'cantine' };
        }
        if (q.includes('labo') || q.includes('laboratoire')) {
            return { type: 'lieu', lieu: 'labInfo' };
        }
        if (q.includes('b201') || q.includes('qg')) {
            return { type: 'lieu', lieu: 'salleFavorite' };
        }
        return { type: 'liste-lieux' };
    }
    
    // Détection : TRADITIONS
    if (q.includes('tradition') || q.includes('habitude') || q.includes('rituel')) {
        return { type: 'traditions' };
    }
    
    // Détection : RELATIONS
    if (q.includes('meilleur ami') || q.includes('meilleure amie') || q.includes('bff')) {
        const nom = extraireNom(question);
        return { type: 'meilleur-ami', nom };
    }
    
    if (q.includes('crush') || q.includes('amoure') || q.includes('amour')) {
        const nom = extraireNom(question);
        if (nom) {
            return { type: 'crush', nom };
        }
        return { type: 'potin-categorie', categorie: 'romance' };
    }
    
    // Détection : "Combien..." ou "Stats..."
    if (q.includes('combien') || q.includes('stats') || q.includes('statistiques')) {
        return { type: 'statistiques' };
    }
    
    // Détection : "Liste..." ou "Tous les..."
    if (q.includes('liste') || q.includes('tous les') || q.includes('toutes les')) {
        return { type: 'liste' };
    }
    
    // Détection : "Aléatoire" ou "Au hasard"
    if (q.includes('aléatoire') || q.includes('hasard') || q.includes('random') || q.includes('surprise')) {
        return { type: 'aleatoire' };
    }
    
    // Détection : "Qui aime..." ou "Qui s'intéresse..."
    if (q.includes('qui aime') || q.includes('qui adore') || q.includes('intéresse')) {
        const interet = extraireInteret(question);
        return { type: 'recherche-interet', interet };
    }
    
    // Détection : "Top" ou "Meilleur" ou "Plus"
    if (q.includes('top') || q.includes('meilleur') || q.includes('plus productif') || q.includes('champion')) {
        return { type: 'top' };
    }
    
    // Détection : Filière
    const filieres = ['informatique', 'cyber', 'sécurité', 'réseau', 'web', 'data', 'mobile', 'ia', 'intelligence', 'devops'];
    for (const filiere of filieres) {
        if (q.includes(filiere)) {
            return { type: 'filiere', filiere };
        }
    }
    
    return { type: 'inconnu' };
}

/**
 * Extrait un nom d'une question
 * @param {string} question - La question
 * @returns {string} Le nom extrait ou chaîne vide
 */
function extraireNom(question) {
    // Patterns pour extraire le nom
    const patterns = [
        /qui est (.+?)[\?\.!]/i,
        /parle.*?de (.+?)[\?\.!]/i,
        /à propos de (.+?)[\?\.!]/i,
        /connais.*?(.+?)[\?\.!]/i,
        /fun fact.*?(.+?)[\?\.!]/i,
        /présente.*?(.+?)[\?\.!]/i
    ];
    
    for (const pattern of patterns) {
        const match = question.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    // Si pas de pattern, prendre les mots après certains mots-clés
    const mots = question.toLowerCase().split(' ');
    const indexQui = mots.indexOf('qui');
    const indexEst = mots.indexOf('est');
    const indexDe = mots.indexOf('de');
    
    if (indexQui > -1 && indexEst > indexQui) {
        return mots.slice(indexEst + 1).join(' ').replace(/[?\.!]/g, '').trim();
    }
    
    if (indexDe > -1) {
        return mots.slice(indexDe + 1).join(' ').replace(/[?\.!]/g, '').trim();
    }
    
    return '';
}

/**
 * Extrait un intérêt d'une question
 * @param {string} question - La question
 * @returns {string} L'intérêt extrait
 */
function extraireInteret(question) {
    const patterns = [
        /qui aime (.+?)[\?\.!]/i,
        /qui adore (.+?)[\?\.!]/i,
        /intéresse.*?(.+?)[\?\.!]/i
    ];
    
    for (const pattern of patterns) {
        const match = question.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return '';
}

// ============================================
// 6. GESTION DES ÉVÉNEMENTS
// ============================================

/**
 * Récupère tous les événements
 * @returns {Array} Liste des événements
 */
function obtenirEvenements() {
    if (!donneesChargees() || !studentsData.evenements) return [];
    return studentsData.evenements;
}

/**
 * Trouve un événement par son type
 * @param {string} type - Type d'événement (competition, social, academique, incident)
 * @returns {Array} Événements du type demandé
 */
function filtrerEvenementsParType(type) {
    const evenements = obtenirEvenements();
    return evenements.filter(e => e.type.toLowerCase() === type.toLowerCase());
}

/**
 * Obtient le dernier événement
 * @returns {Object|null} Le dernier événement
 */
function dernierEvenement() {
    const evenements = obtenirEvenements();
    if (evenements.length === 0) return null;
    
    // Trier par date (plus récent en premier)
    const sorted = evenements.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0];
}

/**
 * Présente un événement de manière détaillée
 * @param {Object} evenement - L'événement à présenter
 * @returns {string} La présentation formatée
 */
function presenterEvenement(evenement) {
    const date = new Date(evenement.date);
    const dateFormatee = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    let message = `
🎉 **${evenement.titre}**
📅 ${dateFormatee}
🏷️ Type : ${evenement.type}

📝 ${evenement.description}
`;

    if (evenement.participants) {
        message += `\n👥 **Participants :** ${evenement.participants.join(', ')}`;
    }
    
    if (evenement.gagnant) {
        message += `\n🏆 **Gagnant :** ${evenement.gagnant}`;
    }
    
    if (evenement.prix) {
        message += `\n💰 **Prix :** ${evenement.prix}`;
    }
    
    if (evenement.anecdotes && evenement.anecdotes.length > 0) {
        message += `\n\n✨ **Anecdotes :**`;
        evenement.anecdotes.forEach(anecdote => {
            message += `\n• ${anecdote}`;
        });
    }
    
    return message.trim();
}

// ============================================
// 7. GESTION DES POTINS (GOSSIP)
// ============================================

/**
 * Récupère tous les potins
 * @returns {Array} Liste des potins
 */
function obtenirPotins() {
    if (!donneesChargees() || !studentsData.potins) return [];
    return studentsData.potins;
}

/**
 * Filtre les potins par catégorie
 * @param {string} categorie - Catégorie (romance, competition, mystère, drole)
 * @returns {Array} Potins de la catégorie
 */
function filtrerPotinsParCategorie(categorie) {
    const potins = obtenirPotins();
    return potins.filter(p => p.categorie.toLowerCase() === categorie.toLowerCase());
}

/**
 * Obtient un potin aléatoire
 * @returns {Object|null} Un potin aléatoire
 */
function potinAleatoire() {
    const potins = obtenirPotins();
    if (potins.length === 0) return null;
    
    const index = Math.floor(Math.random() * potins.length);
    return potins[index];
}

/**
 * Présente un potin avec style
 * @param {Object} potin - Le potin à présenter
 * @param {string} mode - Le mode de conversation
 * @returns {string} La présentation formatée
 */
function presenterPotin(potin, mode = 'naturel') {
    const emojis = {
        romance: '💕',
        competition: '⚔️',
        mystere: '🔍',
        drole: '😂'
    };
    
    const emoji = emojis[potin.categorie] || '📰';
    
    let message = '';
    
    switch(mode) {
        case 'roast':
            message = `
${emoji} **GOSSIP ALERT** ${emoji}

**${potin.titre}**

Alors là, accrochez-vous ! 🔥

${potin.description}

Niveau de drama : ${potin.niveau}

**Les détails croustillants :**
${potin.details.map(d => `• ${d} 💀`).join('\n')}

Voilà, maintenant vous savez tout ! 😏🍿
            `.trim();
            break;
            
        case 'sympathique':
            message = `
${emoji} **Petite histoire mignonne** ${emoji}

**${potin.titre}** 💖

${potin.description}

C'est trop chou ! 🥰

**Ce qui se passe :**
${potin.details.map(d => `• ${d} ✨`).join('\n')}

Aww, j'adore ces histoires ! 💕
            `.trim();
            break;
            
        case 'philosophique':
            message = `
${emoji} **Contemplons les relations humaines** ${emoji}

**${potin.titre}**

${potin.description}

Mais qu'est-ce que l'amour, sinon une construction sociale ? 🤔

**Observations :**
${potin.details.map(d => `• ${d}`).join('\n')}

L'attraction mutuelle n'est-elle pas une danse cosmique ? 💭
            `.trim();
            break;
            
        default: // naturel
            message = `
${emoji} **${potin.titre}**

${potin.description}

📊 Niveau : ${potin.niveau}

**Les détails :**
${potin.details.map(d => `• ${d}`).join('\n')}
            `.trim();
    }
    
    return message;
}

/**
 * Trouve les potins liés à un étudiant
 * @param {string} nom - Nom de l'étudiant
 * @returns {Array} Potins concernant cet étudiant
 */
function potinsConcernant(nom) {
    const potins = obtenirPotins();
    const nomLower = nom.toLowerCase();
    
    return potins.filter(potin => {
        const texteComplet = (potin.titre + ' ' + potin.description + ' ' + potin.details.join(' ')).toLowerCase();
        return texteComplet.includes(nomLower);
    });
}

// ============================================
// 8. GESTION DES LIEUX ET TRADITIONS
// ============================================

/**
 * Présente un lieu de l'école
 * @param {string} nomLieu - Nom du lieu
 * @returns {string} Description du lieu
 */
function presenterLieu(nomLieu) {
    if (!donneesChargees() || !studentsData.lieux) {
        return "Pas d'infos sur les lieux 🤷";
    }
    
    const lieuKey = nomLieu.toLowerCase().replace(/\s/g, '');
    const lieu = studentsData.lieux[lieuKey];
    
    if (!lieu) {
        // Lister tous les lieux disponibles
        const lieux = Object.values(studentsData.lieux);
        return `Lieux disponibles : ${lieux.map(l => l.nom).join(', ')}`;
    }
    
    let message = `
📍 **${lieu.nom}**
`;
    
    if (lieu.surnom) {
        message += `🏷️ Surnom : "${lieu.surnom}"\n`;
    }
    
    message += `\n${lieu.description}\n`;
    
    if (lieu.anecdotes) {
        message += `\n✨ **Anecdotes :**\n`;
        lieu.anecdotes.forEach(a => {
            message += `• ${a}\n`;
        });
    }
    
    if (lieu.platPreferé) {
        message += `\n🍽️ **Plat préféré :** ${lieu.platPreferé}`;
    }
    
    return message.trim();
}

/**
 * Liste toutes les traditions de l'école
 * @returns {string} Liste des traditions
 */
function listerTraditions() {
    if (!donneesChargees() || !studentsData.traditions) {
        return "Pas de traditions enregistrées 🤷";
    }
    
    let message = `🎭 **Traditions de l'école :**\n\n`;
    
    studentsData.traditions.forEach((tradition, index) => {
        message += `${index + 1}. **${tradition.nom}**\n`;
        message += `   ${tradition.description}\n`;
        if (tradition.origine) {
            message += `   📜 Origine : ${tradition.origine}\n`;
        }
        message += '\n';
    });
    
    return message.trim();
}

// ============================================
// 9. MESSAGES DE DEBUG
// ============================================

console.log(`
╔═══════════════════════════════════════╗
║     📊 MODULE DATA.JS CHARGÉ         ║
║   Gestion complète des données       ║
║   • Étudiants                        ║
║   • Événements                       ║
║   • Potins (Gossip)                  ║
║   • Lieux & Traditions               ║
╚═══════════════════════════════════════╝
`);
