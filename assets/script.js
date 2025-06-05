document.addEventListener('DOMContentLoaded', () => {
    console.log("[script.js] DOMContentLoaded triggered.");
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const contentFrame = document.getElementById('content-frame');
    const iframePlaceholder = document.getElementById('iframe-placeholder');
    const siteList = document.getElementById('site-list');
    const refreshFrameBtn = document.getElementById('refresh-frame-btn');
    const topbarTitle = document.getElementById('current-site-title');
    const homeLink = document.getElementById('home-link');

    if (!sidebar || !mainContent || !toggleSidebarBtn || !contentFrame || !iframePlaceholder || !siteList || !refreshFrameBtn || !topbarTitle || !homeLink) {
        console.error("[script.js] Un ou plusieurs éléments essentiels du DOM sont introuvables.");
        return; // Arrêter l'exécution si les éléments de base ne sont pas là
    }

    const appSites = [
        { name: "AppTache", url: "https://apptache.onrender.com" },
        { name: "Interface Nathan", url: "https://interface-nathan.onrender.com" },
        { name: "Bot Discord", url: "https://botdiscord-v1wr.onrender.com" },
    ];

    const infraSites = [
        { name: "Render Dashboard", url: "https://dashboard.render.com/project/prj-ctg6uk52ng1s73bdam20", description: "Hébergeur serveurs" },
        { name: "GitHub Dashboard", url: "https://github.com/dashboard", description: "Code source et gestion" },
        { name: "UptimeRobot Stats", url: "https://dashboard.uptimerobot.com/monitors", description: "Statistiques de disponibilité" },
    ];

    const localDashboardUrl = 'welcome/welcome.html';
    const localDashboardName = 'Tableau de Bord';

    const CATEGORIES_FIXES = [
        { title: "Collège", icon: "fa-school" },
        { title: "Serveurs", icon: "fa-server" },
        { title: "Applications", icon: "fa-th-large" }
    ];

    const showPlaceholder = (message = "Sélectionnez une option dans le menu ou cliquez sur Accueil.") => {
        if (iframePlaceholder && contentFrame && topbarTitle) {
            iframePlaceholder.innerHTML = `<i class="fas fa-home placeholder-icon"></i><p>${message}</p>`;
            iframePlaceholder.style.display = 'flex';
            contentFrame.style.display = 'none';
            contentFrame.src = 'about:blank';
            topbarTitle.textContent = "Mon Hub";
        }
    };

    const showLoading = () => {
         if (iframePlaceholder && contentFrame) {
             iframePlaceholder.innerHTML = `<i class="fas fa-spinner fa-spin placeholder-icon"></i><p>Chargement...</p>`;
             iframePlaceholder.style.display = 'flex';
             contentFrame.style.display = 'none';
         }
    }

    const showIframe = () => {
        if (iframePlaceholder && contentFrame) {
            iframePlaceholder.style.display = 'none';
            contentFrame.style.display = 'block';
        }
    };

    const getFaviconUrl = (url) => {
        try {
             if (!url || url === '#' || url === 'about:blank') {
                 return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏠</text></svg>';
             }
             const urlObject = new URL(url);
             return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=32`;
        } catch (e) {
             console.error("Error generating favicon URL:", e);
             return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌐</text></svg>';
        }
    };


    const loadUrlInFrame = (url, siteName = "Contenu") => {
        if (!contentFrame || !topbarTitle || !iframePlaceholder) return;

        if (url && url !== '#') {
            console.log("[script.js] Loading URL:", url);
            topbarTitle.textContent = siteName;
            showLoading();

            if (window.location.protocol === 'https:' && url.startsWith('http:')) {
                console.warn("[script.js] Blocked loading insecure HTTP content:", url);
                alert("Impossible de charger une page HTTP non sécurisée (http://...) sur cette page sécurisée (https://...). Besoin de HTTPS.");
                showPlaceholder("Impossible de charger le contenu non sécurisé.");
                return;
            }

             if (url === 'about:blank') {
                console.log("[script.js] Loading placeholder for about:blank link.");
                showPlaceholder(`Le lien "${siteName}" n'est pas configuré.`);
                return;
             }

            setTimeout(() => {
                try {
                    contentFrame.src = url;
                } catch (e) {
                    console.error("[script.js] Error setting iframe src:", e);
                    alert("Une erreur s'est produite lors de la tentative de chargement de l'URL.");
                    showPlaceholder("Erreur de chargement.");
                }
            }, 50);

        } else {
            console.log("[script.js] Loading placeholder (URL is blank, '#', or invalid).");
            showPlaceholder();
        }
    };

    // Chemins corrigés pour la nouvelle structure de dossiers
    const independentLinks = [
        { name: "Tâches", url: "taches/taches.html", icon: "fa-tasks" },
        { name: "Notes", url: "notes/notes.html", icon: "fa-sticky-note" },
        { name: "Documents", url: "documents/documents.html", icon: "fa-file-alt" },
        { name: "Gestion des Liens", url: "admin/admin.html", icon: "fa-tools" }
    ];

    async function fetchMenuCategories() {
        const URL_BASE = "https://yfxbheoyavydissfpvwh.supabase.co";
        const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeGJoZW95YXZ5ZGlzc2ZwdamhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI0NTEsImV4cCI6MjA2MzY2ODQ1MX0.n10JVF_CSap7fmdbQYcgpmtrfacOX9HBaSB779KrV1o";
        const response = await fetch(`${URL_BASE}/rest/v1/URL`, {
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        const data = await response.json();

        function mapCategorie(cat) {
            if (!cat) return null;
            cat = cat.trim().toLowerCase();
            if (cat === 'education' || cat === 'collège' || cat === 'college') return 'Collège';
            if (
                cat === 'developpement' ||
                cat === 'développement' ||
                cat === 'serveur' ||
                cat === 'serveurs' ||
                cat === 'server'
            ) return 'Serveurs';
            if (cat === 'application' || cat === 'applications' || cat === 'app') return 'Applications';
            return null;
        }

        const liensParCategorie = { 'Collège': [], 'Serveurs': [], 'Applications': [] };
        data.forEach(item => {
            const cat = mapCategorie(item.categorie);
            if (cat) {
                liensParCategorie[cat].push({ name: item.nom, url: item.url });
            }
        });

        return [
            { title: "Collège", icon: "fa-school", links: liensParCategorie["Collège"] },
            { title: "Serveurs", icon: "fa-server", links: liensParCategorie["Serveurs"] },
            { title: "Applications", icon: "fa-th-large", links: liensParCategorie["Applications"] }
        ];
    }

    const populateSidebar = async (menuCategories) => {
        const dynamicLinks = siteList.querySelectorAll('li.menu-category, li.menu-link, li.independent-link');
        dynamicLinks.forEach(link => link.remove());

        // Trouver Accueil et Paramètres
        const homeLi = siteList.querySelector('li:first-child');
        const paramLi = siteList.querySelector('li:last-child');

        if (!homeLi || !paramLi) {
             console.error("[script.js] Impossible de trouver les liens Accueil ou Paramètres.");
             return;
        }

        // Ajouter les liens indépendants après Accueil
        independentLinks.forEach(link => {
            const li = document.createElement('li');
            li.classList.add('independent-link');
            const a = document.createElement('a');
            a.href = '#';
            a.dataset.url = link.url;
            a.dataset.name = link.name;
            const icon = document.createElement('i');
            icon.className = `fas ${link.icon}`;
            icon.style.marginRight = '15px';
            a.appendChild(icon);
            a.appendChild(document.createTextNode(` ${link.name}`));
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadUrlInFrame(link.url, link.name);
                if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('full-width');
                }
            });
            li.appendChild(a);
            siteList.insertBefore(li, paramLi);
        });

        menuCategories.forEach((category, catIdx) => {
            // Titre de catégorie avec folder et flèche
            const catLi = document.createElement('li');
            catLi.classList.add('menu-category', 'closed');
            catLi.innerHTML = `<span><i class='fas fa-folder folder-icon'></i> ${category.title}</span><span class='arrow'><i class='fas fa-chevron-down'></i></span>`;
            siteList.insertBefore(catLi, paramLi);

            // Gestion du repli/dépli
            catLi.addEventListener('click', () => {
                const isOpen = catLi.classList.toggle('open');
                catLi.classList.toggle('closed', !isOpen);
                // Masquer/afficher les liens de la catégorie
                category.links.forEach((_, idx) => {
                    const linkLi = siteList.querySelector(`li.menu-link[data-cat='${catIdx}'][data-idx='${idx}']`);
                    if (linkLi) {
                        if (isOpen) {
                            linkLi.classList.remove('hidden');
                        } else {
                            linkLi.classList.add('hidden');
                        }
                    }
                });
            });

            // Liens de la catégorie
            category.links.forEach((site, idx) => {
                const li = document.createElement('li');
                li.classList.add('menu-link', 'hidden');
                li.dataset.cat = catIdx;
                li.dataset.idx = idx;
                const a = document.createElement('a');
                a.href = '#';
                a.dataset.url = site.url;
                a.dataset.name = site.name;
                const img = document.createElement('img');
                img.src = getFaviconUrl(site.url);
                img.alt = `Icone ${site.name}`;
                img.classList.add('site-favicon');
                img.onerror = function() {
                    this.src = 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🌐</text></svg>';
                    this.classList.add('favicon-fallback');
                    this.onerror = null;
                };
                a.appendChild(img);
                a.appendChild(document.createTextNode(` ${site.name}`));
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (category.title === "Collège" || category.title === "Serveurs") {
                        window.open(site.url, '_blank');
                    } else {
                        loadUrlInFrame(site.url, site.name);
                    }
                    if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
                        sidebar.classList.add('collapsed');
                        mainContent.classList.add('full-width');
                    }
                });
                li.appendChild(a);
                siteList.insertBefore(li, paramLi);
            });
        });
    };


    contentFrame.addEventListener('load', () => {
        console.log(`[script.js] Iframe load event fired. Current src: ${contentFrame.src}`);

        if (contentFrame.src && contentFrame.src !== 'about:blank') {
            try {
                 const canAccess = contentFrame.contentWindow && contentFrame.contentWindow.location.href;
                 const iframeLocation = canAccess ? contentFrame.contentWindow.location.href : ' inaccessible (cross-origin or empty)';
                 console.log(`[script.js] Iframe content location: ${iframeLocation}`);

                if (contentFrame.src.endsWith(localDashboardUrl)) {
                     console.log("[script.js] Local dashboard loaded. Sending infra sites data via postMessage.");
                     showIframe();

                     setTimeout(() => {
                         try {
                            console.log("[script.js] Sending message to iframe:", { type: 'loadInfraSites', sites: infraSites });
                            contentFrame.contentWindow.postMessage({
                                type: 'loadInfraSites',
                                sites: infraSites
                            }, '*');
                         } catch (e) {
                            console.error("[script.js] Failed to postMessage to iframe:", e);
                         }
                     }, 100);

                } else if (canAccess && contentFrame.contentWindow.location.href !== 'about:blank') {
                     console.log("[script.js] Other accessible content loaded.");
                     showIframe();
                } else {
                     console.warn("[script.js] Iframe loaded, but content access is restricted or page is blank after load. Assuming loaded.");
                     showIframe();
                }

            } catch (e) {
                console.warn("[script.js] Could not access iframe content (likely cross-origin restrictions):", contentFrame.src, e);
                 showIframe();
            }
        } else {
             if (!iframePlaceholder.textContent.includes("Chargement")) {
                 console.log("[script.js] Iframe src is about:blank, ensuring placeholder is shown.");
             }
        }
    });

    contentFrame.addEventListener('error', (e) => {
         console.error("[script.js] Iframe loading error event:", e);
         const failedUrl = contentFrame.src !== 'about:blank' ? contentFrame.src : (topbarTitle.textContent || "une page");
         showPlaceholder(`Erreur lors du chargement de ${failedUrl}.`);
     });


    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('full-width');
         console.log(`[script.js] Sidebar toggled. Collapsed: ${sidebar.classList.contains('collapsed')}`);
    });

    refreshFrameBtn.addEventListener('click', () => {
        if (contentFrame.style.display === 'block' && contentFrame.src && contentFrame.src !== 'about:blank') {
            console.log("[script.js] Refresh button clicked. Refreshing iframe:", contentFrame.src);
            const currentSrc = contentFrame.src;
            const currentName = topbarTitle.textContent;
            showLoading();
            setTimeout(() => {
                try {
                     if (contentFrame.contentWindow && contentFrame.contentWindow.location.href !== 'about:blank') {
                          contentFrame.contentWindow.location.reload();
                          console.log("[script.js] Attempting contentWindow.location.reload()");
                     } else {
                         contentFrame.src = currentSrc;
                         console.log("[script.js] Falling back to resetting iframe src to:", currentSrc);
                     }
                    topbarTitle.textContent = currentName;
                 } catch (e) {
                    console.warn("[script.js] Could not access iframe content for reload, resetting src:", e);
                    contentFrame.src = currentSrc;
                    topbarTitle.textContent = currentName;
                 }
            }, 50);
        } else {
            console.log("[script.js] Nothing to refresh or iframe not visible.");
        }
    });

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("[script.js] Home link clicked.");
        loadUrlInFrame(localDashboardUrl, localDashboardName);

        if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('full-width');
        }
    });

    window.addEventListener('message', (event) => {
        const message = event.data;
        console.log("[script.js] Message received from iframe:", message);

        if (message.type === 'navigateToUrl' && message.url) {
            console.log("[script.js] Received navigation request from iframe:", message.url);
            loadUrlInFrame(message.url, message.name || "Contenu Externe");

             if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('full-width');
             }
        }
    });


    const initializeLayout = () => {
        console.log("[script.js] Initializing layout...");
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('full-width');
             console.log("[script.js] Mobile layout applied: sidebar collapsed.");
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('full-width');
             console.log("[script.js] Desktop layout applied: sidebar expanded.");
        }

        loadUrlInFrame(localDashboardUrl, localDashboardName);
    };

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log("[script.js] Window resized.");
            const isMobile = window.innerWidth <= 768;

            if (!isMobile) {
                 if (!sidebar.classList.contains('collapsed')) {
                    mainContent.classList.remove('full-width');
                 }
            } else {
                 if (!sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                 }
                 mainContent.classList.add('full-width');
            }
        }, 150);
    });

    async function main() {
        const menuCategories = await fetchMenuCategories();
        populateSidebar(menuCategories);
    }

    main();
    initializeLayout();
    console.log("[script.js] Initial script execution finished. Waiting for DOMContentLoaded.");
});

