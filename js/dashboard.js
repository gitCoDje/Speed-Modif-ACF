// Variables globales
let acfData = {};
let currentSection = 'identite';
let allFields = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadACFData();
    setupEventListeners();
    switchSection('identite');
});

/**
 * Vérification de l'authentification
 */
function checkAuthentication() {
    // const token = localStorage.getItem('authToken');
    // if (!token) {
    //     window.location.href = 'index.html';
    //     return;
    // }
}

/**
 * Configuration des événements
 */
function setupEventListeners() {
    // Navigation sections
    document.querySelectorAll('.section-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('.section-link').dataset.section;
            switchSection(section);
        });
    });

    // Recherche globale
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);

    // Actualisation
    document.getElementById('refreshSection').addEventListener('click', handleRefreshSection);

    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

/**
 * Chargement des données ACF
 */
function loadACFData() {
    acfData = {
        identite: [
            { id: 'logo', title: 'Logo', group: 'identite_visuelle_group', preview: 'logo-entreprise.png', lastModified: '2025-01-02 14:30' },
            { id: 'mobile_titre', title: 'Titre Bouton Mobile', group: 'bouton_fixe_mobile', preview: 'Appelez-nous', lastModified: '2025-01-01 09:15' },
            { id: 'mobile_number', title: 'Numéro Bouton Mobile', group: 'bouton_fixe_mobile', preview: '+33 1 23 45 67 89', lastModified: '2025-01-01 09:15' },
            { id: 'deco_elements', title: 'Éléments Décoratifs', group: 'deco_group', preview: '3 éléments configurés', lastModified: '2024-12-28 16:45' }
        ],
        header: [
            { id: 'header_titre', title: 'Titre Header', group: 'header_group', preview: 'Bienvenue chez notre entreprise', lastModified: '2025-01-02 10:20' },
            { id: 'header_description', title: 'Description Header', group: 'header_group', preview: 'Nous sommes spécialisés dans...', lastModified: '2025-01-02 10:25' },
            { id: 'image_arriere_plan', title: 'Image Arrière-plan', group: 'header_group', preview: 'header-bg.jpg', lastModified: '2024-12-30 14:15' },
            { id: 'texte_bouton', title: 'Texte Bouton Contact', group: 'bouton_contact', preview: 'Nous contacter', lastModified: '2024-12-28 11:30' },
            { id: 'lien_bouton', title: 'Lien Bouton Contact', group: 'bouton_contact', preview: '#contact', lastModified: '2024-12-28 11:30' }
        ],
        presentation: [
            { id: 'presentation_titre', title: 'Titre Présentation', group: 'presentation_group', preview: 'Notre expertise', lastModified: '2025-01-01 16:20' },
            { id: 'presentation_paragraphe', title: 'Texte Présentation', group: 'presentation_group', preview: 'Forte de plusieurs années...', lastModified: '2025-01-01 16:25' },
            { id: 'image_cercle', title: 'Image Cercle', group: 'presentation_group', preview: 'presentation-circle.jpg', lastModified: '2024-12-29 15:45' },
            { id: 'cercle_devis', title: 'Texte Cercle Devis', group: 'presentation_group', preview: 'Devis gratuit', lastModified: '2024-12-29 15:50' },
            { id: 'cercle_devis2', title: 'Texte Cercle Devis 2', group: 'presentation_group', preview: 'Sous 24h', lastModified: '2024-12-29 15:50' }
        ],
        partenaires: [
            { id: 'titre_partenaires', title: 'Titre Partenaires', group: 'partenaire_group', preview: 'Nos partenaires', lastModified: '2024-12-27 14:10' },
            { id: 'paragraphe_partenaires_1', title: 'Paragraphe 1', group: 'partenaire_group', preview: 'Nous travaillons avec...', lastModified: '2024-12-27 14:15' },
            { id: 'logo_partenaires_1', title: 'Logo Partenaire 1', group: 'partenaire_group', preview: 'partner1.png', lastModified: '2024-12-26 10:30' },
            { id: 'logo_partenaires_2', title: 'Logo Partenaire 2', group: 'partenaire_group', preview: 'partner2.png', lastModified: '2024-12-26 10:30' },
            { id: 'logo_partenaires_3', title: 'Logo Partenaire 3', group: 'partenaire_group', preview: 'partner3.png', lastModified: '2024-12-26 10:30' },
            { id: 'logo_partenaires_4', title: 'Logo Partenaire 4', group: 'partenaire_group', preview: 'partner4.png', lastModified: '2024-12-26 10:30' },
            { id: 'paragraphe_partenaires_2', title: 'Paragraphe 2', group: 'partenaire_group', preview: 'Ces collaborations...', lastModified: '2024-12-27 14:15' }
        ],
        services: [
            { id: 'titre_services', title: 'Titre Services', group: 'service_group', preview: 'Nos services', lastModified: '2025-01-01 11:45' },
            { id: 'paragraphe_services', title: 'Description Services', group: 'service_group', preview: 'Découvrez notre gamme...', lastModified: '2025-01-01 11:50' },
            { id: 'service_1_titre', title: 'Service 1 - Titre', group: 'service_1', preview: 'Consultation', lastModified: '2024-12-30 09:25' },
            { id: 'service_1_description', title: 'Service 1 - Description', group: 'service_1', preview: 'Nous vous accompagnons...', lastModified: '2024-12-30 09:30' },
            { id: 'service_2_titre', title: 'Service 2 - Titre', group: 'service_2', preview: 'Réalisation', lastModified: '2024-12-30 09:40' },
            { id: 'service_2_description', title: 'Service 2 - Description', group: 'service_2', preview: 'Notre équipe réalise...', lastModified: '2024-12-30 09:45' }
        ],
        carrousel: [
            { id: 'titre_carrousel', title: 'Titre Carrousel', group: 'carrousel_group', preview: 'Nos réalisations', lastModified: '2024-12-29 13:30' },
            { id: 'carrousel_1_titre', title: 'Carrousel 1 - Titre', group: 'image_carrousel_1_group', preview: 'Projet résidentiel', lastModified: '2024-12-28 14:20' },
            { id: 'carrousel_1_description', title: 'Carrousel 1 - Description', group: 'image_carrousel_1_group', preview: 'Rénovation complète...', lastModified: '2024-12-28 14:25' },
            { id: 'carrousel_2_titre', title: 'Carrousel 2 - Titre', group: 'image_carrousel_2_group', preview: 'Projet commercial', lastModified: '2024-12-28 14:30' },
            { id: 'carrousel_3_titre', title: 'Carrousel 3 - Titre', group: 'image_carrousel_3_group', preview: 'Projet industriel', lastModified: '2024-12-28 14:40' }
        ],
        contact: [
            { id: 'contact_title', title: 'Titre Contact', group: 'contact_group', preview: 'Contactez-nous', lastModified: '2024-12-27 16:30' },
            { id: 'contact_paragraph', title: 'Texte Contact', group: 'contact_group', preview: 'N\'hésitez pas à nous contacter...', lastModified: '2024-12-27 16:35' }
        ],
        historique: []
    };

    // Créer la liste complète pour la recherche
    allFields = [];
    Object.keys(acfData).forEach(section => {
        if (section !== 'historique') {
            acfData[section].forEach(field => {
                allFields.push({ ...field, section });
            });
        }
    });

    // Générer l'historique
    generateHistory();
}

