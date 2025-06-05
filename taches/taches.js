const URL_BASE = "https://yfxbheoyavydissfpvwh.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeGJoZW95YXZ5ZGlzc2ZwdndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI0NTEsImV4cCI6MjA2MzY2ODQ1MX0.n10JVF_CSap7fmdbQYcgpmtrfacOX9HBaSB779KrV1o";

// Variables globales pour stocker les tâches
let toutesLesTaches = [];

// Fonction pour afficher une alerte personnalisée
function showAlert(type, title, message, duration = 5000, onConfirm = null) {
    const alertContainer = document.getElementById('alertContainer');
    const alertOverlay = document.getElementById('alertOverlay');
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    
    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    }[type];

    alert.innerHTML = `
        <div class="custom-alert-header">
            <i class="fas ${icon} custom-alert-icon"></i>
            <div class="custom-alert-title">${title}</div>
        </div>
        <div class="custom-alert-content">${message}</div>
        <div class="custom-alert-footer">
            <button class="custom-alert-btn custom-alert-btn-close">Fermer</button>
            ${onConfirm ? '<button class="custom-alert-btn custom-alert-btn-confirm">Confirmer</button>' : ''}
        </div>
    `;

    alertContainer.appendChild(alert);
    alertOverlay.classList.add('show');
    
    // Animation d'entrée
    setTimeout(() => alert.classList.add('show'), 10);

    // Gestionnaire pour le bouton de fermeture
    const closeBtn = alert.querySelector('.custom-alert-btn-close');
    closeBtn.addEventListener('click', () => {
        alert.classList.remove('show');
        alertOverlay.classList.remove('show');
        setTimeout(() => {
            alert.remove();
        }, 300);
    });

    // Gestionnaire pour le bouton de confirmation
    if (onConfirm) {
        const confirmBtn = alert.querySelector('.custom-alert-btn-confirm');
        confirmBtn.addEventListener('click', () => {
            alert.classList.remove('show');
            alertOverlay.classList.remove('show');
            setTimeout(() => {
                alert.remove();
                onConfirm();
            }, 300);
        });
    }

    // Fermeture automatique pour les alertes non-warning
    if (duration > 0 && type !== 'warning') {
        setTimeout(() => {
            if (alert.parentElement) {
                alert.classList.remove('show');
                alertOverlay.classList.remove('show');
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }
        }, duration);
    }
}

// Fonction pour afficher une notification toast
function showToast(type, title, message, duration = 2000) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    }[type];

    toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    toastContainer.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 10);

    // Animation de sortie
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Fonction pour charger les tâches
async function chargerTaches() {
    try {
        console.log('Tentative de chargement des tâches...');
        const res = await fetch(`${URL_BASE}/rest/v1/taches`, {
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            console.error('Erreur de réponse:', res.status, errorData);
            throw new Error(`Erreur HTTP: ${res.status} - ${JSON.stringify(errorData)}`);
        }

        toutesLesTaches = await res.json();
        console.log('Tâches reçues:', toutesLesTaches);
        
        appliquerFiltres();
    } catch (error) {
        console.error('Erreur détaillée lors du chargement des tâches:', error);
        showToast('error', 'Erreur de chargement', 'Impossible de charger les tâches. Veuillez réessayer.');
    }
}

// Fonction pour créer un élément de tâche
function creerElementTache(tache) {
    const div = document.createElement('div');
    div.className = `task-item ${tache.completed ? 'completed' : ''}`;
    div.dataset.id = tache.id;
    div.dataset.priority = tache.priority;

    const dateLimite = new Date(tache.due_date);
    const dateFormatee = dateLimite.toLocaleDateString('fr-FR');

    div.innerHTML = `
        <div class="task-header">
            <h3>${tache.title}</h3>
            <span class="priority-badge ${tache.priority}">${tache.priority}</span>
        </div>
        <p class="task-description">${tache.description || ''}</p>
        <div class="task-footer">
            <span class="due-date">Date limite: ${dateFormatee}</span>
            <div class="task-actions">
                <button class="btn btn-complete" onclick="toggleComplete(${tache.id})">
                    <i class="fas ${tache.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="btn btn-delete" onclick="supprimerTache(${tache.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    return div;
}

// Fonction pour ajouter une tâche
async function ajouterTache(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const description = document.getElementById('taskDescription').value;

    if (!title || !dueDate) {
        showAlert('warning', 'Champs requis', 'Veuillez remplir au moins le titre et la date limite.');
        return;
    }

    try {
        const res = await fetch(`${URL_BASE}/rest/v1/taches`, {
            method: 'POST',
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
            },
            body: JSON.stringify({
                title,
                priority,
                due_date: dueDate,
                description,
                completed: false
            })
        });

        if (!res.ok) {
            throw new Error('Erreur lors de l\'ajout de la tâche');
        }

        // Réinitialiser le formulaire
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskPriority').value = 'low';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskDescription').value = '';

        // Afficher la notification toast
        showToast('success', 'Tâche ajoutée', 'La tâche a été ajoutée avec succès.');
        
        // Recharger les tâches
        chargerTaches();
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche:', error);
        showToast('error', 'Erreur', 'Impossible d\'ajouter la tâche. Veuillez réessayer.');
    }
}

// Fonction pour supprimer une tâche
async function supprimerTache(id) {
    // Afficher la confirmation
    showAlert('warning', 'Confirmation de suppression', 
        'Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.',
        0, // Pas de fermeture automatique
        async () => {
            try {
                const res = await fetch(`${URL_BASE}/rest/v1/taches?id=eq.${id}`, {
                    method: 'DELETE',
                    headers: {
                        apikey: API_KEY,
                        Authorization: `Bearer ${API_KEY}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Erreur lors de la suppression de la tâche');
                }

                // Afficher la notification toast
                showToast('success', 'Tâche supprimée', 'La tâche a été supprimée avec succès.');
                
                // Recharger les tâches
                chargerTaches();
            } catch (error) {
                console.error('Erreur lors de la suppression de la tâche:', error);
                showToast('error', 'Erreur', 'Impossible de supprimer la tâche. Veuillez réessayer.');
            }
        }
    );
}

