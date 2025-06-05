// Vérification de la disponibilité de Marked
if (typeof marked === 'undefined') {
    console.error('La bibliothèque Marked n\'est pas disponible');
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Erreur : La bibliothèque Marked n\'est pas chargée. Veuillez rafraîchir la page.</div>';
    throw new Error('Marked n\'est pas disponible');
}

const URL_BASE = "https://yfxbheoyavydissfpvwh.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeGJoZW95YXZ5ZGlzc2ZwdndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI0NTEsImV4cCI6MjA2MzY2ODQ1MX0.n10JVF_CSap7fmdbQYcgpmtrfacOX9HBaSB779KrV1o";

let toutesLesNotes = [];
let noteActuelle = null;

// Éléments DOM
const notesList = document.getElementById('notesList');
const noteTitleInput = document.getElementById('noteTitleInput');
const noteContent = document.getElementById('noteContent');
const notePreview = document.getElementById('notePreview');
const newNoteBtn = document.getElementById('newNoteBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');

// Vérification des éléments DOM
if (!notesList || !noteTitleInput || !noteContent || !notePreview || !newNoteBtn || !saveNoteBtn || !deleteNoteBtn) {
    console.error('Certains éléments DOM sont manquants');
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Erreur : Certains éléments de l\'interface sont manquants. Veuillez rafraîchir la page.</div>';
    throw new Error('Éléments DOM manquants');
}

// Configuration de Marked pour la sécurité
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false,
    mangle: false
});

