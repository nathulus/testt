// Script spécifique pour charger les liens dans welcome.html
const infraSitesListElement = document.getElementById('infra-sites-list');
const collegeSitesListElement = document.getElementById('college-sites-list');

const getFaviconUrl = (url) => {
    try {
        const urlObject = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=32`;
    } catch (e) {
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌐</text></svg>';
    }
};

const URL_BASE = "https://yfxbheoyavydissfpvwh.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeGJoZW95YXZ5ZGlzc2ZwdndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI0NTEsImV4cCI6MjA2MzY2ODQ1MX0.n10JVF_CSap7fmdbQYcgpmtrfacOX9HBaSB779KrV1o";

async function chargerLiens() {
    const res = await fetch(`${URL_BASE}/rest/v1/URL`, {
        headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
        },
    });
    const liens = await res.json();
    const infraList = document.getElementById('infra-sites-list');
    const collegeList = document.getElementById('college-sites-list');
    infraList.innerHTML = '';
    collegeList.innerHTML = '';
    liens.forEach(lien => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = getFaviconUrl(lien.url);
        img.alt = `Icone ${lien.nom}`;
        img.classList.add('site-icon');
        img.onerror = function() {
            this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=\".9em\" font-size=\"90\">🌐</text></svg>';
            this.style.backgroundColor = 'transparent';
            this.onerror = null;
        };
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('infra-site-info');
        const h3 = document.createElement('h3');
        h3.textContent = lien.nom;
        const description = document.createElement('p');
        description.classList.add('description');
        description.textContent = lien.description || 'Pas de description.';
        const urlP = document.createElement('p');
        urlP.classList.add('url');
        urlP.textContent = lien.url;
        const visitLink = document.createElement('a');
        visitLink.href = lien.url;
        visitLink.textContent = "Visiter";
        visitLink.classList.add('visit-link');
        visitLink.target = "_blank";
        visitLink.rel = "noopener noreferrer";
        infoDiv.appendChild(h3);
        infoDiv.appendChild(description);
        infoDiv.appendChild(urlP);
        infoDiv.appendChild(visitLink);
        li.appendChild(img);
        li.appendChild(infoDiv);

        // Utilisation de la catégorie pour déterminer où placer le lien
        if (lien.categorie === 'college') {
            collegeList.appendChild(li);
        } else if (lien.categorie === 'server') {
            infraList.appendChild(li);
        }
        // Les liens de catégorie 'app' ne sont pas affichés sur la page d'accueil
    });
}

document.addEventListener('DOMContentLoaded', chargerLiens); 