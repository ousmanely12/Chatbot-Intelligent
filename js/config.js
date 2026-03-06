const API_CONFIG = {
    provider: 'huggingface', // 'huggingface', 'groq', ou 'ollama'
    
    huggingface: {
        apiKey: 'mon token',
        model: 'tiiuae/falcon-7b-instruct'
    },
    
    groq: {
        apiKey: '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', // Optionnel : pour tester Groq plus tard
        model: 'llama-3.1-8b-instant' 
    }
};