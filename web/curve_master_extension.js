import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "CurveMaster.MultiChannelCurveEditor",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "CurveMasterNode") {
            
const onNodeCreated = nodeType.prototype.onNodeCreated;
nodeType.prototype.onNodeCreated = function () {
    const result = onNodeCreated?.apply(this, arguments);
    
    console.log("CurveMasterNode created");
    const self = this;
    
    this.addWidget("button", "🎨 Multi-Channel Editor", null, function() {
        self.openMultiChannelEditor();
    });
    
    this.addWidget("button", "✨ Load Preset", null, function() {
        self.openPresetSelector();
    });
    
    this.addWidget("button", "🔄 Reset All", null, function() {
        self.resetAllSettings();
    });
                return result;
            };
            
            // MÉTHODE : Reset All Settings
            nodeType.prototype.resetAllSettings = function() {
                console.log("Executing resetAllSettings");
                
                try {
                    this.widgets.forEach(widget => {
                        if (widget.name) {
                            switch(widget.name) {
                                case "curve_points_rgb":
                                    widget.value = "0,0;64,64;128,128;192,192;255,255";
                                    break;
                                case "curve_points_red":
                                case "curve_points_green":
                                case "curve_points_blue":
                                    widget.value = "0,0;255,255";
                                    break;
                                case "strength":
                                case "opacity":
                                case "gamma_correction":
                                case "smoothing_strength":
                                    widget.value = 1.0;
                                    break;
                                case "interpolation":
                                    widget.value = "catmull-rom";
                                    break;
                                case "blend_mode":
                                    widget.value = "normal";
                                    break;
                                case "preserve_luminosity":
                                case "curve_smoothing":
                                case "anti_clipping":
                                    widget.value = false;
                                    break;
                                case "smoothing_iterations":
                                    widget.value = 3;
                                    break;
                                case "user_preset":
                                    widget.value = "None";
                                    break;
                            }
                        }
                    });
                    
                    this.setDirtyCanvas(true, true);
                    console.log("✅ All settings reset successfully!");
                    
                } catch (error) {
                    console.error("Error in resetAllSettings:", error);
                }
            };
            
            // MÉTHODE : Save User Preset
            nodeType.prototype.saveUserPreset = function() {
                console.log("Executing saveUserPreset");
                
                const overlay = document.createElement("div");
                overlay.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;
                `;
                
                const dialog = document.createElement("div");
                dialog.style.cssText = `
                    background: #1a1a1a; border: 2px solid #444;
                    border-radius: 12px; padding: 20px; min-width: 400px;
                `;
                
                const title = document.createElement("h3");
                title.textContent = "💾 Save User Preset";
                title.style.cssText = "color: #fff; margin: 0 0 15px 0; text-align: center;";
                dialog.appendChild(title);
                
                const nameLabel = document.createElement("label");
                nameLabel.textContent = "Preset Name:";
                nameLabel.style.cssText = "color: #ccc; display: block; margin-bottom: 5px;";
                dialog.appendChild(nameLabel);
                
                const nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.value = "My Curve Preset";
                nameInput.style.cssText = "width: 100%; padding: 8px; margin-bottom: 20px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px;";
                dialog.appendChild(nameInput);
                
                const buttons = document.createElement("div");
                buttons.style.cssText = "display: flex; gap: 10px; justify-content: center;";
                
                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Cancel";
                cancelBtn.style.cssText = "padding: 8px 16px; background: #666; color: #fff; border: none; border-radius: 4px; cursor: pointer;";
                cancelBtn.onclick = () => document.body.removeChild(overlay);
                
                const saveBtn = document.createElement("button");
                saveBtn.textContent = "Save";
                saveBtn.style.cssText = "padding: 8px 16px; background: #00ff88; color: #000; border: none; border-radius: 4px; cursor: pointer;";
                saveBtn.onclick = () => {
                    try {
                        const settings = {};
                        
                        this.widgets.forEach(widget => {
                            if (widget.name && widget.type !== "button" && widget.name !== "user_preset") {
                                settings[widget.name] = widget.value;
                            }
                        });
                        
                        const success = this.saveUserPresetToPython(nameInput.value, settings);
                        
                        if (success) {
                            console.log(`✅ User preset "${nameInput.value}" saved successfully!`);
                            alert(`✅ User preset "${nameInput.value}" saved!\nRestart ComfyUI to see it in the dropdown.`);
                        } else {
                            alert("❌ Error saving preset!");
                        }
                        
                        document.body.removeChild(overlay);
                        
                    } catch (error) {
                        console.error("Error saving user preset:", error);
                        alert("Error saving preset!");
                    }
                };
                
                buttons.appendChild(cancelBtn);
                buttons.appendChild(saveBtn);
                dialog.appendChild(buttons);
                
                overlay.appendChild(dialog);
                document.body.appendChild(overlay);
            };
            
// MÉTHODE : Sauvegarder via Python (CORRIGÉE)
nodeType.prototype.saveUserPresetToPython = function(name, settings) {
    try {
        console.log("Saving to Python:", name, settings);
        
        // Au lieu de localStorage, utiliser les champs du nœud
        const pathWidget = this.widgets.find(w => w.name === 'preset_user_path');
        const nameWidget = this.widgets.find(w => w.name === 'preset_user_name');
        
        if (pathWidget && nameWidget) {
            // Mettre à jour les widgets avec les nouvelles valeurs
            nameWidget.value = name;
            
            // Inclure les réglages de lissage dans les settings
            settings._smoothing_enabled = this.smoothingEnabled || false;
            settings._smoothing_strength = this.smoothingStrength || 0.5;
            settings._smoothing_iterations = this.smoothingIterations || 3;
            settings._anti_clipping = this.antiClipping !== undefined ? this.antiClipping : true;
            
            // Forcer l'exécution du nœud pour déclencher la sauvegarde
            this.setDirtyCanvas(true, true);
            
            console.log("✅ Preset settings prepared for Python export");
            return true;
        } else {
            console.error("❌ Could not find preset path/name widgets");
            return false;
        }
        
    } catch (error) {
        console.error("Error in saveUserPresetToPython:", error);
        return false;
    }
};
            
            // MÉTHODE : Refresh User Presets
            nodeType.prototype.refreshUserPresets = function() {
                console.log("Refreshing user presets");
                
                this.setDirtyCanvas(true, true);
                
                const notification = document.createElement("div");
                notification.textContent = "✅ Please restart ComfyUI to see updated user presets!";
                notification.style.cssText = `
                    position: fixed; top: 20px; right: 20px; z-index: 10000;
                    background: #00ff88; color: #000; padding: 10px 15px;
                    border-radius: 6px; font-weight: bold; max-width: 300px;
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 4000);
            };
            
            // MÉTHODE : Multi-Channel Editor SANS contrôles de lissage
            nodeType.prototype.openMultiChannelEditor = function() {
                console.log("Executing openMultiChannelEditor");
                
                const overlay = document.createElement("div");
                overlay.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;
                `;
                
                const dialog = document.createElement("div");
                dialog.style.cssText = `
                    background: #1a1a1a; border: 2px solid #444;
                    border-radius: 12px; padding: 20px; min-width: 800px;
                    max-height: 90vh; overflow-y: auto;
                `;
                
                const title = document.createElement("h3");
                title.textContent = "🎨 Multi-Channel Curve Editor";
                title.style.cssText = "color: #fff; margin: 0 0 15px 0; text-align: center;";
                dialog.appendChild(title);
                
                const channels = [
                    {name: "RGB", color: "#ffffff", widget: "curve_points_rgb"},
                    {name: "Red", color: "#ff4444", widget: "curve_points_red"},
                    {name: "Green", color: "#44ff44", widget: "curve_points_green"},
                    {name: "Blue", color: "#4444ff", widget: "curve_points_blue"}
                ];
                
                let activeChannel = 0;
                let currentPoints = [];
                let isDragging = false;
                let dragIndex = -1;
                
                // Onglets
                const tabContainer = document.createElement("div");
                tabContainer.style.cssText = "display: flex; gap: 5px; margin-bottom: 15px;";
                
                channels.forEach((channel, index) => {
                    const tab = document.createElement("button");
                    tab.textContent = channel.name;
                    tab.style.cssText = `
                        padding: 8px 16px; border: 1px solid #666;
                        background: ${index === 0 ? '#444' : '#2a2a2a'};
                        color: ${channel.color}; cursor: pointer;
                        border-radius: 4px 4px 0 0;
                    `;
                    tab.onclick = () => {
                        tabContainer.querySelectorAll('button').forEach((btn, i) => {
                            btn.style.background = i === index ? '#444' : '#2a2a2a';
                        });
                        activeChannel = index;
                        updateChannelInfo();
                        drawCurveVisualization();
                    };
                    tabContainer.appendChild(tab);
                });
                
                dialog.appendChild(tabContainer);
                
                // Canvas interactif
                const canvasContainer = document.createElement("div");
                canvasContainer.style.cssText = "margin-bottom: 15px; text-align: center;";
                
                const canvas = document.createElement("canvas");
                canvas.width = 400;
                canvas.height = 200;
                canvas.style.cssText = "border: 1px solid #666; border-radius: 4px; background: #2a2a2a; cursor: crosshair;";
                canvasContainer.appendChild(canvas);
                dialog.appendChild(canvasContainer);
                
                // Zone d'info
                const channelInfo = document.createElement("div");
                channelInfo.style.cssText = "background: #2a2a2a; padding: 15px; border-radius: 6px; margin-bottom: 15px; color: #fff;";
                dialog.appendChild(channelInfo);
                
                // Fonctions interactives
                const getMousePos = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    return {
                        x: (e.clientX - rect.left) / canvas.width,
                        y: 1 - (e.clientY - rect.top) / canvas.height
                    };
                };
                
                const findNearestPoint = (mousePos, threshold = 0.05) => {
                    for (let i = 0; i < currentPoints.length; i++) {
                        const dx = currentPoints[i].x - mousePos.x;
                        const dy = currentPoints[i].y - mousePos.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < threshold) {
                            return i;
                        }
                    }
                    return -1;
                };
                
                const updateCurveString = () => {
                    const channel = channels[activeChannel];
                    const widget = this.widgets.find(w => w.name === channel.widget);
                    if (widget) {
                        const curveString = currentPoints.map(p => 
                            `${Math.round(p.x * 255)},${Math.round(p.y * 255)}`
                        ).join(';');
                        widget.value = curveString;
                        this.setDirtyCanvas(true, true);
                        updateChannelInfo();
                    }
                };
                
                // Événements souris
                canvas.onmousedown = (e) => {
                    const mousePos = getMousePos(e);
                    const nearestIndex = findNearestPoint(mousePos);
                    
                    if (e.shiftKey && nearestIndex !== -1) {
                        if (nearestIndex !== 0 && nearestIndex !== currentPoints.length - 1) {
                            currentPoints.splice(nearestIndex, 1);
                            updateCurveString();
                            drawCurveVisualization();
                        }
                    } else if (nearestIndex !== -1) {
                        isDragging = true;
                        dragIndex = nearestIndex;
                        canvas.style.cursor = 'grabbing';
                    } else {
                        const newPoint = {x: mousePos.x, y: mousePos.y};
                        
                        let insertIndex = currentPoints.length;
                        for (let i = 0; i < currentPoints.length; i++) {
                            if (mousePos.x < currentPoints[i].x) {
                                insertIndex = i;
                                break;
                            }
                        }
                        
                        currentPoints.splice(insertIndex, 0, newPoint);
                        updateCurveString();
                        drawCurveVisualization();
                    }
                };
                
                canvas.onmousemove = (e) => {
                    const mousePos = getMousePos(e);
                    
                    if (isDragging && dragIndex !== -1) {
                        if (dragIndex === 0) {
                            currentPoints[dragIndex] = {x: 0, y: Math.max(0, Math.min(1, mousePos.y))};
                        } else if (dragIndex === currentPoints.length - 1) {
                            currentPoints[dragIndex] = {x: 1, y: Math.max(0, Math.min(1, mousePos.y))};
                        } else {
                            const prevX = currentPoints[dragIndex - 1].x;
                            const nextX = currentPoints[dragIndex + 1].x;
                            const constrainedX = Math.max(prevX + 0.01, Math.min(nextX - 0.01, mousePos.x));
                            currentPoints[dragIndex] = {
                                x: constrainedX, 
                                y: Math.max(0, Math.min(1, mousePos.y))
                            };
                        }
                        
                        updateCurveString();
                        drawCurveVisualization();
                    } else {
                        const nearestIndex = findNearestPoint(mousePos);
                        canvas.style.cursor = nearestIndex !== -1 ? 'grab' : 'crosshair';
                    }
                };
                
                canvas.onmouseup = () => {
                    isDragging = false;
                    dragIndex = -1;
                    canvas.style.cursor = 'crosshair';
                };
                
                canvas.onmouseleave = () => {
                    isDragging = false;
                    dragIndex = -1;
                    canvas.style.cursor = 'crosshair';
                };
                
                // Fonction de dessin
                const drawCurveVisualization = () => {
                    const ctx = canvas.getContext('2d');
                    const channel = channels[activeChannel];
                    
                    // Effacer
                    ctx.fillStyle = '#2a2a2a';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Grille
                    ctx.strokeStyle = '#444';
                    ctx.lineWidth = 1;
                    for (let i = 0; i <= 4; i++) {
                        const x = (i / 4) * canvas.width;
                        const y = (i / 4) * canvas.height;
                        
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, canvas.height);
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(canvas.width, y);
                        ctx.stroke();
                    }
                    
                    // Ligne de référence
                    ctx.strokeStyle = '#666';
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height);
                    ctx.lineTo(canvas.width, 0);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    
                    // Dessiner la courbe
                    if (currentPoints.length > 0) {
                        ctx.strokeStyle = channel.color;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        
                        currentPoints.forEach((point, index) => {
                            const x = point.x * canvas.width;
                            const y = (1 - point.y) * canvas.height;
                            
                            if (index === 0) {
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        });
                        
                        ctx.stroke();
                        
                        // Points de contrôle
                        currentPoints.forEach((point, index) => {
                            const x = point.x * canvas.width;
                            const y = (1 - point.y) * canvas.height;
                            
                            ctx.shadowColor = channel.color;
                            ctx.shadowBlur = 5;
                            ctx.fillStyle = channel.color;
                            ctx.beginPath();
                            ctx.arc(x, y, 5, 0, 2 * Math.PI);
                            ctx.fill();
                            
                            ctx.shadowBlur = 0;
                            ctx.strokeStyle = '#000';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        });
                    }
                };
                
                const updateChannelInfo = () => {
                    const channel = channels[activeChannel];
                    const widget = this.widgets.find(w => w.name === channel.widget);
                    
                    if (widget && widget.value) {
                        currentPoints = this.parseCurveString(widget.value);
                    } else {
                        currentPoints = [{x: 0, y: 0}, {x: 1, y: 1}];
                    }
                    
                    channelInfo.innerHTML = `
                        <h4 style="margin: 0 0 10px 0; color: ${channel.color};">${channel.name} Channel</h4>
                        <p style="margin: 0; font-family: monospace; font-size: 12px;">
                            Points: ${currentPoints.length} | Current: ${widget?.value || 'N/A'}
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">
                            Click: Add point | Drag: Move point | Shift+Click: Delete point
                        </p>
                    `;
                };
                
                updateChannelInfo();
                drawCurveVisualization();
                
                // Boutons de contrôle
                const controls = document.createElement("div");
                controls.style.cssText = "display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;";
                
                const resetChannelBtn = document.createElement("button");
                resetChannelBtn.textContent = "Reset Channel";
                resetChannelBtn.style.cssText = "padding: 6px 12px; background: #666; color: #fff; border: none; border-radius: 4px; cursor: pointer;";
                resetChannelBtn.onclick = () => {
                    const channel = channels[activeChannel];
                    const widget = this.widgets.find(w => w.name === channel.widget);
                    if (widget) {
                        widget.value = channel.widget === "curve_points_rgb" ? "0,0;64,64;128,128;192,192;255,255" : "0,0;255,255";
                        this.setDirtyCanvas(true, true);
                        updateChannelInfo();
                        drawCurveVisualization();
                    }
                };
                
                controls.appendChild(resetChannelBtn);
                dialog.appendChild(controls);
                
                // Bouton fermer
                const closeBtn = document.createElement("button");
                closeBtn.textContent = "Close";
                closeBtn.style.cssText = "display: block; margin: 0 auto; padding: 8px 16px; background: #00ff88; color: #000; border: none; border-radius: 4px; cursor: pointer;";
                closeBtn.onclick = () => document.body.removeChild(overlay);
                dialog.appendChild(closeBtn);
                
                overlay.appendChild(dialog);
                document.body.appendChild(overlay);
            };
            
            // MÉTHODE : Open Preset Selector COMPLÈTE
            nodeType.prototype.openPresetSelector = function() {
                console.log("Executing openPresetSelector");
                
                const presetsByCategory = {
                    "Basic": {
                        "Linear": "0,0;255,255",
                        "Negative": "0,255;255,0"
                    },
                    "Contrast": {
                        "Contrast+": "0,0;64,32;128,128;192,224;255,255",
                        "Contrast-": "0,0;64,80;128,128;192,176;255,255",
                        "S-Curve": "0,0;64,48;128,128;192,208;255,255",
                        "Inverse S": "0,0;64,80;128,128;192,176;255,255",
                        "Strong Contrast": "0,0;32,16;128,128;224,240;255,255",
                        "Subtle Contrast": "0,0;76,64;128,128;180,192;255,255"
                    },
                    "Brightness": {
                        "Bright Shadows": "0,31;64,89;128,128;192,192;255,255",
                        "Dark Highlights": "0,0;64,64;128,128;192,166;255,224",
                        "High Key": "0,31;64,94;128,158;192,207;255,255",
                        "Low Key": "0,0;64,48;128,97;192,161;255,224",
                        "Midtone Boost": "0,0;51,51;128,166;204,204;255,255"
                    },
                    "Film": {
                        "Film Look": "0,15;64,79;128,143;192,207;255,240",
                        "Kodak Vision": "0,10;51,64;128,133;204,212;255,245",
                        "Fuji Film": "0,5;38,56;128,140;217,224;255,250",
                        "Cinematic": "0,5;51,46;128,128;204,209;255,250",
                        "Log to Rec709": "0,0;46,13;128,115;209,242;255,255"
                    },
                    "Vintage": {
                        "Vintage": "0,8;64,71;128,135;192,199;255,247",
                        "Vintage 70s": "0,20;76,89;128,140;179,192;255,235",
                        "Vintage 80s": "0,13;64,82;128,148;192,209;255,242",
                        "Sepia Tone": "0,26;76,89;128,128;179,166;255,230",
                        "Faded Photo": "0,38;64,89;128,140;192,192;255,217"
                    }
                };
                
                const categoryColors = {
                    "Basic": "#888888",
                    "Contrast": "#ff6b6b", 
                    "Brightness": "#ffd93d",
                    "Film": "#6bcf7f",
                    "Vintage": "#4d96ff"
                };
                
                const overlay = document.createElement("div");
                overlay.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;
                `;
                
                const dialog = document.createElement("div");
                dialog.style.cssText = `
                    background: #1a1a1a; border: 2px solid #444;
                    border-radius: 12px; padding: 20px; max-width: 400px;
                    max-height: 80vh; overflow-y: auto;
                    color: #fff;
                `;
                
                const title = document.createElement("h3");
                title.textContent = "📊 Curve Presets";
                title.style.cssText = "color: #fff; margin: 0 0 15px 0; text-align: center;";
                dialog.appendChild(title);
                
                // Créer les catégories
                Object.entries(presetsByCategory).forEach(([categoryName, presets]) => {
                    const categoryDiv = document.createElement("div");
                    categoryDiv.style.cssText = "margin-bottom: 15px;";
                    
                    const categoryTitle = document.createElement("h4");
                    categoryTitle.textContent = categoryName;
                    categoryTitle.style.cssText = `
                        color: ${categoryColors[categoryName] || "#fff"}; 
                        margin: 0 0 8px 0; 
                        font-size: 14px;
                        font-weight: bold;
                    `;
                    categoryDiv.appendChild(categoryTitle);
                    
                    Object.entries(presets).forEach(([presetName, curve]) => {
                        const presetBtn = document.createElement("button");
                        presetBtn.textContent = presetName;
                        presetBtn.style.cssText = `
                            display: block; 
                            width: 100%; 
                            margin: 2px 0; 
                            padding: 8px 12px;
                            background: #333; 
                            color: #ccc; 
                            border: 1px solid #555;
                            border-radius: 4px; 
                            cursor: pointer;
                            text-align: left;
                            font-size: 12px;
                            transition: all 0.2s ease;
                        `;
                        
                        presetBtn.onmouseover = () => {
                            presetBtn.style.background = "#444";
                            presetBtn.style.color = "#fff";
                            presetBtn.style.borderColor = "#666";
                        };
                        presetBtn.onmouseout = () => {
                            presetBtn.style.background = "#333";
                            presetBtn.style.color = "#ccc";
                            presetBtn.style.borderColor = "#555";
                        };
                        
                        presetBtn.onclick = () => {
                            const rgbWidget = this.widgets.find(w => w.name === 'curve_points_rgb');
                            if (rgbWidget) {
                                rgbWidget.value = curve;
                                this.setDirtyCanvas(true, true);
                                console.log(`✅ Applied preset: ${presetName}`);
                            }
                            document.body.removeChild(overlay);
                        };
                        
                        categoryDiv.appendChild(presetBtn);
                    });
                    
                    dialog.appendChild(categoryDiv);
                });
                
                const closeBtn = document.createElement("button");
                closeBtn.textContent = "Close";
                closeBtn.style.cssText = `
                    display: block; 
                    margin: 20px auto 0 auto; 
                    padding: 8px 16px; 
                    background: #666;
                    color: #fff; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer;
                `;
                closeBtn.onclick = () => document.body.removeChild(overlay);
                dialog.appendChild(closeBtn);
                
                overlay.appendChild(dialog);
                document.body.appendChild(overlay);
            };
            
            // MÉTHODE UTILITAIRE
            nodeType.prototype.parseCurveString = function(curveString) {
                try {
                    return curveString.split(';').map(pair => {
                        const [x, y] = pair.split(',').map(Number);
                        return {x: x / 255, y: y / 255};
                    });
                } catch (e) {
                    return [{x: 0, y: 0}, {x: 1, y: 1}];
                }
            };
        }
    }
});
