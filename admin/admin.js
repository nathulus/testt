// JS pour la gestion dynamique des liens dans admin.html
const URL_BASE = "https://yfxbheoyavydissfpvwh.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeGJoZW95YXZ5ZGlzc2ZwdndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTI0NTEsImV4cCI6MjA2MzY2ODQ1MX0.n10JVF_CSap7fmdbQYcgpmtrfacOX9HBaSB779KrV1o";

// Fonction pour exporter en CSV
function exporterCSV() {
    const liens = document.querySelectorAll('#liste-liens tr');
    let csvContent = "ID,Nom,URL,Description,Catégorie\n";
    
    liens.forEach(lien => {
        const id = lien.querySelector('td:first-child').textContent;
        const nom = lien.querySelector('td:nth-child(2) input').value;
        const url = lien.querySelector('td:nth-child(3) input').value;
        const description = lien.querySelector('td:nth-child(5) textarea').value;
        const categorie = lien.querySelector('td:nth-child(4) select').value;
        
        // Échapper les virgules et les guillemets dans les champs
        const escapedNom = `"${nom.replace(/"/g, '""')}"`;
        const escapedUrl = `"${url.replace(/"/g, '""')}"`;
        const escapedDescription = `"${description.replace(/"/g, '""')}"`;
        
        csvContent += `${id},${escapedNom},${escapedUrl},${escapedDescription},${categorie}\n`;
    });
    
    // Créer et télécharger le fichier CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'liens_hub.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function chargerLiens() {
    const res = await fetch(`${URL_BASE}/rest/v1/URL`, {
        headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
        },
    });
    const liens = await res.json();
    const tbody = document.getElementById("liste-liens");
    tbody.innerHTML = "";
    liens.forEach(lien => {
        tbody.innerHTML += `
            <tr>
                <td>${lien.id}</td>
                <td><input value="${lien.nom}" onchange="modifierLien(${lien.id}, 'nom', this.value)" class="input"></td>
                <td><input value="${lien.url}" onchange="modifierLien(${lien.id}, 'url', this.value)" class="input"></td>
                <td>
                    <select onchange="modifierLien(${lien.id}, 'categorie', this.value)" class="input">
                        <option value="app" ${lien.categorie === 'app' ? 'selected' : ''}>Application</option>
                        <option value="college" ${lien.categorie === 'college' ? 'selected' : ''}>Collège</option>
                        <option value="server" ${lien.categorie === 'server' ? 'selected' : ''}>Serveur</option>
                    </select>
                </td>
                <td><textarea onchange="modifierLien(${lien.id}, 'description', this.value)" class="input">${lien.description}</textarea></td>
                <td>
                    <button class="action-button" style="background:#e11d48;" onclick="supprimerLien(${lien.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

async function ajouterLien(e) {
    e.preventDefault();
    const nom = document.getElementById("nom").value;
    const url = document.getElementById("url").value;
    const description = document.getElementById("description").value;
    const categorie = document.getElementById("categorie").value;
    
    await fetch(`${URL_BASE}/rest/v1/URL`, {
        method: "POST",
        headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation"
        },
        body: JSON.stringify({ nom, url, description, categorie }),
    });
    document.getElementById("add-link-form").reset();
    chargerLiens();
}

async function modifierLien(id, champ, valeur) {
    await fetch(`${URL_BASE}/rest/v1/URL?id=eq.${id}`, {
        method: "PATCH",
        headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ [champ]: valeur }),
    });
    chargerLiens();
}

async function supprimerLien(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce lien ?")) {
        await fetch(`${URL_BASE}/rest/v1/URL?id=eq.${id}`, {
            method: "DELETE",
            headers: {
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        chargerLiens();
    }
}

document.getElementById("add-link-form").addEventListener("submit", ajouterLien);
document.addEventListener('DOMContentLoaded', chargerLiens);
window.modifierLien = modifierLien;
window.supprimerLien = supprimerLien;
window.exporterCSV = exporterCSV; 