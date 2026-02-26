/* =================================================================
   MODULE 1 : JAVASCRIPT DE BASE
   Fichier: js/app.js
   
   Ce fichier contient la logique de base de notre chatbot.
   Pour l'instant, nous allons juste gérer l'envoi de messages.
   ================================================================= */

// ============================================
// 1. ATTENDRE QUE LA PAGE SOIT CHARGÉE
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Application chargée avec succès !");

  // Initialisation de l'application
  initializeApp();
});

// ============================================
// 2. FONCTION D'INITIALISATION
// ============================================
function initializeApp() {
  console.log("🚀 Initialisation du chatbot...");
  // ============================================
    // CHARGEMENT DES DONNÉES
    // ============================================
    chargerDonneesEtudiants().then(data => {
      if (data) {
          addBotMessage(`Données chargées ! Je connais ${data.etudiants.length} étudiants de ${data.etablissement} ! 🎓`);
      } else {
          addBotMessage("⚠️ Impossible de charger les données. Certaines fonctionnalités seront limitées.");
      }
  });

  // Sélection des éléments du DOM
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const chatContainer = document.getElementById("chat-container");
  const modeButtons = document.querySelectorAll(".mode-btn");

  // Variable pour stocker le mode actuel
  let currentMode = "naturel";
   // ============================================
 // GESTION DU THÈME CLAIR/SOMBRE
 // ============================================
 const themeToggle = document.getElementById('theme-toggle');

 // Charger le thème sauvegardé
 const savedTheme = localStorage.getItem('chatbot-theme') || 'dark';
 if (savedTheme === 'light') {
 document.body.classList.add('light-theme');
 }

 // Événement de clic sur le bouton
 if (themeToggle) {
 themeToggle.addEventListener('click', function() {
 document.body.classList.toggle('light-theme');

 // Sauvegarder la préférence
 const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
 localStorage.setItem('chatbot-theme', currentTheme);

 console.log(`🎨 Thème changé : ${currentTheme}`);
 });
 }

  // ============================================
  // 3. GESTION DES MODES (Naturel, Roast, Sympathique)
  // ============================================
  modeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Retirer la classe 'active' de tous les boutons
      modeButtons.forEach((btn) => btn.classList.remove("active"));

      // Ajouter 'active' au bouton cliqué
      this.classList.add("active");

      // Récupérer le mode sélectionné
      currentMode = this.getAttribute("data-mode");

      console.log(`Mode changé : ${currentMode}`);

      // Afficher un message de confirmation
      addBotMessage(`Mode ${currentMode} activé ! 😎`);
    });
  });


  // ============================================
  // 4. ENVOI DE MESSAGES
  // ============================================
  // Événement au clic sur le bouton
  

  sendBtn.addEventListener("click", function () {
    sendMessage();
  });

  // Événement quand on appuie sur Entrée
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // ============================================
  // 5. FONCTION POUR ENVOYER UN MESSAGE
  // ============================================
  function sendMessage() {
    const message = userInput.value.trim();

    // Vérifier que le message n'est pas vide
    if (message === "") {
      alert("⚠️ Message vide, rien à envoyer");
      return;
    }

    console.log(`📤 Envoi du message : "${message}"`);
    sendBtn.classList.add("sending");
    setTimeout(() => sendBtn.classList.remove("sending"), 500);

    // Afficher le message de l'utilisateur
    addUserMessage(message);

    // Effacer le champ de saisie
    userInput.value = "";

    // Simuler une réponse du bot (temporaire, Module 1)
    // Dans les prochains modules, nous utiliserons l'IA
    // Simuler la réflexion du bot
    showTypingIndicator();

    // Délai aléatoire entre 1 et 3 secondes
    const delay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      hideTypingIndicator();
      const response = generateTemporaryResponse(message, currentMode);
      addBotMessage(response);
    }, delay);
  }
  // ============================================
  // TYPING INDICATOR
  // ============================================
  function showTypingIndicator() {
    // Vérifier qu'il n'y a pas déjà un indicateur
    if (document.getElementById("typing-indicator")) {
      return;
    }

    const indicator = document.createElement("div");
    indicator.className = "message bot-message typing-indicator";
    indicator.id = "typing-indicator";

    indicator.innerHTML = `
    <div class="message-avatar">🤖 </div>
    <div class="message-content">
    <div class="typing-dots">
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
    </div>
    </div>
    `;

    chatContainer.appendChild(indicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  // ============================================
  // 6. FONCTION POUR AJOUTER UN MESSAGE UTILISATEUR
  // ============================================
  function addUserMessage(text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";

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
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";

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
    // Vérifier si les données sont chargées
    if (!donneesChargees()) {
        return "Les données ne sont pas encore chargées. Patiente un instant... 🔄";
    }
    
    // Interpréter la question
    const intent = interpreterQuestion(userMessage);
    
    switch(intent.type) {
        case 'presentation':
            const etudiants = rechercherEtudiant(intent.nom);
            if (etudiants.length > 0) {
                return presenterEtudiant(etudiants[0], mode);
            }
            return `Désolé, je ne connais pas "${intent.nom}" 🤔. Essaie un autre nom !`;
            
        case 'funfact':
            const etudiant = rechercherEtudiant(intent.nom)[0];
            if (etudiant) {
                const fact = funFactAleatoire(etudiant);
                return `🎉 Fun fact sur ${etudiant.prenom} : ${fact}`;
            }
            return `Je ne connais pas cette personne 🤷`;
            
        case 'statistiques':
            const stats = studentsData.stats;
            return `📊 Statistiques :\n\n` +
                   `👥 Total : ${stats.totalEtudiants} étudiants\n` +
                   `🎓 Filières : ${stats.filieres.join(', ')}\n` +
                   `📦 Total projets : ${stats.totalProjets}\n` +
                   `☕ Total cafés/jour : ${stats.totalCafes}`;
            
        case 'liste':
            const liste = studentsData.etudiants
                .map(e => `• ${e.prenom} ${e.nom} (${e.filiere})`)
                .join('\n');
            return `📋 Liste des étudiants :\n\n${liste}`;
            
        case 'recherche-interet':
            const interesses = filtrerParInteret(intent.interet);
            if (interesses.length > 0) {
                const noms = interesses.map(e => `• ${e.prenom} ${e.nom}`).join('\n');
                return `${interesses.length} personne(s) intéressée(s) par "${intent.interet}" :\n\n${noms}`;
            }
            return `Personne ne s'intéresse à "${intent.interet}" apparemment 🤷`;
            
        case 'filiere':
            const parFiliere = filtrerParFiliere(intent.filiere);
            if (parFiliere.length > 0) {
                const noms = parFiliere.map(e => `• ${e.prenom} ${e.nom}`).join('\n');
                return `${parFiliere.length} étudiant(s) en ${intent.filiere} :\n\n${noms}`;
            }
            return `Aucun étudiant en ${intent.filiere} 🤔`;
            
        default:
            // Réponses par défaut existantes
            const msg = userMessage.toLowerCase();
            
            if (msg.includes('salut') || msg.includes('bonjour')) {
                return mode === 'roast' 
                    ? "Tiens, regarde qui arrive ! Prêt(e) à te faire roast ? 🔥"
                    : "Salut ! Pose-moi des questions sur les étudiants ! 😊";
            }
            
            return "Hmm, je n'ai pas compris. Essaie de demander des infos sur un étudiant ! 🤔";
    }
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
    const div = document.createElement("div");
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

console.log(
  "💡 Astuce : Ouvre la console (F12) pour voir les logs de débogage !"
);
