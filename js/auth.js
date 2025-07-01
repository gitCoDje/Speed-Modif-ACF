// Configuration de l'API
const API_CONFIG = {
    baseUrl: '/api',
    endpoints: {
        login: '/auth.php'
    }
};

// Gestion du formulaire de connexion
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Animation au focus des inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});

/**
 * Gestion de la soumission du formulaire de connexion
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Validation côté client
    if (!email || !password) {
        showError('Veuillez remplir tous les champs.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Veuillez entrer une adresse email valide.');
        return;
    }
    
    try {
        // Désactiver le bouton pendant la requête
        const submitButton = document.querySelector('.login-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Connexion...';
        
        // Appel à l'API d'authentification
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Stocker le token JWT
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirection vers le dashboard
            window.location.href = 'dashboard.html';
        } else {
            showError(data.message || 'Identifiants incorrects. Veuillez réessayer.');
        }
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showError('Erreur de connexion. Veuillez réessayer.');
    } finally {
        // Réactiver le bouton
        const submitButton = document.querySelector('.login-button');
        submitButton.disabled = false;
        submitButton.textContent = 'Se connecter';
    }
}

/**
 * Afficher un message d'erreur
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

/**
 * Validation d'email simple
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Vérifier si l'utilisateur est déjà connecté
 */
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Vérifier la validité du token (optionnel)
        window.location.href = 'dashboard.html';
    }
}

// Vérifier l'état d'authentification au chargement
checkAuthStatus();
