// Configuration de l'API
const API_CONFIG = {
    baseUrl: '/api',
    endpoints: {
        fields: '/fields.php',
        logout: '/auth.php'
    }
};

// État global de l'application
let fieldsData = [];
let filteredFields = [];

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadFields();
});

/**
 * Initialisation du dashboard
 */
function initializeDashboard() {
    // Vérifier l'authentification
    checkAuthentication();
    
    // Afficher les informations utilisateur
    displayUserInfo();
    
    // Initialiser les animations
    initializeAnimations();
}

/**
 * Configuration des écouteurs d'événements
 */
function setupEventListeners() {
    // Bouton de déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Bouton d'actualisation
    const refreshBtn = document.getElementById('refreshFields');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshFields);
    }
    
    // Recherche de champs
    const searchInput = document.getElementById('searchFields');
    if (searchInput) {
        searchInput.addEventListener('input', handleFieldSearch);
    }
    
    // Boutons d'édition et de prévisualisation
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) {
            const fieldId = e.target.closest('.edit-btn').dataset.fieldId;
            handleEditField(fieldId);
        }
        
        if (e.target.closest('.preview-btn')) {
            const fieldId = e.target.closest('.preview-btn').dataset.fieldId;
            handlePreviewField(fieldId);
        }
    });
}

/**
 * Vérification de l'authentification
 */
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Vérifier la validité du token (optionnel)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Token invalide:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

/**
 * Affichage des informations utilisateur
 */
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = user.role || 'Éditeur';
    }
}

/**
 * Chargement des champs ACF
 */
async function loadFields() {
    try {
        showLoadingState();
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fields}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des champs');
        }
        
        const data = await response.json();
        fieldsData = data.fields || [];
        filteredFields = [...fieldsData];
        
        renderFields();
        updateStats();
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showErrorMessage('Impossible de charger les champs ACF');
    } finally {
        hideLoadingState();
    }
}

/**
 * Rendu des champs dans la grille
 */
function renderFields() {
    const fieldsGrid = document.getElementById('fieldsGrid');
    if (!fieldsGrid) return;
    
    if (filteredFields.length === 0) {
        fieldsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
                <p>Aucun champ trouvé</p>
            </div>
        `;
        return;
    }
    
    fieldsGrid.innerHTML = filteredFields.map(field => `
        <div class="field-card" data-field-type="${field.type}">
            <div class="field-header">
                <div class="field-icon ${field.type}-field">${getFieldIcon(field.type)}</div>
                <div class="field-info">
                    <h3 class="field-title">${field.title}</h3>
                    <p class="field-description">${field.description}</p>
                </div>
                <div class="field-status ${field.status}">${field.status === 'active' ? 'Actif' : 'Inactif'}</div>
            </div>
            <div class="field-preview ${field.type === 'image' ? 'image-preview' : ''}">
                ${renderFieldPreview(field)}
            </div>
            <div class="field-actions">
                <button class="edit-btn ${field.status === 'inactive' ? 'disabled' : ''}" 
                        data-field-id="${field.id}" 
                        ${field.status === 'inactive' ? 'disabled' : ''}>
                    <span class="edit-icon">✏️</span>
                    Modifier
                </button>
                <button class="preview-btn" data-field-id="${field.id}">
                    <span class="preview-icon">👁️</span>
                    Prévisualiser
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Rendu de la prévisualisation d'un champ
 */
function renderFieldPreview(field) {
    if (field.type === 'image') {
        return `<img src="${field.preview || 'https://via.placeholder.com/300x150/42a5f5/ffffff?text=Image+Actuelle'}" 
                     alt="Aperçu image" class="preview-image">`;
    }
    
    return `
        <span class="preview-label">Contenu actuel :</span>
        <span class="preview-text">"${field.preview || 'Aucun contenu'}"</span>
    `;
}

/**
 * Obtenir l'icône pour un type de champ
 */
function getFieldIcon(type) {
    const icons = {
        'text': '📝',
        'textarea': '📄',
        'image': '🖼️',
        'wysiwyg': '📋',
        'number': '🔢',
        'email': '📧',
        'url': '🔗',
        'date': '📅'
    };
    
    return icons[type] || '📝';
}

/**
 * Mise à jour des statistiques
 */
function updateStats() {
    const totalFields = fieldsData.length;
    const activeFields = fieldsData.filter(field => field.status === 'active').length;
    const todayModifications = fieldsData.filter(field => {
        const today = new Date().toDateString();
        return new Date(field.lastModified).toDateString() === today;
    }).length;
    
    // Mettre à jour les éléments du DOM
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers[0]) statNumbers[0].textContent = totalFields;
    if (statNumbers[1]) statNumbers[1].textContent = todayModifications;
    if (statNumbers[2]) statNumbers[2].textContent = '2.3s'; // Temps de sauvegarde fixe
}

/**
 * Gestion de la recherche de champs
 */
function handleFieldSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredFields = [...fieldsData];
    } else {
        filteredFields = fieldsData.filter(field => 
            field.title.toLowerCase().includes(searchTerm) ||
            field.description.toLowerCase().includes(searchTerm) ||
            field.type.toLowerCase().includes(searchTerm)
        );
    }
    
    renderFields();
}