// Fonction pour basculer l'état d'une tâche
async function toggleComplete(id) {
    try {
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        const currentState = taskElement.classList.contains('completed');

        const res = await fetch(`${URL_BASE}/rest/v1/taches?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: !currentState
            })
        });

        if (!res.ok) {
            throw new Error('Erreur lors de la mise à jour de la tâche');
        }

        // Afficher la notification toast
        showToast('success', 'Tâche mise à jour', 
            currentState ? 'La tâche est maintenant en cours.' : 'La tâche est maintenant terminée.');
            
        chargerTaches();
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
        showToast('error', 'Erreur', 'Impossible de mettre à jour la tâche. Veuillez réessayer.');
    }
}

// Fonction pour appliquer tous les filtres
function appliquerFiltres() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    // Filtrer par statut (toutes, en cours, terminées, en retard)
    const statusFilter = document.querySelector('.filter-btn.active').dataset.filter;
    let tachesFiltrees = toutesLesTaches.filter(tache => {
        const today = new Date();
        const dueDate = new Date(tache.due_date);
        const isOverdue = !tache.completed && dueDate < today;

        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return !tache.completed;
        if (statusFilter === 'completed') return tache.completed;
        if (statusFilter === 'overdue') return isOverdue;
        return true;
    });

    // Filtrer par priorité
    const priorityFilter = document.getElementById('filterPriority').value;
    if (priorityFilter !== 'all') {
        tachesFiltrees = tachesFiltrees.filter(tache => tache.priority === priorityFilter);
    }

    // Trier les tâches
    const sortBy = document.getElementById('sortBy').value;
    tachesFiltrees.sort((a, b) => {
        switch (sortBy) {
            case 'created-asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'created-desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'date-asc':
                return new Date(a.due_date) - new Date(b.due_date);
            case 'date-desc':
                return new Date(b.due_date) - new Date(a.due_date);
            case 'priority-asc':
                return getPriorityValue(a.priority) - getPriorityValue(b.priority);
            case 'priority-desc':
                return getPriorityValue(b.priority) - getPriorityValue(a.priority);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });

    // Afficher les tâches filtrées
    tachesFiltrees.forEach(tache => {
        const taskElement = creerElementTache(tache);
        taskList.appendChild(taskElement);
    });
}

// Fonction pour obtenir la valeur numérique de la priorité
function getPriorityValue(priority) {
    switch (priority) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
    }
}

// Gestionnaire pour le menu déroulant des filtres
const filterToggle = document.getElementById('filterToggle');
const filterMenu = document.getElementById('filterMenu');

filterToggle.addEventListener('click', () => {
    filterMenu.classList.toggle('active');
});

// Fermer le menu si on clique en dehors
document.addEventListener('click', (e) => {
    if (!filterMenu.contains(e.target) && !filterToggle.contains(e.target)) {
        filterMenu.classList.remove('active');
    }
});

// Animation des boutons de filtre
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appliquerFiltres();
    });
});

// Gestionnaires d'événements pour le tri et le filtre de priorité
document.getElementById('sortBy').addEventListener('change', appliquerFiltres);
document.getElementById('filterPriority').addEventListener('change', appliquerFiltres);

// Gestionnaire d'événements pour le formulaire d'ajout de tâche
document.getElementById('addTaskBtn').addEventListener('click', ajouterTache);

// Charger les tâches au chargement de la page
document.addEventListener('DOMContentLoaded', chargerTaches); 