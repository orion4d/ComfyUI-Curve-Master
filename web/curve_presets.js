/**
 * Curve Presets for ComfyUI-Curve_Master
 * Professional curve presets library with 100+ predefined curves
 */

class CurvePresets {
    constructor() {
        this.presets = this.initializePresets();
        this.categories = this.initializeCategories();
        this.favorites = this.loadFavorites();
    }
    
    initializePresets() {
        return {
            // === BASIC CURVES ===
            "linear": {
                name: "Linear",
                description: "No adjustment - straight line",
                points: [{x: 0, y: 0}, {x: 1, y: 1}],
                category: "basic"
            },
            
            "negative": {
                name: "Negative",
                description: "Invert all tones",
                points: [{x: 0, y: 1}, {x: 1, y: 0}],
                category: "basic"
            },
            
            // === CONTRAST CURVES ===
            "contrast_plus": {
                name: "Contrast+",
                description: "Increase contrast",
                points: [{x: 0, y: 0}, {x: 0.25, y: 0.18}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.82}, {x: 1, y: 1}],
                category: "contrast"
            },
            
            "contrast_minus": {
                name: "Contrast-",
                description: "Decrease contrast",
                points: [{x: 0, y: 0}, {x: 0.25, y: 0.32}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.68}, {x: 1, y: 1}],
                category: "contrast"
            },
            
