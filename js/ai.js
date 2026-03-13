/* =================================================================
   MODULE 4 : INTÉGRATION IA
   Fichier: js/ai.js
   
   Ce fichier gère l'appel aux APIs LLM
   ================================================================= */

// ============================================
// 1. CONFIGURATION
// ============================================

// Vérifier que la config est chargée
if (typeof API_CONFIG === 'undefined') {
    console.error('❌ config.js non chargé !');
}

const AI_CONFIG = {
    maxTokens: 300,
    temperature: 0.7,
    timeout: 30000 // 30 secondes
};

// ============================================
// 2. APPEL API HUGGING FACE
// ============================================

/**
 * Appelle l'API Hugging Face
 * @param {string} prompt - Le prompt à envoyer
 * @returns {Promise<string>} La réponse générée
 */
async function appelHuggingFace(prompt) {
    const { apiKey, model } = API_CONFIG.groq; // ✅ utilise groq

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: AI_CONFIG.maxTokens,
            temperature: AI_CONFIG.temperature
        })
    });
    const data = await response.json();
    console.log("🔍 Réponse Groq complète:", data); // ✅ AJOUTE ÇA
    
    if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
    }
    throw new Error('Format de réponse inattendu');
}

// ============================================
// 3. NETTOYAGE DES RÉPONSES
// ============================================

/**
 * Nettoie la réponse de l'IA
 * @param {string} reponse - Réponse brute
 * @returns {string} Réponse nettoyée
 */
function nettoyerReponse(reponse) {
    let cleaned = reponse.trim();
    
    // Retirer les balises de modèle
    cleaned = cleaned.replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '');
    
    // Retirer les instructions système répétées
    cleaned = cleaned.replace(/^(Tu es|You are).*?\n\n/s, '');
    
    // Limiter à 5 lignes maximum
    const lines = cleaned.split('\n').filter(l => l.trim());
    if (lines.length > 5) {
        cleaned = lines.slice(0, 5).join('\n');
    }
    
    return cleaned.trim();
}

// ============================================
// 4. MESSAGE DE DEBUG j ai pas encore vu ce message
// ============================================

console.log(`
╔═══════════════════════════════════════╗
║     🤖 MODULE IA CHARGÉ              ║
║   Provider: ${API_CONFIG.provider}        ║
╚═══════════════════════════════════════╝
`);

// ============================================
// 5. GÉNÉRATION DE PROMPTS
// ============================================

/**
 * Génère le prompt système selon le mode
 * @param {string} mode - Le mode (naturel, roast, sympathique, philosophique)
 * @returns {string} Instructions système
 */
function genererPromptSysteme(mode) {
    const prompts = {
        naturel: `Tu es un assistant amical qui présente des étudiants d'une école d'informatique.
Sois informatif, concis et sympathique.
Utilise des emojis de manière modérée.
Limite ta réponse à 4-5 phrases maximum.`,

        roast: `Tu es un chatbot taquin qui fait du "roasting" gentil et drôle.
RÈGLES STRICTES :
- Sois drôle mais JAMAIS méchant
- Taquine sur les habitudes (café, procrastination, etc.)
- Reste bon enfant et respectueux
- Utilise des emojis : 🔥 😏 💀 😂
- Maximum 5 phrases courtes`,

        sympathique: `Tu es un chatbot ultra-positif et enthousiaste !
STYLE REQUIS :
- TRÈS positif et encourageant
- Beaucoup d'emojis mignons : 💖 ✨ 🥰 🌟 💕
- Complimente tout
- Exprime de l'admiration et de la joie
- Maximum 5 phrases`,

        philosophique: `Tu es un chatbot philosophe qui réfléchit profondément.
STYLE :
- Pose des questions existentielles
- Utilise des métaphores
- Ton contemplatif
- Emojis : 🤔 💭 🧘 ✨
- Maximum 5 phrases profondes`
    };
    
    return prompts[mode] || prompts.naturel;
}

