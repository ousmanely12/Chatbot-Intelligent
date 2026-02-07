/* =================================================================
   MODULE 1 : JAVASCRIPT DE BASE
   Fichier: js/app.js
   
   Ce fichier contient la logique de base de notre chatbot.
   Pour l'instant, nous allons juste gérer l'envoi de messages.
   ================================================================= */

// ============================================
// 1. ATTENDRE QUE LA PAGE SOIT CHARGÉE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Application chargée avec succès !');
    
    // Initialisation de l'application
    initializeApp();
});

// ============================================
// 2. FONCTION D'INITIALISATION
// ============================================
function initializeApp() {
    console.log('🚀 Initialisation du chatbot...');
    
    // Sélection des éléments du DOM
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatContainer = document.getElementById('chat-container');
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    // Variable pour stocker le mode actuel
    let currentMode = 'naturel';
    
    // ============================================
    // 3. GESTION DES MODES (Naturel, Roast, Sympathique)
    // ============================================
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe 'active' de tous les boutons
            modeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Ajouter 'active' au bouton cliqué
            this.classList.add('active');
            
            // Récupérer le mode sélectionné
            currentMode = this.getAttribute('data-mode');
            
            console.log(`Mode changé : ${currentMode}`);
            
            // Afficher un message de confirmation
            addBotMessage(`Mode ${currentMode} activé ! 😎`);
        });
    });
    
    // ============================================
    // 4. ENVOI DE MESSAGES
    // ============================================
    
    // Événement au clic sur le bouton
    sendBtn.addEventListener('click', function() {
        sendMessage();
    });
    
    // Événement quand on appuie sur Entrée
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // ============================================
    // 5. FONCTION POUR ENVOYER UN MESSAGE
    // ============================================
    function sendMessage() {
        const message = userInput.value.trim();
        
        // Vérifier que le message n'est pas vide
        if (message === '') {
            console.log('⚠️ Message vide, rien à envoyer');
            return;
        }
        
        console.log(`📤 Envoi du message : "${message}"`);
        
        // Afficher le message de l'utilisateur
        addUserMessage(message);
        
        // Effacer le champ de saisie
        userInput.value = '';
        
        // Simuler une réponse du bot (temporaire, Module 1)
        // Dans les prochains modules, nous utiliserons l'IA
        setTimeout(() => {
            const response = generateTemporaryResponse(message, currentMode);
            addBotMessage(response);
        }, 1000);
    }
    
    // ============================================
    // 6. FONCTION POUR AJOUTER UN MESSAGE UTILISATEUR
    // ============================================
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${escapeHtml(text)}</p>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // ============================================
    // 7. FONCTION POUR AJOUTER UN MESSAGE DU BOT
    // ============================================
    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${escapeHtml(text)}</p>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // ============================================
    // 8. FONCTION TEMPORAIRE POUR GÉNÉRER DES RÉPONSES
    // (Sera remplacée par l'IA au Module 4)
    // ============================================
    function generateTemporaryResponse(userMessage, mode) {
        // Convertir en minuscules pour faciliter la détection
        const msg = userMessage.toLowerCase();
        
        // Réponses selon le mode
        const responses = {
            naturel: [
                "Hmm, intéressante question ! Pour l'instant je suis en mode apprentissage. 😊",
                "Je note ça ! Bientôt je pourrai te répondre avec l'IA. 🤖",
                "Super question ! J'apprends encore comment y répondre. 📚"
            ],
            roast: [
                "Oh là là, cette question... 🔥 Donne-moi le temps de préparer une réponse qui arrache !",
                "Tu veux vraiment que je roast avec ça ? Attends le Module 4, ça va chauffer ! 😈",
                "Pas mal comme question, mais j'ai besoin de mon cerveau IA d'abord ! 💀"
            ],
            sympathique: [
                "Quelle belle question ! 💖 Je suis impatient d'y répondre quand j'aurai mon IA !",
                "Tu es trop gentil(le) de me poser cette question ! 🥰 Bientôt je pourrai t'aider !",
                "Aww, j'aimerais tellement pouvoir répondre ! 💕 Patience, ça arrive !"
            ]
        };
        
        // Détection de mots-clés
        if (msg.includes('salut') || msg.includes('bonjour') || msg.includes('hello')) {
            return mode === 'roast' 
                ? "Salut toi ! Prêt(e) à te faire roast ? 🔥" 
                : mode === 'sympathique'
                ? "Coucou ! 💖 Quel plaisir de te parler !"
                : "Salut ! Comment puis-je t'aider ? 😊";
        }
        
        if (msg.includes('merci') || msg.includes('thanks')) {
            return mode === 'roast'
                ? "Ouais ouais, de rien... 😏"
                : mode === 'sympathique'
                ? "Avec grand plaisir ! Tu es adorable ! 🥰"
                : "De rien, ravi d'aider ! 😊";
        }
        
        if (msg.includes('qui es-tu') || msg.includes('qui es tu')) {
            return `Je suis un chatbot en mode ${mode} ! 🤖 En cours de développement dans le Module 1.`;
        }
        
        // Réponse par défaut selon le mode
        const modeResponses = responses[mode] || responses.naturel;
        const randomIndex = Math.floor(Math.random() * modeResponses.length);
        return modeResponses[randomIndex];
    }
    
    // ============================================
    // 9. FONCTIONS UTILITAIRES
    // ============================================
    
    // Faire défiler vers le bas pour voir le dernier message
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Échapper le HTML pour éviter les injections XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// 10. MESSAGES DE DEBUG DANS LA CONSOLE
// ============================================
console.log(`
╔═══════════════════════════════════════╗
║   🤖 CHATBOT ÉTUDIANT - MODULE 1     ║
║   Développé pour apprendre Git,      ║
║   HTML, CSS et JavaScript !          ║
╚═══════════════════════════════════════╝
`);

console.log('💡 Astuce : Ouvre la console (F12) pour voir les logs de débogage !');