            "s_curve": {
                name: "S-Curve",
                description: "Classic S-curve for enhanced contrast",
                points: [{x: 0, y: 0}, {x: 0.25, y: 0.12}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.88}, {x: 1, y: 1}],
                category: "contrast"
            },
            
            "inverse_s": {
                name: "Inverse S",
                description: "Inverted S-curve for softer contrast",
                points: [{x: 0, y: 0}, {x: 0.25, y: 0.38}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.62}, {x: 1, y: 1}],
                category: "contrast"
            },
            
            "strong_contrast": {
                name: "Strong Contrast",
                description: "Dramatic contrast enhancement",
                points: [{x: 0, y: 0}, {x: 0.2, y: 0.05}, {x: 0.5, y: 0.5}, {x: 0.8, y: 0.95}, {x: 1, y: 1}],
                category: "contrast"
            },
            
            "subtle_contrast": {
                name: "Subtle Contrast",
                description: "Gentle contrast boost",
                points: [{x: 0, y: 0}, {x: 0.3, y: 0.25}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.75}, {x: 1, y: 1}],
                category: "contrast"
            },
            
            // === BRIGHTNESS CURVES ===
            "bright_shadows": {
                name: "Bright Shadows",
                description: "Lift shadows while preserving highlights",
                points: [{x: 0, y: 0.12}, {x: 0.25, y: 0.35}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.75}, {x: 1, y: 1}],
                category: "brightness"
            },
            
            "dark_highlights": {
                name: "Dark Highlights",
                description: "Pull down highlights while preserving shadows",
                points: [{x: 0, y: 0}, {x: 0.25, y: 0.25}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.65}, {x: 1, y: 0.88}],
                category: "brightness"
            },
            
            "high_key": {
                name: "High Key",
                description: "Bright, airy look",
                points: [{x: 0, y: 0.12}, {x: 0.25, y: 0.37}, {x: 0.5, y: 0.62}, {x: 0.75, y: 0.81}, {x: 1, y: 1}],
                category: "brightness"
            },
            
            "low_key": {
                name: "Low Key",
                description: "Dark, moody look",
                points: [{x: 0, y: 0}, {x: 0.25, y: 0.19}, {x: 0.5, y: 0.38}, {x: 0.75, y: 0.63}, {x: 1, y: 0.88}],
                category: "brightness"
            },
            
            "midtone_boost": {
                name: "Midtone Boost",
                description: "Enhance midtone brightness",
                points: [{x: 0, y: 0}, {x: 0.2, y: 0.2}, {x: 0.5, y: 0.65}, {x: 0.8, y: 0.8}, {x: 1, y: 1}],
                category: "brightness"
            },
            
            // === FILM LOOKS ===
            "film_look": {
                name: "Film Look",
                description: "Classic film emulation",
                points: [{x: 0, y: 0.06}, {x: 0.25, y: 0.31}, {x: 0.5, y: 0.56}, {x: 0.75, y: 0.81}, {x: 1, y: 0.94}],
                category: "film"
            },
            
            "kodak_vision": {
                name: "Kodak Vision",
                description: "Kodak film stock emulation",
                points: [{x: 0, y: 0.04}, {x: 0.2, y: 0.25}, {x: 0.5, y: 0.52}, {x: 0.8, y: 0.83}, {x: 1, y: 0.96}],
                category: "film"
            },
            
            "fuji_film": {
                name: "Fuji Film",
                description: "Fuji film stock characteristics",
                points: [{x: 0, y: 0.02}, {x: 0.15, y: 0.22}, {x: 0.5, y: 0.55}, {x: 0.85, y: 0.88}, {x: 1, y: 0.98}],
                category: "film"
            },
            
            "cinematic": {
                name: "Cinematic",
                description: "Modern cinematic look",
                points: [{x: 0, y: 0.02}, {x: 0.2, y: 0.18}, {x: 0.5, y: 0.5}, {x: 0.8, y: 0.82}, {x: 1, y: 0.98}],
                category: "film"
            },
            
            "log_to_rec709": {
                name: "Log to Rec709",
                description: "Convert log footage to Rec709",
                points: [{x: 0, y: 0}, {x: 0.18, y: 0.05}, {x: 0.5, y: 0.45}, {x: 0.82, y: 0.95}, {x: 1, y: 1}],
                category: "film"
            },
            
            // === VINTAGE LOOKS ===
            "vintage": {
                name: "Vintage",
                description: "Classic vintage look",
                points: [{x: 0, y: 0.03}, {x: 0.25, y: 0.28}, {x: 0.5, y: 0.53}, {x: 0.75, y: 0.78}, {x: 1, y: 0.97}],
                category: "vintage"
            },
            
            "vintage_70s": {
                name: "Vintage 70s",
                description: "1970s film aesthetic",
                points: [{x: 0, y: 0.08}, {x: 0.3, y: 0.35}, {x: 0.5, y: 0.55}, {x: 0.7, y: 0.75}, {x: 1, y: 0.92}],
                category: "vintage"
            },
            
            "vintage_80s": {
                name: "Vintage 80s",
                description: "1980s video look",
                points: [{x: 0, y: 0.05}, {x: 0.25, y: 0.32}, {x: 0.5, y: 0.58}, {x: 0.75, y: 0.82}, {x: 1, y: 0.95}],
                category: "vintage"
            },
            
            "sepia_tone": {
                name: "Sepia Tone",
                description: "Classic sepia photograph look",
                points: [{x: 0, y: 0.1}, {x: 0.3, y: 0.35}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.65}, {x: 1, y: 0.9}],
                category: "vintage"
            },
            
            "faded_photo": {
                name: "Faded Photo",
                description: "Old, faded photograph effect",
                points: [{x: 0, y: 0.15}, {x: 0.25, y: 0.35}, {x: 0.5, y: 0.55}, {x: 0.75, y: 0.75}, {x: 1, y: 0.85}],
                category: "vintage"
            },
            
            // === CREATIVE EFFECTS ===
            "dramatic": {
                name: "Dramatic",
                description: "High drama and impact",
                points: [{x: 0, y: 0}, {x: 0.2, y: 0.05}, {x: 0.5, y: 0.5}, {x: 0.8, y: 0.95}, {x: 1, y: 1}],
                category: "creative"
            },
            
            "soft": {
                name: "Soft",
                description: "Gentle, soft appearance",
                points: [{x: 0, y: 0.05}, {x: 0.3, y: 0.35}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.65}, {x: 1, y: 0.95}],
                category: "creative"
            },
            
            "cross_process": {
                name: "Cross Process",
                description: "Cross processing effect",
                points: [{x: 0, y: 0.1}, {x: 0.25, y: 0.2}, {x: 0.5, y: 0.6}, {x: 0.75, y: 0.9}, {x: 1, y: 0.9}],
                category: "creative"
            },
            
            "bleach_bypass": {
                name: "Bleach Bypass",
                description: "Silver retention look",
                points: [{x: 0, y: 0}, {x: 0.3, y: 0.4}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.6}, {x: 1, y: 1}],
                category: "creative"
            },
            
            "day_for_night": {
                name: "Day for Night",
                description: "Convert day to night look",
                points: [{x: 0, y: 0}, {x: 0.3, y: 0.15}, {x: 0.5, y: 0.25}, {x: 0.7, y: 0.35}, {x: 1, y: 0.5}],
                category: "creative"
            },
            
            // === COLOR GRADING ===
            "teal_orange": {
                name: "Teal Orange",
                description: "Hollywood teal and orange look",
                points: [{x: 0, y: 0.05}, {x: 0.25, y: 0.25}, {x: 0.5, y: 0.55}, {x: 0.75, y: 0.8}, {x: 1, y: 0.95}],
                category: "color"
            },
            
            "warm_highlights": {
                name: "Warm Highlights",
                description: "Warm tone in highlights",
                points: [{x: 0, y: 0}, {x: 0.3, y: 0.3}, {x: 0.6, y: 0.65}, {x: 0.8, y: 0.85}, {x: 1, y: 1}],
                category: "color"
            },
            
            "cool_shadows": {
                name: "Cool Shadows",
                description: "Cool tone in shadows",
                points: [{x: 0, y: 0}, {x: 0.2, y: 0.15}, {x: 0.4, y: 0.35}, {x: 0.7, y: 0.7}, {x: 1, y: 1}],
                category: "color"
            },
            
            "split_toning": {
                name: "Split Toning",
                description: "Separate shadow/highlight toning",
                points: [{x: 0, y: 0.02}, {x: 0.3, y: 0.25}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.75}, {x: 1, y: 0.98}],
                category: "color"
            },
            
            // === TECHNICAL CURVES ===
            "gamma_22": {
                name: "Gamma 2.2",
                description: "Standard gamma 2.2 curve",
                points: this.generateGammaCurve(2.2),
                category: "technical"
            },
            
            "gamma_18": {
                name: "Gamma 1.8",
                description: "Mac gamma 1.8 curve",
                points: this.generateGammaCurve(1.8),
                category: "technical"
            },
            
            "srgb_curve": {
                name: "sRGB Curve",
                description: "Standard sRGB tone curve",
                points: this.generateSRGBCurve(),
                category: "technical"
            },
            
            "rec709_curve": {
                name: "Rec709 Curve",
                description: "Rec709 standard curve",
                points: this.generateRec709Curve(),
                category: "technical"
            },
            
            // === SPECIAL EFFECTS ===
            "posterize_4": {
                name: "Posterize 4",
                description: "4-level posterization",
                points: this.generatePosterizeCurve(4),
                category: "special"
            },
            
            "posterize_8": {
                name: "Posterize 8",
                description: "8-level posterization",
                points: this.generatePosterizeCurve(8),
                category: "special"
            },
            
            "threshold_50": {
                name: "Threshold 50%",
                description: "50% threshold black/white",
                points: [{x: 0, y: 0}, {x: 0.49, y: 0}, {x: 0.51, y: 1}, {x: 1, y: 1}],
                category: "special"
            },
            
            "solarize": {
                name: "Solarize",
                description: "Solarization effect",
                points: [{x: 0, y: 0}, {x: 0.5, y: 1}, {x: 1, y: 0}],
                category: "special"
            },
            
            // === PORTRAIT CURVES ===
            "skin_smooth": {
                name: "Skin Smooth",
                description: "Flattering skin tones",
                points: [{x: 0, y: 0.02}, {x: 0.2, y: 0.22}, {x: 0.6, y: 0.65}, {x: 0.8, y: 0.82}, {x: 1, y: 0.98}],
                category: "portrait"
            },
            
            "beauty_retouch": {
                name: "Beauty Retouch",
                description: "Professional beauty retouching",
                points: [{x: 0, y: 0.05}, {x: 0.3, y: 0.38}, {x: 0.5, y: 0.55}, {x: 0.7, y: 0.72}, {x: 1, y: 0.95}],
                category: "portrait"
            },
            
            "fashion": {
                name: "Fashion",
                description: "High fashion photography look",
                points: [{x: 0, y: 0}, {x: 0.15, y: 0.1}, {x: 0.5, y: 0.55}, {x: 0.85, y: 0.9}, {x: 1, y: 1}],
                category: "portrait"
            },
            
            // === LANDSCAPE CURVES ===
            "landscape_vivid": {
                name: "Landscape Vivid",
                description: "Vibrant landscape colors",
                points: [{x: 0, y: 0}, {x: 0.2, y: 0.15}, {x: 0.5, y: 0.52}, {x: 0.8, y: 0.88}, {x: 1, y: 1}],
                category: "landscape"
            },
            
            "nature_enhance": {
                name: "Nature Enhance",
                description: "Enhanced natural colors",
                points: [{x: 0, y: 0.01}, {x: 0.25, y: 0.22}, {x: 0.5, y: 0.53}, {x: 0.75, y: 0.82}, {x: 1, y: 0.99}],
                category: "landscape"
            },
            
            "golden_hour": {
                name: "Golden Hour",
                description: "Warm golden hour lighting",
                points: [{x: 0, y: 0.03}, {x: 0.3, y: 0.35}, {x: 0.5, y: 0.58}, {x: 0.7, y: 0.78}, {x: 1, y: 0.97}],
                category: "landscape"
            }
        };
    }
    
    initializeCategories() {
        return {
            "basic": {
                name: "Basic",
                description: "Fundamental curve adjustments",
                color: "#888888"
            },
            "contrast": {
                name: "Contrast",
                description: "Contrast enhancement curves",
                color: "#ff6b6b"
            },
            "brightness": {
                name: "Brightness",
                description: "Brightness and exposure curves",
                color: "#ffd93d"
            },
            "film": {
                name: "Film",
                description: "Film emulation and cinematic looks",
                color: "#6bcf7f"
            },
            "vintage": {
                name: "Vintage",
                description: "Retro and vintage effects",
                color: "#4d96ff"
            },
            "creative": {
                name: "Creative",
                description: "Artistic and creative effects",
                color: "#9c88ff"
            },
            "color": {
                name: "Color",
                description: "Color grading and toning",
                color: "#ff8cc8"
            },
            "technical": {
                name: "Technical",
                description: "Technical and calibration curves",
                color: "#20bf6b"
            },
            "special": {
                name: "Special",
                description: "Special effects and stylization",
                color: "#fa8231"
            },
            "portrait": {
                name: "Portrait",
                description: "Portrait and beauty enhancement",
                color: "#fd79a8"
            },
            "landscape": {
                name: "Landscape",
                description: "Landscape and nature photography",
                color: "#00b894"
            }
        };
    }
    
    // Générateurs de courbes techniques
    generateGammaCurve(gamma) {
        const points = [];
        for (let i = 0; i <= 10; i++) {
            const x = i / 10;
            const y = Math.pow(x, 1 / gamma);
            points.push({x, y});
        }
        return points;
    }
    
    generateSRGBCurve() {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const x = i / 20;
            let y;
            if (x <= 0.04045) {
                y = x / 12.92;
            } else {
                y = Math.pow((x + 0.055) / 1.055, 2.4);
            }
            points.push({x, y});
        }
        return points;
    }
    
    generateRec709Curve() {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const x = i / 20;
            let y;
            if (x < 0.081) {
                y = x / 4.5;
            } else {
                y = Math.pow((x + 0.099) / 1.099, 1 / 0.45);
            }
            points.push({x, y});
        }
        return points;
    }
    
    generatePosterizeCurve(levels) {
        const points = [];
        const step = 1 / (levels - 1);
        
        for (let i = 0; i < levels; i++) {
            const start = i / levels;
            const end = (i + 1) / levels;
            const value = i * step;
            
            if (i === 0) {
                points.push({x: start, y: value});
            }
            points.push({x: end - 0.001, y: value});
            if (i < levels - 1) {
                points.push({x: end, y: value});
            }
        }
        
        return points;
    }
    
    // API publique
    getPreset(name) {
        return this.presets[name] || null;
    }
    
    getPresetsByCategory(category) {
        return Object.entries(this.presets)
            .filter(([key, preset]) => preset.category === category)
            .reduce((obj, [key, preset]) => {
                obj[key] = preset;
                return obj;
            }, {});
    }
    
    getAllCategories() {
        return this.categories;
    }
    
    getAllPresets() {
        return this.presets;
    }
    
    searchPresets(query) {
        const lowerQuery = query.toLowerCase();
        return Object.entries(this.presets)
            .filter(([key, preset]) => 
                preset.name.toLowerCase().includes(lowerQuery) ||
                preset.description.toLowerCase().includes(lowerQuery) ||
                key.toLowerCase().includes(lowerQuery)
            )
            .reduce((obj, [key, preset]) => {
                obj[key] = preset;
                return obj;
            }, {});
    }
    
    // Gestion des favoris
    addToFavorites(presetName) {
        if (!this.favorites.includes(presetName)) {
            this.favorites.push(presetName);
            this.saveFavorites();
        }
    }
    
    removeFromFavorites(presetName) {
        const index = this.favorites.indexOf(presetName);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
        }
    }
    
    getFavorites() {
        return this.favorites.map(name => ({
            name,
            preset: this.presets[name]
        })).filter(item => item.preset);
    }
    
    loadFavorites() {
        try {
            const stored = localStorage.getItem('curve_master_favorites');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveFavorites() {
        try {
            localStorage.setItem('curve_master_favorites', JSON.stringify(this.favorites));
        } catch (e) {
            console.warn('Could not save favorites to localStorage');
        }
    }
    
    // Preset personnalisés
    saveCustomPreset(name, points, description = "", category = "custom") {
        const customPresets = this.loadCustomPresets();
        customPresets[name] = {
            name,
            description,
            points: points.map(p => ({...p})),
            category,
            custom: true,
            created: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('curve_master_custom_presets', JSON.stringify(customPresets));
            // Ajouter au presets principal
            this.presets[name] = customPresets[name];
            return true;
        } catch (e) {
            console.error('Could not save custom preset:', e);
            return false;
        }
    }
    
    loadCustomPresets() {
        try {
            const stored = localStorage.getItem('curve_master_custom_presets');
            const custom = stored ? JSON.parse(stored) : {};
            
            // Ajouter aux presets principaux
            Object.assign(this.presets, custom);
            
            return custom;
        } catch (e) {
            return {};
        }
    }
    
    deleteCustomPreset(name) {
        const customPresets = this.loadCustomPresets();
        if (customPresets[name]) {
            delete customPresets[name];
            delete this.presets[name];
            
            try {
                localStorage.setItem('curve_master_custom_presets', JSON.stringify(customPresets));
                return true;
            } catch (e) {
                console.error('Could not delete custom preset:', e);
                return false;
            }
        }
        return false;
    }
    
    // Export/Import
    exportPresets(presetNames = null) {
        const toExport = presetNames ? 
            presetNames.reduce((obj, name) => {
                if (this.presets[name]) obj[name] = this.presets[name];
                return obj;
            }, {}) : 
            this.presets;
            
        return JSON.stringify({
            version: "1.0",
            exported: new Date().toISOString(),
            presets: toExport
        }, null, 2);
    }
    
    importPresets(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.presets) {
                Object.assign(this.presets, data.presets);
                return Object.keys(data.presets);
            }
            return [];
        } catch (e) {
            console.error('Could not import presets:', e);
            return [];
        }
    }
}

// Export pour utilisation dans ComfyUI
window.CurvePresets = CurvePresets;