/**
 * Génère le prompt complet avec contexte
 * @param {string} question - Question de l'utilisateur
 * @param {Object} contexte - Données pertinentes
 * @param {string} mode - Mode de réponse
 * @returns {string} Prompt complet
 */
function genererPromptComplet(question, contexte, mode) {
    let prompt = genererPromptSysteme(mode) + '\n\n';
    
    // Ajouter le contexte s'il existe
    if (contexte) {
        prompt += 'INFORMATIONS À UTILISER :\n';
        prompt += JSON.stringify(contexte, null, 2);
        prompt += '\n\n';
    }
    
    prompt += `QUESTION DE L'UTILISATEUR :\n"${question}"\n\n`;
    prompt += `RÉPONSE (en français, style ${mode}) :\n`;
    
    return prompt;
}
`
✅ **Test dans la Console** :
`
console.log(genererPromptSysteme('roast'));

// ============================================
// 6. RAG (RETRIEVAL AUGMENTED GENERATION)
// ============================================

/**
 * Récupère les informations pertinentes selon la question
 * @param {string} question - Question de l'utilisateur
 * @returns {Object} Contexte pertinent
 */
function recupererContexte(question) {
    if (!donneesChargees()) {
        return null;
    }
    
    const intent = interpreterQuestion(question);
    let contexte = {
        etablissement: studentsData.etablissement,
        totalEtudiants: studentsData.stats.totalEtudiants
    };
    
    // Informations sur un étudiant spécifique
    if (intent.nom) {
        const etudiants = rechercherEtudiant(intent.nom);
        if (etudiants.length > 0) {
            contexte.etudiant = etudiants[0];
        }
    }
    
    // Événements
    if (question.toLowerCase().includes('événement') || 
        question.toLowerCase().includes('hackathon')) {
        contexte.dernierEvenement = dernierEvenement();
    }
    
    // Potins
    if (question.toLowerCase().includes('potin') || 
        question.toLowerCase().includes('gossip')) {
        contexte.potin = potinAleatoire();
    }
    
    // Statistiques
    if (intent.type === 'statistiques') {
        contexte.stats = calculerStatistiques();
    }
    
    return contexte;
}

/**
 * Génère une réponse avec IA et RAG
 * @param {string} question - Question de l'utilisateur
 * @param {string} mode - Mode de réponse
 * @returns {Promise<string>} Réponse générée
 */
async function genererReponseIA(question, mode = 'naturel') {
    try {
        // 1. Récupérer le contexte pertinent (RAG)
        const contexte = recupererContexte(question);
        
        // 2. Générer le prompt
        const prompt = genererPromptComplet(question, contexte, mode);
        
        console.log('📝 Prompt généré:', prompt.substring(0, 200) + '...');
        
        // 3. Appeler l'API
        const reponseIA = await appelHuggingFace(prompt);
        
        // 4. Nettoyer la réponse
        const reponseFinale = nettoyerReponse(reponseIA);
        
        console.log('✅ Réponse finale:', reponseFinale);
        
        return reponseFinale;
        
    } catch (error) {
        console.error('Erreur génération IA:', error);
        
        // Fallback : réponse d'erreur
        return "Oups ! 🤖 L'IA rencontre un petit problème. " +
               "Vérifie ta connexion ou réessaie dans un instant.";
    }
}

// ============================================
// 7. CACHE SIMPLE
// ============================================

const cacheIA = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Génère une réponse avec cache
 */
async function genererReponseAvecCache(question, mode) {
    const cacheKey = `${question}-${mode}`;
    const cached = cacheIA.get(cacheKey);
    
    // Vérifier le cache
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Réponse depuis le cache');
        return cached.response;
    }
    
    // Générer la réponse
    const response = await genererReponseIA(question, mode);
    
    // Mettre en cache
    cacheIA.set(cacheKey, {
        response,
        timestamp: Date.now()
    });
    
    return response;
}