/**
 * Curve Editor for ComfyUI-Curve_Master
 * Professional curve editing interface
 */

class CurveEditor {
    constructor(canvas, onUpdate, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onUpdate = onUpdate;
        
        // Configuration par défaut
        this.options = {
            width: options.width || 512,
            height: options.height || 256,
            gridColor: '#333333',
            curveColor: '#00ff88',
            pointColor: '#ffffff',
            pointHoverColor: '#ffff00',
            pointActiveColor: '#ff4444',
            backgroundColor: '#1a1a1a',
            pointRadius: 6,
            lineWidth: 2,
            gridLines: 8,
            showHistogram: options.showHistogram || false,
            ...options
        };
        
        // Points de contrôle (format: {x: 0-1, y: 0-1})
        this.controlPoints = [
            {x: 0, y: 0},      // Point noir
            {x: 0.25, y: 0.25},
            {x: 0.5, y: 0.5},
            {x: 0.75, y: 0.75},
            {x: 1, y: 1}       // Point blanc
        ];
        
        // État de l'interaction
        this.isDragging = false;
        this.dragIndex = -1;
        this.hoveredIndex = -1;
        this.isShiftPressed = false;
        this.isCtrlPressed = false;
        
        // Historique pour undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        this.setupCanvas();
        this.setupEvents();
        this.saveState();
        this.render();
    }
    
    setupCanvas() {
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.border = '1px solid #444';
        this.canvas.style.borderRadius = '4px';
        this.canvas.style.backgroundColor = this.options.backgroundColor;
    }
    
    setupEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Context menu (clic droit)
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Focus pour recevoir les événements clavier
        this.canvas.tabIndex = 0;
    }
    
    // Conversion coordonnées écran <-> courbe
    screenToNormalized(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (screenX - rect.left) / this.canvas.width;
        const y = 1 - (screenY - rect.top) / this.canvas.height; // Inverser Y
        return {x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y))};
    }
    
    normalizedToScreen(normX, normY) {
        return {
            x: normX * this.canvas.width,
            y: (1 - normY) * this.canvas.height
        };
    }
    
    // Gestion des événements souris
    onMouseDown(e) {
        this.canvas.focus();
        const pos = this.screenToNormalized(e.clientX, e.clientY);
        const clickedIndex = this.findNearestPoint(pos.x, pos.y);
        
        if (e.button === 2) { // Clic droit
            this.showContextMenu(e, pos, clickedIndex);
            return;
        }
        
        if (this.isShiftPressed && clickedIndex !== -1) {
            // Shift + clic = supprimer point (sauf les extrémités)
            if (clickedIndex !== 0 && clickedIndex !== this.controlPoints.length - 1) {
                this.removePoint(clickedIndex);
                this.saveState();
            }
        } else if (clickedIndex !== -1) {
            // Démarrer le drag d'un point existant
            this.isDragging = true;
            this.dragIndex = clickedIndex;
        } else {
            // Ajouter un nouveau point
            this.addPoint(pos.x, pos.y);
            this.saveState();
        }
        
        this.render();
    }
    
    onMouseMove(e) {
        const pos = this.screenToNormalized(e.clientX, e.clientY);
        
        if (this.isDragging && this.dragIndex !== -1) {
            // Déplacer le point en cours de drag
            this.movePoint(this.dragIndex, pos.x, pos.y);
            this.render();
            this.notifyUpdate();
        } else {
            // Mise à jour du hover
            const newHoveredIndex = this.findNearestPoint(pos.x, pos.y, 0.03);
            if (newHoveredIndex !== this.hoveredIndex) {
                this.hoveredIndex = newHoveredIndex;
                this.updateCursor(newHoveredIndex !== -1);
                this.render();
            }
        }
    }
    
    onMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragIndex = -1;
            this.saveState();
            this.notifyUpdate();
        }
    }
    
    onMouseLeave(e) {
        this.hoveredIndex = -1;
        this.isDragging = false;
        this.dragIndex = -1;
        this.updateCursor(false);
        this.render();
    }
    
    onWheel(e) {
        e.preventDefault();
        
        if (this.isCtrlPressed) {
            // Zoom avec Ctrl + molette
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(delta, e.clientX, e.clientY);
        } else {
            // Ajustement fin des points avec molette
            if (this.hoveredIndex !== -1) {
                const delta = e.deltaY > 0 ? -0.01 : 0.01;
                const point = this.controlPoints[this.hoveredIndex];
                this.movePoint(this.hoveredIndex, point.x, Math.max(0, Math.min(1, point.y + delta)));
                this.render();
                this.notifyUpdate();
            }
        }
    }
    
    onKeyDown(e) {
        this.isShiftPressed = e.shiftKey;
        this.isCtrlPressed = e.ctrlKey;
        
        switch(e.key) {
            case 'Delete':
            case 'Backspace':
                if (this.hoveredIndex !== -1 && this.hoveredIndex !== 0 && 
                    this.hoveredIndex !== this.controlPoints.length - 1) {
                    this.removePoint(this.hoveredIndex);
                    this.hoveredIndex = -1;
                    this.saveState();
                    this.render();
                    this.notifyUpdate();
                }
                break;
                
            case 'z':
                if (e.ctrlKey) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                }
                break;
                
            case 'r':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.resetCurve();
                }
                break;
                
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.copyCurve();
                }
                break;
                
            case 'v':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.pasteCurve();
                }
                break;
        }
    }
    
    onKeyUp(e) {
        this.isShiftPressed = e.shiftKey;
        this.isCtrlPressed = e.ctrlKey;
    }
    
    // Gestion des points
    findNearestPoint(x, y, threshold = 0.05) {
        let nearestIndex = -1;
        let minDistance = threshold;
        
        for (let i = 0; i < this.controlPoints.length; i++) {
            const point = this.controlPoints[i];
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        
        return nearestIndex;
    }
    
    addPoint(x, y) {
        // Trouver la position d'insertion (maintenir l'ordre X)
        let insertIndex = this.controlPoints.length;
        for (let i = 0; i < this.controlPoints.length; i++) {
            if (x < this.controlPoints[i].x) {
                insertIndex = i;
                break;
            }
        }
        
        this.controlPoints.splice(insertIndex, 0, {x, y});
        this.notifyUpdate();
    }
    
    removePoint(index) {
        if (index > 0 && index < this.controlPoints.length - 1) {
            this.controlPoints.splice(index, 1);
            this.notifyUpdate();
        }
    }
    
    movePoint(index, x, y) {
        if (index === 0) {
            // Premier point : X fixe à 0
            this.controlPoints[index] = {x: 0, y: Math.max(0, Math.min(1, y))};
        } else if (index === this.controlPoints.length - 1) {
            // Dernier point : X fixe à 1
            this.controlPoints[index] = {x: 1, y: Math.max(0, Math.min(1, y))};
        } else {
            // Points intermédiaires : contraindre X entre voisins
            const prevX = this.controlPoints[index - 1].x;
            const nextX = this.controlPoints[index + 1].x;
            const constrainedX = Math.max(prevX + 0.01, Math.min(nextX - 0.01, x));
            this.controlPoints[index] = {x: constrainedX, y: Math.max(0, Math.min(1, y))};
        }
    }
    
    // Interpolation Catmull-Rom
    catmullRomSpline(t, p0, p1, p2, p3) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    }
    
    // Génération de la courbe interpolée
    generateCurve(steps = 256) {
        const curve = [];
        const points = this.controlPoints;
        
        for (let i = 0; i < steps; i++) {
            const x = i / (steps - 1);
            let y = 0;
            
            // Trouver les points de contrôle encadrants
            let segmentIndex = 0;
            for (let j = 0; j < points.length - 1; j++) {
                if (x >= points[j].x && x <= points[j + 1].x) {
                    segmentIndex = j;
                    break;
                }
            }
            
            if (points.length < 4) {
                // Interpolation linéaire pour moins de 4 points
                const t = (x - points[segmentIndex].x) / (points[segmentIndex + 1].x - points[segmentIndex].x);
                y = points[segmentIndex].y + t * (points[segmentIndex + 1].y - points[segmentIndex].y);
            } else {
                // Interpolation Catmull-Rom
                const p0 = points[Math.max(0, segmentIndex - 1)];
                const p1 = points[segmentIndex];
                const p2 = points[Math.min(points.length - 1, segmentIndex + 1)];
                const p3 = points[Math.min(points.length - 1, segmentIndex + 2)];
                
                const t = (x - p1.x) / (p2.x - p1.x);
                y = this.catmullRomSpline(t, p0.y, p1.y, p2.y, p3.y);
            }
            
            curve.push(Math.max(0, Math.min(1, y)));
        }
        
        return curve;
    }
    
    // Rendu
    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Effacer le canvas
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Dessiner la grille
        this.drawGrid();
        
        // Dessiner l'histogramme si activé
        if (this.options.showHistogram && this.histogramData) {
            this.drawHistogram();
        }
        
        // Dessiner la courbe
        this.drawCurve();
        
        // Dessiner les points de contrôle
        this.drawControlPoints();
        
        // Dessiner les informations
        this.drawInfo();
    }
    
    drawGrid() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const lines = this.options.gridLines;
        
        ctx.strokeStyle = this.options.gridColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // Lignes verticales
        for (let i = 0; i <= lines; i++) {
            const x = (i / lines) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Lignes horizontales
        for (let i = 0; i <= lines; i++) {
            const y = (i / lines) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Ligne diagonale (courbe linéaire de référence)
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, 0);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawHistogram() {
        if (!this.histogramData) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const data = this.histogramData;
        
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        
        const barWidth = width / data.length;
        const maxValue = Math.max(...data);
        
        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / maxValue) * height * 0.5;
            const x = i * barWidth;
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        }
    }
    
    drawCurve() {
        const ctx = this.ctx;
        const curve = this.generateCurve(this.canvas.width);
        
        ctx.strokeStyle = this.options.curveColor;
        ctx.lineWidth = this.options.lineWidth;
        ctx.shadowColor = this.options.curveColor;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        
        for (let i = 0; i < curve.length; i++) {
            const x = i;
            const y = (1 - curve[i]) * this.canvas.height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    drawControlPoints() {
        const ctx = this.ctx;
        
        for (let i = 0; i < this.controlPoints.length; i++) {
            const point = this.controlPoints[i];
            const screen = this.normalizedToScreen(point.x, point.y);
            
            // Couleur selon l'état
            let color = this.options.pointColor;
            let radius = this.options.pointRadius;
            
            if (i === this.dragIndex) {
                color = this.options.pointActiveColor;
                radius += 2;
            } else if (i === this.hoveredIndex) {
                color = this.options.pointHoverColor;
                radius += 1;
            }
            
            // Dessiner le point avec glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Bordure noire
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Numéro du point
            if (i === this.hoveredIndex || i === this.dragIndex) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(i.toString(), screen.x, screen.y - radius - 5);
            }
        }
    }
    
    drawInfo() {
        const ctx = this.ctx;
        
        // Afficher les coordonnées du point survolé
        if (this.hoveredIndex !== -1) {
            const point = this.controlPoints[this.hoveredIndex];
            const inputVal = Math.round(point.x * 255);
            const outputVal = Math.round(point.y * 255);
            const text = `Point ${this.hoveredIndex}: Input=${inputVal}, Output=${outputVal}`;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(5, 5, 250, 25);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(text, 10, 20);
        }
        
        // Aide contextuelle
        const helpText = "Click: Add point | Drag: Move | Shift+Click: Delete | Ctrl+Z: Undo";
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(5, this.canvas.height - 25, this.canvas.width - 10, 20);
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '10px Arial';
        ctx.fillText(helpText, 10, this.canvas.height - 10);
    }
    
    // Utilitaires
    updateCursor(isOverPoint) {
        this.canvas.style.cursor = isOverPoint ? 'pointer' : 'crosshair';
    }
    
    // Historique (Undo/Redo)
    saveState() {
        // Supprimer les états futurs si on est au milieu de l'historique
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Ajouter le nouvel état
        this.history.push(JSON.parse(JSON.stringify(this.controlPoints)));
        this.historyIndex++;
        
        // Limiter la taille de l'historique
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.controlPoints = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.render();
            this.notifyUpdate();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.controlPoints = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.render();
            this.notifyUpdate();
        }
    }
    
    // API publique
    setPreset(preset) {
        if (typeof preset === 'string') {
            this.loadPreset(preset);
        } else if (Array.isArray(preset)) {
            this.controlPoints = preset.map(p => ({...p}));
            this.saveState();
            this.render();
            this.notifyUpdate();
        }
    }
    
    loadPreset(presetName) {
        const presets = {
            "linear": [{x: 0, y: 0}, {x: 1, y: 1}],
            "contrast_plus": [{x: 0, y: 0}, {x: 0.25, y: 0.18}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.82}, {x: 1, y: 1}],
            "s_curve": [{x: 0, y: 0}, {x: 0.25, y: 0.12}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.88}, {x: 1, y: 1}],
            "negative": [{x: 0, y: 1}, {x: 1, y: 0}]
        };
        
        if (presets[presetName]) {
            this.controlPoints = presets[presetName].map(p => ({...p}));
            this.saveState();
            this.render();
            this.notifyUpdate();
        }
    }
    
    resetCurve() {
        this.controlPoints = [{x: 0, y: 0}, {x: 1, y: 1}];
        this.saveState();
        this.render();
        this.notifyUpdate();
    }
    
    getControlPoints() {
        return this.controlPoints.map(p => ({...p}));
    }
    
    getCurveData(steps = 256) {
        return this.generateCurve(steps);
    }
    
    exportAsString() {
        return this.controlPoints.map(p => `${Math.round(p.x * 255)},${Math.round(p.y * 255)}`).join(';');
    }
    
    importFromString(str) {
        try {
            const points = str.split(';').map(pair => {
                const [x, y] = pair.split(',').map(Number);
                return {x: x / 255, y: y / 255};
            });
            
            if (points.length >= 2) {
                this.controlPoints = points;
                this.saveState();
                this.render();
                this.notifyUpdate();
            }
        } catch (e) {
            console.error('Erreur import courbe:', e);
        }
    }
    
    setHistogramData(data) {
        this.histogramData = data;
        this.render();
    }
    
    copyCurve() {
        const data = this.exportAsString();
        navigator.clipboard.writeText(data).then(() => {
            console.log('Courbe copiée dans le presse-papiers');
        });
    }
    
    pasteCurve() {
        navigator.clipboard.readText().then(text => {
            this.importFromString(text);
        });
    }
    
    notifyUpdate() {
        if (this.onUpdate) {
            this.onUpdate({
                points: this.getControlPoints(),
                curve: this.getCurveData(),
                string: this.exportAsString()
            });
        }
    }
}

// Export pour utilisation dans ComfyUI
window.CurveEditor = CurveEditor;
