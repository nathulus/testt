document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const contentFrame = document.getElementById('content-frame');
    const iframePlaceholder = document.getElementById('iframe-placeholder');
    const siteList = document.getElementById('site-list');
    const refreshFrameBtn = document.getElementById('refresh-frame-btn');
    const topbarTitle = document.getElementById('current-site-title');
    const homeLink = document.getElementById('home-link');

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
        iframePlaceholder.innerHTML = `<i class="fas fa-home placeholder-icon"></i><p>${message}</p>`;
        iframePlaceholder.style.display = 'flex';
        contentFrame.style.display = 'none';
        contentFrame.src = 'about:blank';
        topbarTitle.textContent = "Mon Hub";
    };

    const showLoading = () => {
         iframePlaceholder.innerHTML = `<i class="fas fa-spinner fa-spin placeholder-icon"></i><p>Chargement...</p>`;
         iframePlaceholder.style.display = 'flex';
         contentFrame.style.display = 'none';
    }

    const showIframe = () => {
        iframePlaceholder.style.display = 'none';
        contentFrame.style.display = 'block';
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
        if (url && url !== '#') {
            console.log("[script.js] Loading URL:", url);
            topbarTitle.textContent = siteName;
            showLoading();

            if (window.location.protocol === 'https:' && url.startsWith('http:')) {
                console.warn("[script.js] Blocked loading insecure HTTP content:", url);
                alert("Impossible de charger une page HTTP non sécurisée (http://...) sur cette page sécurisée (https://...).");
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
        const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeGJoZW95YXZ5ZGlzc2ZwdndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI0NTEsImV4cCI6MjA2MzY2ODQ1MX0.n10JVF_CSap7fmdbQYcgpmtrfacOX9HBaSB779KrV1o";
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
    console.log("[script.js] DOMContentLoaded finished.");

    // --- Chat IA Groq (nouveaux id) ---
    const openChatBtn = document.getElementById('open-chat-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatBtn = document.getElementById('chat-close-btn');
    const chatHeader = document.getElementById('chat-header');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Ouvre le chat
    openChatBtn.addEventListener('click', () => {
        chatPopup.style.display = 'flex';
    });
    // Ferme le chat
    closeChatBtn.addEventListener('click', () => {
        chatPopup.style.display = 'none';
    });

    // Déplacement du pop-up
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    chatHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = chatPopup.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // Calcul des nouvelles positions
            let newLeft = e.clientX - dragOffsetX;
            let newTop = e.clientY - dragOffsetY;
            // Limites de la fenêtre (collision)
            const minLeft = 0;
            const minTop = 0;
            const maxLeft = window.innerWidth - chatPopup.offsetWidth;
            const maxTop = window.innerHeight - chatPopup.offsetHeight;
            // Clamp
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

    // === CONFIGURATION API IA ===
    // Mets ici ta clé et l'URL de l'API Groq
    const IA_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    const IA_API_KEY = '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';

    // Gestion du chat (animation, alignement, appel API)
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;
        addChatMessage(msg, 'user');
        chatInput.value = '';
        // Affiche l'animation "l'IA écrit..."
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-typing';
        typingDiv.id = 'ia-typing';
        typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // --- Appel API Groq réel ---
        let iaResponse = '';
        try {
            const response = await fetch(IA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${IA_API_KEY}`
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
        // Retire l'animation
        const typing = document.getElementById('ia-typing');
        if (typing) typing.remove();
        addChatMessage(iaResponse, 'ia');
    });
    function addChatMessage(text, who) {
        const div = document.createElement('div');
        div.className = 'chat-message ' + (who === 'user' ? 'user' : 'ia');
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Gestion des clics sur les liens du menu
    document.getElementById('home-link').addEventListener('click', function(e) {
        e.preventDefault();
        loadUrlInFrame(localDashboardUrl, localDashboardName);
    });

    document.getElementById('notes-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        loadUrlInFrame('notes/notes.html', 'Notes');
    });

    document.getElementById('taches-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        loadUrlInFrame('taches/taches.html', 'Tâches');
    });

    document.getElementById('documents-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        loadUrlInFrame('documents/documents.html', 'Documents');
    });

    document.getElementById('settings-link').addEventListener('click', function(e) {
        e.preventDefault();
        loadUrlInFrame('settings/settings.html', 'Paramètres');
    });

    document.getElementById('admin-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        loadUrlInFrame('admin/admin.html', 'Administration');
    });

    async function ajouterLien(e) {
        e.preventDefault();
        const nom = document.getElementById("nom").value;
        const url = document.getElementById("url").value;
        const description = document.getElementById("description").value;
        const categorie = document.getElementById("categorie").value;

        const res = await fetch(`${URL_BASE}/rest/v1/URL`, {
            method: "POST",
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                Prefer: "return=representation"
            },
            body: JSON.stringify({ nom, url, description, categorie }),
        });

        if (!res.ok) {
            const error = await res.json();
            alert("Erreur lors de l'ajout : " + (error.message || JSON.stringify(error)));
            console.log(await res.json());
            return;
        }

        document.getElementById("add-link-form").reset();
        chargerLiens();
    }

    // Ajouter le gestionnaire d'événements pour les liens site-link
    document.querySelectorAll('.site-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('href');
            const title = link.getAttribute('data-title');
            loadUrlInFrame(url, title);
            if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('full-width');
            }
        });
    });
});