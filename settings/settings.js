// Gestion des thèmes
const themeManager = {
    currentTheme: {},
    defaultTheme: {
        colors: {
            primary: '#2c3e50',
            secondary: '#34495e',
            accent: '#3498db'
        },
        gradient: {
            sidebar: {
                type: 'linear',
                angle: 150,
                stops: [
                    { position: 0, color: '#2c3e50' },
                    { position: 50, color: '#3498db' },
                    { position: 100, color: '#2980b9' }
                ]
            }
        },
        effects: {
            shadow: {
                x: 0,
                y: 4,
                blur: 12,
                spread: 0,
                color: 'rgba(0,0,0,0.2)'
            },
            radius: 8
        },
        animation: {
            speed: 1,
            easing: 'ease-in-out',
            bezier: [0.4, 0, 0.2, 1]
        }
    },

    init() {
        this.loadTheme();
        this.initializeControls();
        this.initializeEventListeners();
        this.updatePreview();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('userTheme');
        this.currentTheme = savedTheme ? JSON.parse(savedTheme) : {...this.defaultTheme};
        this.applyTheme(this.currentTheme);
    },

    initializeControls() {
        // Initialisation des contrôles de couleur
        document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
            const variable = input.dataset.var;
            const hexInput = document.querySelector(`.color-hex[data-for="${input.id}"]`);
            
            input.value = this.currentTheme.colors[input.id.replace('-color', '')];
            hexInput.value = input.value;

            input.addEventListener('input', (e) => {
                hexInput.value = e.target.value;
                this.updateThemeProperty(['colors', input.id.replace('-color', '')], e.target.value);
            });

            hexInput.addEventListener('input', (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    input.value = e.target.value;
                    this.updateThemeProperty(['colors', input.id.replace('-color', '')], e.target.value);
                }
            });
        });

        // Initialisation du contrôle de dégradé
        this.initializeGradientControls();

        // Initialisation des contrôles d'effets
        this.initializeEffectsControls();

        // Initialisation des contrôles d'animation
        this.initializeAnimationControls();
    },

    initializeGradientControls() {
        const gradientContainer = document.getElementById('sidebar-gradient');
        
        // Gestion des stops de dégradé
        gradientContainer.querySelectorAll('.gradient-stop').forEach(stop => {
            const colorInput = stop.querySelector('input[type="color"]');
            const positionInput = stop.querySelector('input[type="number"]');

            colorInput.addEventListener('input', () => this.updateGradient());
            positionInput.addEventListener('input', () => {
                stop.style.left = `${positionInput.value}%`;
                this.updateGradient();
            });
        });

        // Ajout de nouveaux stops
        document.querySelector('.add-stop').addEventListener('click', () => {
            const newStop = document.createElement('div');
            newStop.className = 'gradient-stop';
            newStop.style.left = '50%';
            newStop.innerHTML = `
                <input type="color" value="#ffffff">
                <input type="number" min="0" max="100" value="50">
            `;
            gradientContainer.appendChild(newStop);
            this.initializeGradientControls();
        });

        // Type de dégradé et angle
        document.querySelector('.gradient-type').addEventListener('change', (e) => {
            this.updateThemeProperty(['gradient', 'sidebar', 'type'], e.target.value);
            this.updateGradient();
        });

        document.querySelector('.gradient-angle').addEventListener('input', (e) => {
            this.updateThemeProperty(['gradient', 'sidebar', 'angle'], parseInt(e.target.value));
            this.updateGradient();
        });
    },

    initializeEffectsControls() {
        // Contrôles d'ombre
        ['shadow-x', 'shadow-y', 'shadow-blur', 'shadow-spread'].forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('input', () => this.updateShadow());
        });

        document.getElementById('shadow-color').addEventListener('input', () => this.updateShadow());
        document.getElementById('shadow-opacity').addEventListener('input', () => this.updateShadow());

        // Contrôles de radius
        document.querySelectorAll('.radius-presets button').forEach(button => {
            button.addEventListener('click', () => {
                const radius = button.dataset.radius;
                document.getElementById('radius-size').value = radius === 'full' ? 30 : radius;
                this.updateRadius();
            });
        });

        document.getElementById('radius-size').addEventListener('input', () => this.updateRadius());
    },

    initializeAnimationControls() {
        // Vitesse d'animation
        document.getElementById('animation-speed').addEventListener('input', (e) => {
            this.updateThemeProperty(['animation', 'speed'], parseFloat(e.target.value));
            this.updateAnimation();
        });

        // Presets de vitesse
        document.querySelectorAll('.speed-presets button').forEach(button => {
            button.addEventListener('click', () => {
                const speed = parseFloat(button.dataset.speed);
                document.getElementById('animation-speed').value = speed;
                this.updateThemeProperty(['animation', 'speed'], speed);
                this.updateAnimation();
            });
        });

        // Easing
        document.getElementById('animation-easing').addEventListener('change', (e) => {
            const value = e.target.value;
            this.updateThemeProperty(['animation', 'easing'], value);
            document.querySelector('.bezier-editor').style.display = value === 'custom' ? 'block' : 'none';
            this.updateAnimation();
        });

        // Éditeur de courbe de Bézier
        if (document.getElementById('bezier-curve')) {
            this.initializeBezierEditor();
        }
    },

    initializeBezierEditor() {
        const canvas = document.getElementById('bezier-curve');
        const ctx = canvas.getContext('2d');
        const bezierInputs = document.querySelectorAll('.bezier-controls input');

        const drawBezierCurve = () => {
            const values = Array.from(bezierInputs).map(input => parseFloat(input.value));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dessiner la grille
            ctx.strokeStyle = '#eee';
            ctx.beginPath();
            for (let i = 0; i <= 10; i++) {
                const pos = i * (canvas.width / 10);
                ctx.moveTo(pos, 0);
                ctx.lineTo(pos, canvas.height);
                ctx.moveTo(0, pos);
                ctx.lineTo(canvas.width, pos);
            }
            ctx.stroke();

            // Dessiner la courbe
            ctx.strokeStyle = '#3498db';
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            ctx.bezierCurveTo(
                values[0] * canvas.width, (1 - values[1]) * canvas.height,
                values[2] * canvas.width, (1 - values[3]) * canvas.height,
                canvas.width, 0
            );
            ctx.stroke();
        };

        bezierInputs.forEach(input => {
            input.addEventListener('input', () => {
                drawBezierCurve();
                this.updateThemeProperty(['animation', 'bezier'], 
                    Array.from(bezierInputs).map(input => parseFloat(input.value))
                );
                this.updateAnimation();
            });
        });

        drawBezierCurve();
    },

    updateThemeProperty(path, value) {
        let current = this.currentTheme;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) current[path[i]] = {};
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        this.saveTheme();
        this.updatePreview();
    },

    updateGradient() {
        const stops = Array.from(document.querySelectorAll('.gradient-stop')).map(stop => ({
            position: parseInt(stop.querySelector('input[type="number"]').value),
            color: stop.querySelector('input[type="color"]').value
        }));

        const type = document.querySelector('.gradient-type').value;
        const angle = parseInt(document.querySelector('.gradient-angle').value);

        this.updateThemeProperty(['gradient', 'sidebar'], {
            type,
            angle,
            stops
        });
    },

    updateShadow() {
        const shadow = {
            x: parseInt(document.getElementById('shadow-x').value),
            y: parseInt(document.getElementById('shadow-y').value),
            blur: parseInt(document.getElementById('shadow-blur').value),
            spread: parseInt(document.getElementById('shadow-spread').value),
            color: document.getElementById('shadow-color').value,
            opacity: parseInt(document.getElementById('shadow-opacity').value) / 100
        };

        this.updateThemeProperty(['effects', 'shadow'], shadow);
    },

    updateRadius() {
        const radius = parseInt(document.getElementById('radius-size').value);
        this.updateThemeProperty(['effects', 'radius'], radius);
    },

    updateAnimation() {
        const speed = parseFloat(document.getElementById('animation-speed').value);
        const easing = document.getElementById('animation-easing').value;
        
        const animation = {
            speed,
            easing,
            bezier: this.currentTheme.animation.bezier
        };

        this.updateThemeProperty(['animation'], animation);
    },

    updatePreview() {
        const preview = document.querySelector('.preview-container');
        
        // Appliquer les couleurs
        preview.style.setProperty('--primary-color', this.currentTheme.colors.primary);
        preview.style.setProperty('--secondary-color', this.currentTheme.colors.secondary);
        preview.style.setProperty('--accent-color', this.currentTheme.colors.accent);

        // Appliquer le dégradé
        const gradient = this.currentTheme.gradient.sidebar;
        const gradientString = `${gradient.type}-gradient(${
            gradient.type === 'linear' ? `${gradient.angle}deg` : 'circle'
        }, ${
            gradient.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
        })`;
        preview.querySelector('.preview-sidebar').style.background = gradientString;

        // Appliquer les effets
        const shadow = this.currentTheme.effects.shadow;
        const shadowString = `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}${Math.round(shadow.opacity * 255).toString(16).padStart(2, '0')}`;
        preview.style.setProperty('--box-shadow', shadowString);
        preview.style.setProperty('--border-radius', `${this.currentTheme.effects.radius}px`);

        // Appliquer les animations
        const animation = this.currentTheme.animation;
        const timingFunction = animation.easing === 'custom' 
            ? `cubic-bezier(${animation.bezier.join(',')})`
            : animation.easing;
        preview.style.setProperty('--animation-duration', `${1 / animation.speed}s`);
        preview.style.setProperty('--animation-timing', timingFunction);
    },

    saveTheme() {
        localStorage.setItem('userTheme', JSON.stringify(this.currentTheme));
    },

    exportTheme() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentTheme, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "theme.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    importTheme(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const theme = JSON.parse(e.target.result);
                this.currentTheme = theme;
                this.saveTheme();
                this.loadTheme();
                this.updatePreview();
            } catch (error) {
                console.error('Erreur lors de l\'importation du thème:', error);
                alert('Le fichier sélectionné n\'est pas un thème valide.');
            }
        };
        reader.readAsText(file);
    }
};

// Initialisation des gestionnaires d'événements pour les boutons d'action
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();

    document.getElementById('save-theme').addEventListener('click', () => {
        themeManager.saveTheme();
        alert('Thème sauvegardé avec succès !');
    });

    document.getElementById('reset-theme').addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser le thème aux valeurs par défaut ?')) {
            themeManager.currentTheme = {...themeManager.defaultTheme};
            themeManager.saveTheme();
            themeManager.loadTheme();
        }
    });

    document.getElementById('export-theme').addEventListener('click', () => {
        themeManager.exportTheme();
    });

    document.getElementById('import-theme').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                themeManager.importTheme(file);
            }
        };
        input.click();
    });
}); 