/**
 * Gestion de l'actualisation des champs
 */
async function handleRefreshFields() {
    const refreshBtn = document.getElementById('refreshFields');
    const originalText = refreshBtn.innerHTML;
    
    // Animation du bouton
    refreshBtn.innerHTML = '<span class="refresh-icon">🔄</span> Actualisation...';
    refreshBtn.disabled = true;
    
    try {
        await loadFields();
        showSuccessMessage('Champs actualisés avec succès');
    } catch (error) {
        showErrorMessage('Erreur lors de l\'actualisation');
    } finally {
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }, 1000);
    }
}

/**
 * Gestion de l'édition d'un champ
 */
function handleEditField(fieldId) {
    const field = fieldsData.find(f => f.id === fieldId);
    if (!field) return;
    
    // Redirection vers la page d'édition (à créer)
    window.location.href = `edit.html?field=${fieldId}`;
}

/**
 * Gestion de la prévisualisation d'un champ
 */
function handlePreviewField(fieldId) {
    const field = fieldsData.find(f => f.id === fieldId);
    if (!field) return;
    
    // Ouvrir la prévisualisation dans une nouvelle fenêtre
    window.open(`preview.html?field=${fieldId}`, '_blank', 'width=800,height=600');
}

/**
 * Gestion de la déconnexion
 */
async function handleLogout() {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        
        // Appel à l'API de déconnexion (optionnel)
        await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.logout}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    } finally {
        // Nettoyer le stockage local
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Redirection vers la page de connexion
        window.location.href = 'index.html';
    }
}

/**
 * Affichage d'un état de chargement
 */
function showLoadingState() {
    const fieldsGrid = document.getElementById('fieldsGrid');
    if (fieldsGrid) {
        fieldsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--border-light); border-top: 4px solid var(--secondary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: var(--text-muted);">Chargement des champs...</p>
            </div>
        `;
    }
}

/**
 * Masquer l'état de chargement
 */
function hideLoadingState() {
    // Le rendu des champs remplacera automatiquement l'état de chargement
}

/**
 * Affichage d'un message de succès
 */
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

/**
 * Affichage d'un message d'erreur
 */
function showErrorMessage(message) {
    showNotification(message, 'error');
}

/**
 * Système de notifications
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // Couleurs selon le type
    const colors = {
        success: 'var(--action)',
        error: '#e74c3c',
        info: 'var(--secondary)'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Initialisation des animations
 */
function initializeAnimations() {
    // Animation CSS pour le spinner de chargement
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .notification {
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}

// Données de test (à remplacer par l'API)
const mockFieldsData = [
    {
        id: 'title_principal',
        title: 'Titre Principal',
        description: 'Titre affiché en en-tête de page',
        type: 'text',
        status: 'active',
        preview: 'Bienvenue chez Speed Modif ACF',
        lastModified: new Date().toISOString()
    },
    {
        id: 'description_entreprise',
        title: 'Description Entreprise',
        description: 'Texte de présentation de l\'entreprise',
        type: 'textarea',
        status: 'active',
        preview: 'Notre entreprise accompagne les clients...',
        lastModified: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'image_mise_en_avant',
        title: 'Image Mise en Avant',
        description: 'Image principale de la page d\'accueil',
        type: 'image',
        status: 'active',
        preview: 'https://via.placeholder.com/300x150/42a5f5/ffffff?text=Image+Actuelle',
        lastModified: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: 'numero_telephone',
        title: 'Numéro de Téléphone',
        description: 'Contact téléphonique affiché',
        type: 'text',
        status: 'active',
        preview: '+33 1 23 45 67 89',
        lastModified: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'adresse_entreprise',
        title: 'Adresse Entreprise',
        description: 'Adresse complète de l\'entreprise',
        type: 'textarea',
        status: 'inactive',
        preview: '123 Rue de la Paix, 75001 Paris',
        lastModified: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 'contenu_services',
        title: 'Contenu Services',
        description: 'Description détaillée des services',
        type: 'wysiwyg',
        status: 'active',
        preview: 'Nos services incluent le développement...',
        lastModified: new Date(Date.now() - 259200000).toISOString()
    }
];

// Utiliser les données de test si l'API n'est pas disponible
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        fieldsData = mockFieldsData;
        filteredFields = [...fieldsData];
        renderFields();
        updateStats();
    }, 1000);
}
