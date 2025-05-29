/**
 * LUT Preview for ComfyUI-Curve_Master
 * Real-time LUT visualization and preview system
 */

class LUTPreview {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration par défaut
        this.options = {
            width: options.width || 256,
            height: options.height || 256,
            backgroundColor: '#1a1a1a',
            gridColor: '#333333',
            lutSize: 33,
            showGrid: true,
            showGradient: true,
            previewMode: 'rgb_cube', // 'rgb_cube', 'color_wheel', 'gradient_bars'
            ...options
        };
        
        // Données LUT
        this.lutData = null;
        this.originalImage = null;
        this.previewImage = null;
        
        // État de l'interface
        this.isLoading = false;
        this.currentPreset = null;
        
        this.setupCanvas();
        this.generateDefaultPreview();
    }
    
    setupCanvas() {
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.canvas.style.border = '1px solid #444';
        this.canvas.style.borderRadius = '4px';
        this.canvas.style.backgroundColor = this.options.backgroundColor;
    }
    
    // Génération de preview par défaut
    generateDefaultPreview() {
        switch(this.options.previewMode) {
            case 'rgb_cube':
                this.drawRGBCube();
                break;
            case 'color_wheel':
                this.drawColorWheel();
                break;
            case 'gradient_bars':
                this.drawGradientBars();
                break;
            default:
                this.drawRGBCube();
        }
    }
    
    // Dessiner un cube RGB de référence
    drawRGBCube() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Effacer le canvas
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Créer un dégradé RGB représentatif
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // Calculer les valeurs RGB basées sur la position
                const r = (x / width) * 255;
                const g = (y / height) * 255;
                const b = ((x + y) / (width + height)) * 255;
                
                data[index] = r;     // Rouge
                data[index + 1] = g; // Vert
                data[index + 2] = b; // Bleu
                data[index + 3] = 255; // Alpha
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Appliquer la LUT si disponible
        if (this.lutData) {
            this.applyLUTToCanvas();
        }
        
        // Dessiner la grille si activée
        if (this.options.showGrid) {
            this.drawGrid();
        }
        
        // Ajouter des labels
        this.drawLabels();
    }
    
    // Dessiner une roue de couleurs
    drawColorWheel() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;
        
        // Effacer le canvas
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Créer la roue de couleurs
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= radius) {
                    // Calculer l'angle et la saturation
                    const angle = Math.atan2(dy, dx);
                    const saturation = distance / radius;
                    const hue = (angle + Math.PI) / (2 * Math.PI);
                    
                    // Convertir HSV vers RGB
                    const rgb = this.hsvToRgb(hue, saturation, 1.0);
                    
                    data[index] = rgb.r;
                    data[index + 1] = rgb.g;
                    data[index + 2] = rgb.b;
                    data[index + 3] = 255;
                } else {
                    // Pixels en dehors du cercle
                    data[index] = 26;     // Couleur de fond
                    data[index + 1] = 26;
                    data[index + 2] = 26;
                    data[index + 3] = 255;
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Appliquer la LUT si disponible
        if (this.lutData) {
            this.applyLUTToCanvas();
        }
    }
    
    // Dessiner des barres de dégradé
    drawGradientBars() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barHeight = height / 3;
        
        // Effacer le canvas
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Barre rouge
        const redGradient = ctx.createLinearGradient(0, 0, width, 0);
        redGradient.addColorStop(0, 'rgb(0,0,0)');
        redGradient.addColorStop(1, 'rgb(255,0,0)');
        ctx.fillStyle = redGradient;
        ctx.fillRect(0, 0, width, barHeight);
        
        // Barre verte
        const greenGradient = ctx.createLinearGradient(0, 0, width, 0);
        greenGradient.addColorStop(0, 'rgb(0,0,0)');
        greenGradient.addColorStop(1, 'rgb(0,255,0)');
        ctx.fillStyle = greenGradient;
        ctx.fillRect(0, barHeight, width, barHeight);
        
        // Barre bleue
        const blueGradient = ctx.createLinearGradient(0, 0, width, 0);
        blueGradient.addColorStop(0, 'rgb(0,0,0)');
        blueGradient.addColorStop(1, 'rgb(0,0,255)');
        ctx.fillStyle = blueGradient;
        ctx.fillRect(0, barHeight * 2, width, barHeight);
        
        // Appliquer la LUT si disponible
        if (this.lutData) {
            this.applyLUTToCanvas();
        }
        
        // Ajouter des séparateurs
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barHeight);
        ctx.lineTo(width, barHeight);
        ctx.moveTo(0, barHeight * 2);
        ctx.lineTo(width, barHeight * 2);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('Red', 10, 20);
        ctx.fillText('Green', 10, barHeight + 20);
        ctx.fillText('Blue', 10, barHeight * 2 + 20);
    }
    
    // Appliquer une LUT au canvas actuel
    applyLUTToCanvas() {
        if (!this.lutData) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Récupérer les données d'image actuelles
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Appliquer la LUT pixel par pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Appliquer la transformation LUT
            const newColor = this.applyLUTToPixel(r, g, b);
            
            data[i] = newColor.r;
            data[i + 1] = newColor.g;
            data[i + 2] = newColor.b;
            // Alpha reste inchangé
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Appliquer une LUT à un pixel
    applyLUTToPixel(r, g, b) {
        if (!this.lutData) return {r, g, b};
        
        const lutSize = this.lutData.length;
        const scale = lutSize - 1;
        
        // Normaliser les valeurs d'entrée
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        
        // Calculer les indices dans la LUT
        const rIdx = rNorm * scale;
        const gIdx = gNorm * scale;
        const bIdx = bNorm * scale;
        
        // Interpolation trilinéaire
        const r0 = Math.floor(rIdx);
        const g0 = Math.floor(gIdx);
        const b0 = Math.floor(bIdx);
        
        const r1 = Math.min(r0 + 1, scale);
        const g1 = Math.min(g0 + 1, scale);
        const b1 = Math.min(b0 + 1, scale);
        
        const dr = rIdx - r0;
        const dg = gIdx - g0;
        const db = bIdx - b0;
        
        // 8 points du cube
        const c000 = this.lutData[r0][g0][b0];
        const c001 = this.lutData[r0][g0][b1];
        const c010 = this.lutData[r0][g1][b0];
        const c011 = this.lutData[r0][g1][b1];
        const c100 = this.lutData[r1][g0][b0];
        const c101 = this.lutData[r1][g0][b1];
        const c110 = this.lutData[r1][g1][b0];
        const c111 = this.lutData[r1][g1][b1];
        
        // Interpolation trilinéaire
        const c00 = this.lerp3(c000, c100, dr);
        const c01 = this.lerp3(c001, c101, dr);
        const c10 = this.lerp3(c010, c110, dr);
        const c11 = this.lerp3(c011, c111, dr);
        
        const c0 = this.lerp3(c00, c10, dg);
        const c1 = this.lerp3(c01, c11, dg);
        
        const result = this.lerp3(c0, c1, db);
        
        return {
            r: Math.round(Math.max(0, Math.min(255, result[0] * 255))),
            g: Math.round(Math.max(0, Math.min(255, result[1] * 255))),
            b: Math.round(Math.max(0, Math.min(255, result[2] * 255)))
        };
    }
    
    // Interpolation linéaire pour vecteurs 3D
    lerp3(a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t
        ];
    }
    
    // Conversion HSV vers RGB
    hsvToRgb(h, s, v) {
        let r, g, b;
        
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    // Dessiner la grille
    drawGrid() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.strokeStyle = this.options.gridColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // Lignes verticales
        for (let i = 0; i <= 8; i++) {
            const x = (i / 8) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Lignes horizontales
        for (let i = 0; i <= 8; i++) {
            const y = (i / 8) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
    
    // Dessiner les labels
    drawLabels() {
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        
        if (this.options.previewMode === 'rgb_cube') {
            ctx.fillText('R →', 5, this.canvas.height - 5);
            ctx.save();
            ctx.translate(5, this.canvas.height - 20);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('G →', 0, 0);
            ctx.restore();
        }
    }
    
    // Charger une image de test
    loadTestImage(imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            this.originalImage = img;
            this.drawImagePreview();
        };
        
        img.onerror = () => {
            console.error('Erreur chargement image de test');
            this.generateDefaultPreview();
        };
        
        img.src = imageUrl;
    }
    
    // Dessiner un aperçu d'image
    drawImagePreview() {
        if (!this.originalImage) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Calculer les dimensions pour conserver le ratio
        const imgRatio = this.originalImage.width / this.originalImage.height;
        const canvasRatio = width / height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
            drawWidth = width;
            drawHeight = width / imgRatio;
            offsetX = 0;
            offsetY = (height - drawHeight) / 2;
        } else {
            drawWidth = height * imgRatio;
            drawHeight = height;
            offsetX = (width - drawWidth) / 2;
            offsetY = 0;
        }
        
        // Effacer et dessiner l'image
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        ctx.drawImage(this.originalImage, offsetX, offsetY, drawWidth, drawHeight);
        
        // Appliquer la LUT si disponible
        if (this.lutData) {
            this.applyLUTToCanvas();
        }
    }
    
    // API publique
    setLUT(lutData) {
        this.lutData = lutData;
        this.refresh();
    }
    
    setPreviewMode(mode) {
        this.options.previewMode = mode;
        this.refresh();
    }
    
    setPreset(presetName) {
        this.currentPreset = presetName;
        // Charger la LUT du preset
        this.loadPresetLUT(presetName);
    }
    
    loadPresetLUT(presetName) {
        // Générer une LUT basée sur le preset
        const lutSize = this.options.lutSize;
        const lut = new Array(lutSize);
        
        for (let r = 0; r < lutSize; r++) {
            lut[r] = new Array(lutSize);
            for (let g = 0; g < lutSize; g++) {
                lut[r][g] = new Array(lutSize);
                for (let b = 0; b < lutSize; b++) {
                    const nr = r / (lutSize - 1);
                    const ng = g / (lutSize - 1);
                    const nb = b / (lutSize - 1);
                    
                    // Appliquer la transformation du preset
                    const transformed = this.applyPresetTransform(nr, ng, nb, presetName);
                    lut[r][g][b] = [transformed.r, transformed.g, transformed.b];
                }
            }
        }
        
        this.setLUT(lut);
    }
    
    applyPresetTransform(r, g, b, presetName) {
        // Transformations basiques pour les presets
        switch(presetName) {
            case 'Cinematic_Warm':
                return {
                    r: Math.pow(r, 0.9) * 1.1,
                    g: Math.pow(g, 1.0) * 1.05,
                    b: Math.pow(b, 1.1) * 0.9
                };
            case 'Vintage_70s':
                return {
                    r: Math.pow(r, 0.85) * 1.1 + 0.05,
                    g: Math.pow(g, 0.9) * 1.05 + 0.02,
                    b: Math.pow(b, 1.1) * 0.85
                };
            case 'Teal_Orange':
                if (r > g && r > b) {
                    return {r: Math.min(1.0, r * 1.2), g: g * 0.9, b: b * 0.7};
                } else if (b > r && b > g) {
                    return {r: r * 0.7, g: g * 1.1, b: Math.min(1.0, b * 1.2)};
                }
                return {r, g, b};
            default:
                return {r, g, b};
        }
    }
    
    refresh() {
        if (this.originalImage) {
            this.drawImagePreview();
        } else {
            this.generateDefaultPreview();
        }
    }
    
    clear() {
        this.lutData = null;
        this.originalImage = null;
        this.currentPreset = null;
        this.refresh();
    }
    
    // Export de l'aperçu
    exportPreview() {
        return this.canvas.toDataURL('image/png');
    }
    
    // Affichage d'état de chargement
    showLoading() {
        this.isLoading = true;
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    hideLoading() {
        this.isLoading = false;
        this.refresh();
    }
}

// Export pour utilisation dans ComfyUI
window.LUTPreview = LUTPreview;