// Fonctions utilitaires pour le chat (doivent être accessibles globalement si appelées depuis d'autres scopes)
function addChatMessage(text, who) {
    const chatMessages = document.getElementById('chat-messages');
     if (chatMessages) {
        const div = document.createElement('div');
        div.className = 'chat-message ' + (who === 'user' ? 'user' : 'ia');
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
     }
}

// Assurez-vous que d'autres fonctions potentiellement appelées depuis l'extérieur du DOMContentLoaded sont définies ici
// ... (ajoutez ici d'autres fonctions si nécessaire, comme ajouterLien si elle est utilisée globalement)

// Code lié à l'installation PWA et au chat qui nécessite que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // --- Chat IA Groq ---
    const openChatBtn = document.getElementById('open-chat-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatBtn = document.getElementById('chat-close-btn');
    const chatHeader = document.getElementById('chat-header');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Vérifiez si les éléments existent avant d'ajouter des écouteurs d'événements
    if (openChatBtn && chatPopup && closeChatBtn && chatHeader && chatForm && chatInput && chatMessages) {
        console.log("[script.js] Éléments du chat pop-up trouvés. Initialisation...");
        // Ouvre le chat
        openChatBtn.addEventListener('click', () => {
            chatPopup.style.display = 'flex';
        });
        // Ferme le chat
        closeChatBtn.addEventListener('click', () => {
            chatPopup.style.display = 'none';
        });

        // Déplacement du pop-up (si votre code pour cela est dans ce fichier)
        let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
        if(chatHeader) { // Double vérification
            chatHeader.addEventListener('mousedown', (e) => {
                isDragging = true;
                const rect = chatPopup.getBoundingClientRect();
                dragOffsetX = e.clientX - rect.left;
                dragOffsetY = e.clientY - rect.top;
                document.body.style.userSelect = 'none';
            });
        }
        document.addEventListener('mousemove', (e) => {
            if (isDragging && chatPopup) {
                let newLeft = e.clientX - dragOffsetX;
                let newTop = e.clientY - dragOffsetY;
                const minLeft = 0;
                const minTop = 0;
                const maxLeft = window.innerWidth - chatPopup.offsetWidth;
                const maxTop = window.innerHeight - chatPopup.offsetHeight;
                newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
                newTop = Math.max(minTop, Math.min(newTop, maxTop));
                chatPopup.style.left = newLeft + 'px';
                chatPopup.style.top = newTop + 'px';
                chatPopup.style.right = 'auto';
            }
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = '';
        });

        // Soumission du formulaire de chat
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg) return;
            addChatMessage(msg, 'user');
            chatInput.value = '';
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-typing';
            typingDiv.id = 'ia-typing';
            typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            let iaResponse = '';
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer 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'
                    },
                    body: JSON.stringify({
                        model: 'llama3-8b-8192',
                        messages: [
                            { role: 'system', content: "Réponds toujours en français, sauf si l'utilisateur te demande explicitement de parler ou de traduire dans une autre langue (ex : 'traduis en anglais', 'translate in spanish', etc.), dans ce cas, réponds ou traduis dans la langue demandée." },
                            { role: 'user', content: msg }
                        ]
                    })
                });
                const data = await response.json();
                iaResponse = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
                    ? data.choices[0].message.content
                    : "Réponse IA non disponible.";
            } catch (err) {
                iaResponse = "Erreur lors de la requête à l'IA.";
            }
            const typing = document.getElementById('ia-typing');
            if (typing) typing.remove();
            addChatMessage(iaResponse, 'ia');
        });
    } else {
        console.error('[script.js] Un ou plusieurs éléments du chat pop-up sont introuvables lors du DOMContentLoaded.');
    }

    // --- Code lié à l'installation PWA ---
    console.log("[script.js] Initialisation PWA...");
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    if (installBtn) {
        console.log("[script.js] Bouton d'installation trouvé.");
        // Cacher le bouton par défaut
        installBtn.style.display = 'none';

        // Vérifier si le service worker est supporté
        if ('serviceWorker' in navigator) {
            console.log('ServiceWorker supporté par le navigateur.');
            // L'enregistrement est déjà géré par la balise <script> dans index.html
        } else {
            console.log('ServiceWorker non supporté par le navigateur.');
        }

        // Écouter l'événement beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Événement beforeinstallprompt déclenché', e);
            e.preventDefault();
            deferredPrompt = e;
            // Afficher le bouton UNIQUEMENT quand l'installation est possible
            console.log("[script.js] beforeinstallprompt déclenché, affichage du bouton d'installation.");
            installBtn.style.display = 'flex';
        });

        // Vérifier si l'app est déjà installée et masquer le bouton si c'est le cas
        window.addEventListener('appinstalled', () => {
            console.log('Application installée avec succès !');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        });

         // Masquer le bouton si l'installation n'est pas possible au chargement (si beforeinstallprompt n'a pas encore été déclenché)
        // Ce check initial peut être moins critique si beforeinstallprompt est géré.
        // Cependant, nous le laissons pour s'assurer qu'il n'apparaît pas par défaut.
        // Note: deferredPrompt n'aura une valeur que si beforeinstallprompt s'est déjà déclenché.
        // Un meilleur check serait de voir si l'app est déjà installée via window.matchMedia('(display-mode: standalone)').matches

        if (!window.matchMedia('(display-mode: standalone)').matches) {
             console.log("[script.js] L'application n'est pas en mode standalone.");
             // Le bouton reste caché jusqu'à beforeinstallprompt
        } else {
             console.log("[script.js] L'application est en mode standalone (déjà installée ou lancée depuis l'écran d'accueil).");
             if (installBtn) installBtn.style.display = 'none'; // Cacher si déjà en mode standalone
        }

        installBtn.addEventListener('click', async () => {
            console.log('[script.js] Bouton d\'installation cliqué');
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('Résultat de l\'installation:', outcome);
                if (outcome === 'accepted') {
                    console.log('Installation acceptée par l\'utilisateur !');
                    if (installBtn) installBtn.style.display = 'none';
                } else {
                    console.log('Installation refusée par l\'utilisateur.');
                }
                deferredPrompt = null; // Réinitialiser deferredPrompt après utilisation
            } else {
                console.log('[script.js] Aucune installation en attente ou déjà installée.');
                alert('L\'installation n\'est pas disponible pour le moment ou l\'application est déjà installée. Assurez-vous d\'utiliser un navigateur compatible (Chrome, Edge, Firefox Android...) et que le site est servi en HTTPS.');
            }
        });
    } else {
        console.error("[script.js] Bouton d\'installation (#install-btn) introuvable.");
    }
});
