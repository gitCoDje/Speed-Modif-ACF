// Variables globales
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    checkExistingAuth();
    generateCSRFToken();
});

/**
 * Initialisation du formulaire
 */
function initializeForm() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);
    
    // Validation temps réel
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearValidation);
    });
}

/**
 * Gestion de la soumission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    // Vérifier les tentatives
    if (!checkLoginAttempts()) return;
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validation
    if (!validateForm(form)) return;
    
    try {
        setLoadingState(true);
        
        const response = await fetch('api/auth.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Succès
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            // Erreur
            loginAttempts++;
            showError(data.message || 'Identifiants incorrects');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Validation du formulaire
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!validateInput({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validation d'un input
 */
function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    input.classList.remove('is-valid', 'is-invalid');
    
    if (!value) {
        input.classList.add('is-invalid');
        return false;
    }
    
    if (input.type === 'email' && !isValidEmail(value)) {
        input.classList.add('is-invalid');
        return false;
    }
    
    if (input.type === 'password' && value.length < 8) {
        input.classList.add('is-invalid');
        return false;
    }
    
    input.classList.add('is-valid');
    return true;
}

/**
 * Effacer la validation
 */
function clearValidation(e) {
    e.target.classList.remove('is-valid', 'is-invalid');
}

/**
 * État de chargement
 */
function setLoadingState(loading) {
    const button = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('loginSpinner');
    
    button.disabled = loading;
    buttonText.textContent = loading ? 'Connexion...' : 'Se connecter';
    spinner.classList.toggle('d-none', !loading);
}

/**
 * Afficher une erreur
 */
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.classList.remove('d-none');
    
    setTimeout(() => {
        errorDiv.classList.add('d-none');
    }, 5000);
}

/**
 * Vérifier les tentatives de connexion
 */
function checkLoginAttempts() {
    if (loginAttempts >= MAX_ATTEMPTS) {
        showError('Trop de tentatives. Veuillez patienter 5 minutes.');
        setTimeout(() => {
            loginAttempts = 0;
        }, 300000);
        return false;
    }
    return true;
}

/**
 * Validation email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Vérifier authentification existante
 */
function checkExistingAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = 'dashboard.html';
    }
}

/**
 * Générer token CSRF
 */
function generateCSRFToken() {
    const token = Math.random().toString(36).substring(2);
    document.getElementById('csrfToken').value = token;
    sessionStorage.setItem('csrf_token', token);
}
