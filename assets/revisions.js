// Gestion du stockage local
const STORAGE_KEY = 'revision_data';

// Structure de données pour les matières et chapitres
let revisionData = {
    subjects: []
};

// Configuration Supabase
const SUPABASE_URL = 'https://yfxbheoyavydissfpvwh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeGJoZW95YXZ5ZGlzc2ZwdndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI0NTEsImV4cCI6MjA2MzY2ODQ1MX0.n10JVF_CSap7fmdbQYcgpmtrfacOX9HBaSB779KrV1o';

document.addEventListener('DOMContentLoaded', () => {
    // Récupération des éléments avec vérification
    const elements = {
        chapterModal: document.getElementById('chapter-modal'),
        notesModal: document.getElementById('notes-modal'),
        chapterForm: document.getElementById('chapter-form'),
        showNotesBtn: document.getElementById('show-notes-btn'),
        showRevisionsBtn: document.getElementById('show-revisions-btn'),
        closeNotesBtn: document.getElementById('close-notes'),
        cancelChapterBtn: document.getElementById('cancel-chapter'),
        revisionsSection: document.querySelector('.revisions-section'),
        subjectName: document.getElementById('subject-name'),
        totalChapters: document.getElementById('total-chapters'),
        completedChapters: document.getElementById('completed-chapters'),
        progressPercentage: document.getElementById('progress-percentage'),
        averageValue: document.querySelector('.average-value'),
        subjectNotes: document.querySelector('.subject-notes')
    };

    // Gestion des modals
    function showModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function hideModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Gestion du bouton Notes et Moyennes
    if (elements.showNotesBtn) {
        elements.showNotesBtn.addEventListener('click', () => {
            loadNotes();
            showModal(elements.notesModal);
        });
    }

    // Gestion du bouton Fermer pour le modal des notes
    if (elements.closeNotesBtn) {
        elements.closeNotesBtn.addEventListener('click', () => {
            hideModal(elements.notesModal);
        });
    }

    // Gestion du bouton Révisions
    if (elements.showRevisionsBtn) {
        elements.showRevisionsBtn.addEventListener('click', () => {
            if (elements.revisionsSection) {
                elements.revisionsSection.style.display = 'block';
                loadRevisions();
            }
        });
    }

    // Fermer les modals en cliquant en dehors
    window.addEventListener('click', (e) => {
        if (e.target === elements.chapterModal) {
            hideModal(elements.chapterModal);
            if (elements.chapterForm) {
                elements.chapterForm.reset();
            }
        }
        if (e.target === elements.notesModal) {
            hideModal(elements.notesModal);
        }
    });

    // Charger les révisions
    async function loadRevisions() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/revisions`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const revisions = await response.json();
            
            // Vider le conteneur des sujets
            const subjectsContainer = document.querySelector('.subjects-container');
            if (subjectsContainer) {
                subjectsContainer.innerHTML = '';

                // Créer les cartes pour chaque matière
                const matieres = [
                    { nom: 'Histoire', emoji: '📜', couleur: 'var(--history-color)' },
                    { nom: 'Géographie', emoji: '🌍', couleur: 'var(--geography-color)' },
                    { nom: 'Français', emoji: '📚', couleur: 'var(--french-color)' },
                    { nom: 'Mathématiques', emoji: '📐', couleur: 'var(--math-color)' },
                    { nom: 'Physique', emoji: '⚡', couleur: 'var(--physics-color)' },
                    { nom: 'Chimie', emoji: '🧪', couleur: 'var(--chemistry-color)' },
                    { nom: 'SVT', emoji: '🔬', couleur: 'var(--svt-color)' },
                    { nom: 'Technologie', emoji: '💻', couleur: 'var(--technology-color)' },
                    { nom: 'Anglais', emoji: '🌐', couleur: 'var(--english-color)' },
                    { nom: 'Espagnol', emoji: '🇪🇸', couleur: 'var(--spanish-color)' }
                ];

                matieres.forEach(matiere => {
                    const subjectCard = document.createElement('div');
                    subjectCard.className = 'subject-card';
                    subjectCard.style.borderColor = matiere.couleur;

                    const header = document.createElement('div');
                    header.className = 'subject-header';
                    header.innerHTML = `
                        <div class="subject-title">
                            <span class="subject-emoji">${matiere.emoji}</span>
                            <h3>${matiere.nom}</h3>
                        </div>
                        <button class="btn-icon add-chapter-btn" data-subject="${matiere.nom}">
                            <i class="fas fa-plus"></i>
                        </button>
                    `;

                    const chaptersList = document.createElement('div');
                    chaptersList.className = 'chapters-list';
                    chaptersList.id = `${matiere.nom.toLowerCase()}-chapters`;

                    // Ajouter les chapitres de cette matière
                    const matiereRevisions = revisions.filter(r => r.matiere === matiere.nom);
                    matiereRevisions.forEach(revision => {
                        const chapterElement = createChapterElement(revision);
                        chaptersList.appendChild(chapterElement);
                    });

                    subjectCard.appendChild(header);
                    subjectCard.appendChild(chaptersList);
                    subjectsContainer.appendChild(subjectCard);
                });

                // Réattacher les événements aux boutons d'ajout de chapitre
                document.querySelectorAll('.add-chapter-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const subject = btn.dataset.subject;
                        if (elements.subjectName) {
                            elements.subjectName.value = subject;
                        }
                        showModal(elements.chapterModal);
                    });
                });
            }

            // Mettre à jour les statistiques
            updateStats(revisions);
        } catch (error) {
            console.error('Erreur lors du chargement des révisions:', error);
        }
    }

    // Mettre à jour les statistiques
    function updateStats(revisions) {
        const totalChapters = revisions.length;
        const completedChapters = revisions.filter(r => r.termine).length;
        const progressPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

        if (elements.totalChapters) elements.totalChapters.textContent = totalChapters;
        if (elements.completedChapters) elements.completedChapters.textContent = completedChapters;
        if (elements.progressPercentage) elements.progressPercentage.textContent = `${progressPercentage}%`;
    }

    // Créer un élément de chapitre
    function createChapterElement(revision) {
        const div = document.createElement('div');
        div.className = 'chapter-item';
        div.innerHTML = `
            <div class="chapter-info">
                <div class="chapter-name">${revision.chapitre}</div>
                <div class="chapter-links">
                    ${revision.lien_video ? `<a href="${revision.lien_video}" target="_blank"><i class="fas fa-video"></i> Vidéo</a>` : ''}
                    ${revision.lien_quiz ? `<a href="${revision.lien_quiz}" target="_blank"><i class="fas fa-question-circle"></i> Quiz</a>` : ''}
                </div>
            </div>
            <label class="chapter-complete">
                <input type="checkbox" ${revision.termine ? 'checked' : ''} 
                    onchange="toggleChapterCompletion('${revision.id}', this.checked)">
                Terminé
            </label>
        `;
        return div;
    }

    // Ajouter un nouveau chapitre
    if (elements.chapterForm) {
        elements.chapterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(elements.chapterForm);
            
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/revisions`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        matiere: formData.get('subject'),
                        chapitre: formData.get('chapter'),
                        lien_video: formData.get('video'),
                        lien_quiz: formData.get('quiz'),
                        termine: false
                    })
                });

                if (response.ok) {
                    hideModal(elements.chapterModal);
                    elements.chapterForm.reset();
                    loadRevisions();
                } else {
                    console.error('Erreur lors de l\'ajout du chapitre');
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout du chapitre:', error);
            }
        });
    }

    // Basculer l'état de complétion d'un chapitre
    window.toggleChapterCompletion = async (id, completed) => {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/revisions?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    termine: completed
                })
            });

            if (response.ok) {
                loadRevisions();
            } else {
                console.error('Erreur lors de la mise à jour du chapitre');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du chapitre:', error);
        }
    };

    // Charger les notes
    async function loadNotes() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const notes = await response.json();
            
            // Calculer la moyenne générale
            const moyenne = notes.reduce((acc, note) => acc + note.valeur, 0) / notes.length;
            if (elements.averageValue) {
                elements.averageValue.textContent = moyenne.toFixed(2);
            }

            // Afficher les notes par matière
            if (elements.subjectNotes) {
                elements.subjectNotes.innerHTML = notes.map(note => `
                    <div class="subject-note-item">
                        <span class="subject-note-name">${note.matiere}</span>
                        <span class="subject-note-value">${note.valeur}/20</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des notes:', error);
        }
    }

    // Charger les révisions au démarrage
    loadRevisions();
});