// Charger les notes au démarrage
document.addEventListener('DOMContentLoaded', () => {
    chargerNotes();
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Nouvelle note
    newNoteBtn.addEventListener('click', () => {
        noteActuelle = null;
        noteTitleInput.value = '';
        noteContent.value = '';
        notePreview.innerHTML = '';
        noteTitleInput.focus();
    });

    // Sauvegarder la note
    saveNoteBtn.addEventListener('click', sauvegarderNote);

    // Supprimer la note
    deleteNoteBtn.addEventListener('click', () => {
        if (noteActuelle) {
            showAlert('warning', 'Confirmation', 'Voulez-vous vraiment supprimer cette note ?', 0, () => {
                supprimerNote(noteActuelle.id);
            });
        }
    });

    // Mise à jour de l'aperçu Markdown en temps réel avec gestion d'erreur
    noteContent.addEventListener('input', () => {
        try {
            const html = marked.parse(noteContent.value);
            notePreview.innerHTML = html;
        } catch (error) {
            console.error('Erreur lors du parsing Markdown:', error);
            notePreview.innerHTML = '<div style="color: red;">Erreur lors du rendu du Markdown</div>';
        }
    });
}

// Charger toutes les notes
async function chargerNotes() {
    try {
        console.log('Chargement des notes...');
        const response = await fetch(`${URL_BASE}/rest/v1/notes?order=created_at.desc`, {
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Statut de la réponse:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur de réponse:', errorData);
            throw new Error(`Erreur lors du chargement des notes: ${response.status}`);
        }

        const data = await response.json();
        console.log('Notes chargées:', data);
        
        toutesLesNotes = data;
        afficherNotes();
    } catch (error) {
        console.error('Erreur détaillée:', error);
        showToast('error', 'Erreur', `Impossible de charger les notes: ${error.message}`);
    }
}

// Afficher la liste des notes
function afficherNotes() {
    notesList.innerHTML = '';
    toutesLesNotes.forEach(note => {
        const noteElement = creerElementNote(note);
        notesList.appendChild(noteElement);
    });
}

// Créer un élément note pour la liste
function creerElementNote(note) {
    const div = document.createElement('div');
    div.className = 'note-item';
    if (noteActuelle && note.id === noteActuelle.id) {
        div.classList.add('active');
    }

    const date = new Date(note.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    div.innerHTML = `
        <div class="note-item-title">${note.title}</div>
        <div class="note-item-meta">${date}</div>
    `;

    div.addEventListener('click', () => {
        document.querySelectorAll('.note-item').forEach(item => item.classList.remove('active'));
        div.classList.add('active');
        editerNote(note);
    });

    return div;
}

// Éditer une note existante
function editerNote(note) {
    noteActuelle = note;
    noteTitleInput.value = note.title;
    noteContent.value = note.content;
    notePreview.innerHTML = marked.parse(note.content);
}

// Sauvegarder une note
async function sauvegarderNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContent.value.trim();

    if (!title) {
        showToast('error', 'Erreur', 'Le titre est obligatoire');
        return;
    }

    try {
        console.log('Début de la sauvegarde...');
        console.log('Titre:', title);
        console.log('Contenu:', content);

        const noteData = {
            title,
            content,
            category: 'général',
            created_at: new Date().toISOString()
        };

        if (noteActuelle) {
            console.log('Mise à jour de la note existante:', noteActuelle.id);
            const response = await fetch(`${URL_BASE}/rest/v1/notes?id=eq.${noteActuelle.id}`, {
                method: 'PATCH',
                headers: {
                    apikey: API_KEY,
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation'
                },
                body: JSON.stringify({
                    ...noteData,
                    updated_at: new Date().toISOString()
                })
            });

            console.log('Statut de la réponse (mise à jour):', response.status);
            const responseData = await response.json();
            console.log('Données de réponse:', responseData);

            if (!response.ok) {
                throw new Error(`Erreur lors de la mise à jour de la note: ${response.status}`);
            }

            showToast('success', 'Succès', 'Note mise à jour avec succès');
        } else {
            console.log('Création d\'une nouvelle note');
            const response = await fetch(`${URL_BASE}/rest/v1/notes`, {
                method: 'POST',
                headers: {
                    apikey: API_KEY,
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation'
                },
                body: JSON.stringify(noteData)
            });

            console.log('Statut de la réponse (création):', response.status);
            const responseData = await response.json();
            console.log('Données de réponse:', responseData);

            if (!response.ok) {
                throw new Error(`Erreur lors de la création de la note: ${response.status}`);
            }

            showToast('success', 'Succès', 'Note créée avec succès');
        }

        // Réinitialiser l'interface
        noteActuelle = null;
        noteTitleInput.value = '';
        noteContent.value = '';
        notePreview.innerHTML = '';

        // Recharger la liste des notes
        await chargerNotes();
    } catch (error) {
        console.error('Erreur détaillée:', error);
        showToast('error', 'Erreur', `Une erreur est survenue: ${error.message}`);
    }
}

// Supprimer une note
async function supprimerNote(id) {
    try {
        const response = await fetch(`${URL_BASE}/rest/v1/notes?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de la note');
        }

        showToast('success', 'Succès', 'Note supprimée avec succès');
        noteActuelle = null;
        noteTitleInput.value = '';
        noteContent.value = '';
        notePreview.innerHTML = '';
        await chargerNotes();
    } catch (error) {
        showToast('error', 'Erreur', 'Impossible de supprimer la note');
        console.error('Erreur:', error);
    }
}

// Fonction pour afficher les notifications toast
function showToast(type, title, message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Fonction pour afficher les alertes de confirmation
function showAlert(type, title, message, duration = 0, onConfirm) {
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.innerHTML = `
        <div class="custom-alert-header">
            <i class="fas ${getAlertIcon(type)} custom-alert-icon"></i>
            <h3 class="custom-alert-title">${title}</h3>
        </div>
        <div class="custom-alert-content">${message}</div>
        <div class="custom-alert-footer">
            <button class="custom-alert-btn custom-alert-btn-close">Annuler</button>
            <button class="custom-alert-btn custom-alert-btn-confirm">Confirmer</button>
        </div>
    `;

    const overlay = document.getElementById('alertOverlay');
    document.getElementById('alertContainer').appendChild(alert);
    overlay.classList.add('show');
    setTimeout(() => alert.classList.add('show'), 100);

    const closeBtn = alert.querySelector('.custom-alert-btn-close');
    const confirmBtn = alert.querySelector('.custom-alert-btn-confirm');

    const closeAlert = () => {
        alert.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    };

    closeBtn.addEventListener('click', closeAlert);
    confirmBtn.addEventListener('click', () => {
        closeAlert();
        if (onConfirm) onConfirm();
    });

    if (duration > 0) {
        setTimeout(closeAlert, duration);
    }
}

// Fonctions utilitaires pour les icônes
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-times-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
} 