/**
 * Changer de section
 */
function switchSection(section) {
    // Mettre à jour la navigation
    document.querySelectorAll('.section-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    currentSection = section;

    // Mettre à jour le titre
    const titles = {
        identite: { title: 'Identité Visuelle', desc: 'Gérez les éléments d\'identité visuelle de votre site' },
        header: { title: 'Header', desc: 'Modifiez les éléments du header de votre site' },
        presentation: { title: 'Présentation', desc: 'Gérez la section présentation de votre entreprise' },
        partenaires: { title: 'Partenaires', desc: 'Administrez vos partenaires et leurs informations' },
        services: { title: 'Services', desc: 'Modifiez la présentation de vos services' },
        carrousel: { title: 'Carrousel', desc: 'Gérez les images et contenus du carrousel' },
        contact: { title: 'Contact', desc: 'Modifiez les informations de contact' },
        historique: { title: 'Historique', desc: 'Consultez l\'historique des modifications' }
    };

    document.getElementById('sectionTitle').textContent = titles[section].title;
    document.getElementById('sectionDescription').textContent = titles[section].desc;

    // Rendre le contenu
    if (section === 'historique') {
        renderHistory();
    } else {
        renderSection(section);
    }
}

/**
 * Rendu d'une section
 */
function renderSection(section) {
    const container = document.getElementById('contentContainer');
    const fields = acfData[section] || [];

    if (fields.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Aucun champ dans cette section</h4>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row g-3">
            ${fields.map(field => `
                <div class="col-md-6 col-lg-4">
                    <div class="field-card">
                        <div class="field-group">${field.group}</div>
                        <h5 class="field-title">${field.title}</h5>
                        <div class="field-last-modified">
                            <i class="bi bi-clock me-1"></i>
                            Modifié le ${formatDate(field.lastModified)}
                        </div>
                        <div class="field-preview">${field.preview}</div>
                        <button class="btn btn-edit w-100" data-field-id="${field.id}">
                            <i class="bi bi-pencil me-1"></i>
                            Modifier
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Ajouter les événements
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fieldId = e.target.closest('.btn-edit').dataset.fieldId;
            handleEdit(fieldId);
        });
    });
}

/**
 * Rendu de l'historique
 */
function renderHistory() {
    const container = document.getElementById('contentContainer');
    const history = acfData.historique;

    container.innerHTML = `
        <div class="history-list">
            ${history.map(item => `
                <div class="history-item">
                    <div class="history-icon">
                        <i class="bi ${getHistoryIcon(item.action)}"></i>
                    </div>
                    <div class="history-content">
                        <div class="history-action">${item.action} : ${item.field}</div>
                        <div class="history-time">${formatDate(item.timestamp)} par ${item.user}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Recherche globale
 */
function handleGlobalSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        switchSection(currentSection);
        return;
    }

    // Rechercher dans tous les champs
    const results = allFields.filter(field => 
        field.title.toLowerCase().includes(searchTerm) ||
        field.group.toLowerCase().includes(searchTerm) ||
        field.preview.toLowerCase().includes(searchTerm)
    );

    renderSearchResults(results, searchTerm);
}

/**
 * Rendu des résultats de recherche
 */
function renderSearchResults(results, searchTerm) {
    const container = document.getElementById('contentContainer');
    
    document.getElementById('sectionTitle').textContent = `Résultats de recherche`;
    document.getElementById('sectionDescription').textContent = `${results.length} résultat(s) pour "${searchTerm}"`;

    if (results.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-search display-1 text-muted"></i>
                <h4 class="text-muted mt-3">Aucun résultat trouvé</h4>
                <p class="text-muted">Essayez avec d'autres mots-clés</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row g-3">
            ${results.map(field => `
                <div class="col-md-6 col-lg-4">
                    <div class="field-card">
                        <div class="field-group">${field.section}</div>
                        <h5 class="field-title">${highlightText(field.title, searchTerm)}</h5>
                        <div class="field-last-modified">
                            <i class="bi bi-clock me-1"></i>
                            Modifié le ${formatDate(field.lastModified)}
                        </div>
                        <div class="field-preview">${highlightText(field.preview, searchTerm)}</div>
                        <button class="btn btn-edit w-100" data-field-id="${field.id}">
                            <i class="bi bi-pencil me-1"></i>
                            Modifier
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Ajouter les événements
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fieldId = e.target.closest('.btn-edit').dataset.fieldId;
            handleEdit(fieldId);
        });
    });
}

/**
 * Générer l'historique
 */
function generateHistory() {
    const actions = ['Modification', 'Création', 'Suppression'];
    const users = ['John Doe', 'Jane Smith', 'Admin'];
    
    acfData.historique = allFields
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 10)
        .map(field => ({
            action: actions[Math.floor(Math.random() * actions.length)],
            field: field.title,
            timestamp: field.lastModified,
            user: users[Math.floor(Math.random() * users.length)]
        }));
}

/**
 * Utilitaires
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function highlightText(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function getHistoryIcon(action) {
    const icons = {
        'Modification': 'bi-pencil',
        'Création': 'bi-plus-circle',
        'Suppression': 'bi-trash'
    };
    return icons[action] || 'bi-clock';
}

function handleEdit(fieldId) {
    alert(`Modification du champ : ${fieldId}`);
}

function handleRefreshSection() {
    switchSection(currentSection);
    showToast('Section actualisée', 'success');
}

function handleLogout() {
    if (confirm('Déconnexion ?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

function showToast(message, type) {
    // Toast Bootstrap simple
    const toastHtml = `
        <div class="toast align-items-center text-bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}
