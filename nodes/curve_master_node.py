import numpy as np
import torch
import cv2
import os
import json
from pathlib import Path

class CurveMasterNode:
    # Variable de classe pour stocker les presets utilisateur en mémoire
    _user_presets = {}
    
    @classmethod
    def INPUT_TYPES(cls):
        # Charger les presets utilisateur au démarrage
        cls._load_user_presets()
        
        # Créer la liste dynamique des presets utilisateur
        user_preset_list = ["None"] + list(cls._user_presets.keys())
        
        return {
            "required": {
                "image": ("IMAGE",),
                "curve_points_rgb": ("STRING", {
                    "default": "0,0;64,64;128,128;192,192;255,255", 
                    "multiline": False,
                    "widget": "curve_editor_multi"
                }),
                "curve_points_red": ("STRING", {
                    "default": "0,0;255,255", 
                    "multiline": False,
                    "widget": "curve_editor_red"
                }),
                "curve_points_green": ("STRING", {
                    "default": "0,0;255,255", 
                    "multiline": False,
                    "widget": "curve_editor_green"
                }),
                "curve_points_blue": ("STRING", {
                    "default": "0,0;255,255", 
                    "multiline": False,
                    "widget": "curve_editor_blue"
                }),
                "interpolation": (["linear", "cubic", "catmull-rom"], {"default": "catmull-rom"}),
                "strength": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1}),
                "preserve_luminosity": ("BOOLEAN", {"default": False}),
                "blend_mode": (["normal", "multiply", "screen", "overlay", "soft_light"], {"default": "normal"}),
                "opacity": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 1.0, "step": 0.05}),
                "gamma_correction": ("FLOAT", {"default": 1.0, "min": 0.1, "max": 3.0, "step": 0.1}),
                # Paramètres de lissage
                "curve_smoothing": ("BOOLEAN", {"default": False}),
                "smoothing_strength": ("FLOAT", {"default": 0.5, "min": 0.1, "max": 2.0, "step": 0.1}),
                "smoothing_iterations": ("INT", {"default": 3, "min": 1, "max": 10, "step": 1}),
                "anti_clipping": ("BOOLEAN", {"default": True}),
                # NOUVEAUX CHAMPS pour l'export de presets
                "save_preset": ("BOOLEAN", {"default": False}),
                "preset_user_path": ("STRING", {"default": "./presets/curves", "multiline": False}),
                "preset_user_name": ("STRING", {"default": "my_preset", "multiline": False}),
                # Menu déroulant des presets utilisateur
                "user_preset": (user_preset_list, {"default": "None"}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "apply_curve_master"
    CATEGORY = "Curve Master"
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("nan")

    @classmethod
    def _get_presets_folder(cls):
        """Retourne le dossier des presets utilisateur"""
        current_dir = Path(__file__).parent.parent
        presets_dir = current_dir / "presets" / "curves"
        presets_dir.mkdir(parents=True, exist_ok=True)
        return presets_dir

    @classmethod
    def _load_user_presets(cls):
        """Charge tous les presets utilisateur depuis le dossier"""
        try:
            presets_dir = cls._get_presets_folder()
            cls._user_presets = {}
            
            for json_file in presets_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        preset_name = data.get('name', json_file.stem)
                        cls._user_presets[preset_name] = data.get('settings', data)
                        print(f"Loaded user preset: {preset_name}")
                except Exception as e:
                    print(f"Error loading preset {json_file}: {e}")
                    
        except Exception as e:
            print(f"Error loading user presets: {e}")

    def save_user_preset(self, name, settings):
        """Sauvegarde un preset utilisateur"""
        try:
            presets_dir = self._get_presets_folder()
            
            preset_data = {
                "version": "1.0",
                "name": name,
                "exported": str(Path(__file__).parent.parent),
                "type": "curve_preset",
                "settings": settings
            }
            
            file_path = presets_dir / f"{name}.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(preset_data, f, indent=2)
            
            # Mettre à jour le cache en mémoire
            self._user_presets[name] = settings
            
            print(f"User preset saved: {file_path}")
            return True
            
        except Exception as e:
            print(f"Error saving user preset: {e}")
            return False

    def export_preset_direct(self, preset_user_path, preset_user_name, **kwargs):
        """Exporte directement un preset dans le dossier spécifié"""
        print(f"DEBUG: export_preset_direct appelé avec path='{preset_user_path}', name='{preset_user_name}'")
        try:
            # Créer le chemin complet
            if not preset_user_path.startswith('./'):
                preset_user_path = './' + preset_user_path.lstrip('/')
            
            # Résoudre le chemin relatif par rapport au dossier du nœud
            current_dir = Path(__file__).parent.parent
            full_path = current_dir / preset_user_path.lstrip('./')
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"DEBUG: Dossier créé: {full_path}")
            
            # Collecter tous les paramètres
            settings = {}
            for key, value in kwargs.items():
                if key not in ['preset_user_path', 'preset_user_name', 'user_preset', 'image', 'save_preset']:
                    settings[key] = value
            
            # Créer les données du preset
            preset_data = {
                "version": "1.0",
                "name": preset_user_name,
                "exported": str(full_path),
                "type": "curve_preset",
                "export_date": str(Path(__file__).parent.parent),
                "settings": settings
            }
            
            # Nom du fichier
            file_name = f"{preset_user_name}.json"
            file_path = full_path / file_name
            print(f"DEBUG: Tentative d'écriture vers: {file_path}")
            
            # Sauvegarder
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(preset_data, f, indent=2)
            
            # Mettre à jour le cache en mémoire
            self._user_presets[preset_user_name] = settings
            
            print(f"✅ Preset '{preset_user_name}' exported to: {file_path}")
            return str(file_path)
            
        except Exception as e:
            print(f"❌ Error exporting preset: {e}")
            import traceback
            traceback.print_exc()
            return None

    def smooth_curve_points(self, points, smoothing_strength=0.5, iterations=3, anti_clipping=True):
        """
        Lisse les points de courbe pour éviter l'écrêtage et créer des transitions douces
        Inspiré des techniques de lissage de Photoshop
        """
        if len(points) < 3:
            return points
        
        smoothed_points = points.copy()
        
        for iteration in range(iterations):
            new_points = smoothed_points.copy()
            
            # Appliquer un lissage gaussien adaptatif
            for i in range(1, len(smoothed_points) - 1):
                prev_point = smoothed_points[i - 1]
                curr_point = smoothed_points[i]
                next_point = smoothed_points[i + 1]
                
                # Calculer la moyenne pondérée (lissage gaussien)
                weight_center = 0.5
                weight_neighbors = (1.0 - weight_center) / 2.0
                
                # Lissage en Y seulement (X reste fixe pour préserver l'ordre)
                smoothed_y = (
                    prev_point[1] * weight_neighbors +
                    curr_point[1] * weight_center +
                    next_point[1] * weight_neighbors
                )
                
                # Appliquer la force de lissage
                blend_factor = smoothing_strength * 0.3  # Réduire l'intensité
                new_y = curr_point[1] * (1 - blend_factor) + smoothed_y * blend_factor
                
                # Anti-écrêtage : éviter les valeurs extrêmes
                if anti_clipping:
                    # Limiter les changements brusques
                    max_change = 0.1  # Maximum 10% de changement par itération
                    y_change = abs(new_y - curr_point[1])
                    if y_change > max_change:
                        direction = 1 if new_y > curr_point[1] else -1
                        new_y = curr_point[1] + (max_change * direction)
                    
                    # Contraindre dans les limites [0, 1]
                    new_y = np.clip(new_y, 0.0, 1.0)
                    
                    # Éviter les inversions de pente drastiques
                    if i > 1 and i < len(smoothed_points) - 2:
                        prev_slope = curr_point[1] - prev_point[1]
                        next_slope = next_point[1] - curr_point[1]
                        
                        # Si les pentes sont opposées, réduire le lissage
                        if prev_slope * next_slope < 0:
                            new_y = curr_point[1] * 0.7 + new_y * 0.3
                
                new_points[i] = (curr_point[0], new_y)
            
            smoothed_points = new_points
        
        return smoothed_points

    def apply_curve_smoothing_filter(self, lut, smoothing_strength=0.5):
        """
        Applique un filtre de lissage directement sur la LUT pour éviter l'écrêtage
        """
        if smoothing_strength <= 0:
            return lut
        
        # Convertir en float pour les calculs
        lut_float = lut.astype(np.float32)
        
        # Appliquer un filtre gaussien 1D
        kernel_size = max(3, int(smoothing_strength * 5))
        if kernel_size % 2 == 0:
            kernel_size += 1
        
        # Créer un noyau gaussien
        sigma = smoothing_strength
        x = np.arange(kernel_size) - kernel_size // 2
        kernel = np.exp(-x**2 / (2 * sigma**2))
        kernel = kernel / np.sum(kernel)
        
        # Appliquer le filtre avec padding pour éviter les effets de bord
        padded_lut = np.pad(lut_float, kernel_size//2, mode='edge')
        smoothed_lut = np.convolve(padded_lut, kernel, mode='valid')
        
        # Anti-écrêtage : limiter les valeurs extrêmes
        smoothed_lut = np.clip(smoothed_lut, 0, 255)
        
        # Mélanger avec la LUT originale selon la force de lissage
        blend_factor = min(smoothing_strength, 1.0)
        final_lut = lut_float * (1 - blend_factor) + smoothed_lut * blend_factor
        
        return final_lut.astype(np.uint8)

    def apply_curve_master(self, image, curve_points_rgb, curve_points_red, curve_points_green, curve_points_blue, 
                          interpolation, strength, preserve_luminosity, blend_mode, opacity, gamma_correction,
                          curve_smoothing, smoothing_strength, smoothing_iterations, anti_clipping, 
                          save_preset, preset_user_path, preset_user_name, user_preset):
        
        # SAUVEGARDER le preset seulement si save_preset est True
        if save_preset and preset_user_name and preset_user_name.strip() and preset_user_name != "my_preset":
            print(f"🔧 Sauvegarde du preset activée: '{preset_user_name}' vers '{preset_user_path}'")
            export_result = self.export_preset_direct(
                preset_user_path, preset_user_name,
                curve_points_rgb=curve_points_rgb,
                curve_points_red=curve_points_red,
                curve_points_green=curve_points_green,
                curve_points_blue=curve_points_blue,
                interpolation=interpolation,
                strength=strength,
                preserve_luminosity=preserve_luminosity,
                blend_mode=blend_mode,
                opacity=opacity,
                gamma_correction=gamma_correction,
                curve_smoothing=curve_smoothing,
                smoothing_strength=smoothing_strength,
                smoothing_iterations=smoothing_iterations,
                anti_clipping=anti_clipping
            )
            if export_result:
                print(f"✅ Preset sauvegardé avec succès: {export_result}")
            else:
                print(f"❌ Échec de la sauvegarde du preset")
        
        # Appliquer le preset utilisateur si sélectionné
        if user_preset != "None" and user_preset in self._user_presets:
            preset_settings = self._user_presets[user_preset]
            curve_points_rgb = preset_settings.get('curve_points_rgb', curve_points_rgb)
            curve_points_red = preset_settings.get('curve_points_red', curve_points_red)
            curve_points_green = preset_settings.get('curve_points_green', curve_points_green)
            curve_points_blue = preset_settings.get('curve_points_blue', curve_points_blue)
            interpolation = preset_settings.get('interpolation', interpolation)
            strength = preset_settings.get('strength', strength)
            preserve_luminosity = preset_settings.get('preserve_luminosity', preserve_luminosity)
            blend_mode = preset_settings.get('blend_mode', blend_mode)
            opacity = preset_settings.get('opacity', opacity)
            gamma_correction = preset_settings.get('gamma_correction', gamma_correction)
            curve_smoothing = preset_settings.get('curve_smoothing', curve_smoothing)
            smoothing_strength = preset_settings.get('smoothing_strength', smoothing_strength)
            smoothing_iterations = preset_settings.get('smoothing_iterations', smoothing_iterations)
            anti_clipping = preset_settings.get('anti_clipping', anti_clipping)
        
        print(f"🔧 Smoothing parameters: enabled={curve_smoothing}, strength={smoothing_strength}, iterations={smoothing_iterations}, anti_clipping={anti_clipping}")
        
        # Gestion des dimensions du tensor
        if len(image.shape) == 4:
            batch_size = image.shape[0]
            img_tensor = image[0]
        else:
            batch_size = 1
            img_tensor = image
        
        # Conversion en numpy
        img_np = (img_tensor.cpu().numpy() * 255).astype(np.uint8)
        original_img = img_np.copy()
        
        # Parse des points de courbe pour chaque canal
        points_rgb = self.parse_curve_points(curve_points_rgb)
        points_red = self.parse_curve_points(curve_points_red)
        points_green = self.parse_curve_points(curve_points_green)
        points_blue = self.parse_curve_points(curve_points_blue)

        # Génération des LUTs AVEC les paramètres de lissage
        lut_rgb = self.generate_curve_lut(points_rgb, interpolation, strength, gamma_correction,
                                         curve_smoothing, smoothing_strength, smoothing_iterations, anti_clipping)
        lut_red = self.generate_curve_lut(points_red, interpolation, strength, gamma_correction,
                                         curve_smoothing, smoothing_strength, smoothing_iterations, anti_clipping)
        lut_green = self.generate_curve_lut(points_green, interpolation, strength, gamma_correction,
                                           curve_smoothing, smoothing_strength, smoothing_iterations, anti_clipping)
        lut_blue = self.generate_curve_lut(points_blue, interpolation, strength, gamma_correction,
                                          curve_smoothing, smoothing_strength, smoothing_iterations, anti_clipping)

        # Application des courbes multi-canaux
        result = self.apply_multi_channel_curves(img_np, lut_rgb, lut_red, lut_green, lut_blue, preserve_luminosity)
        
        # Application du mode de fusion et opacité
        if blend_mode != "normal" or opacity < 1.0:
            result = self.apply_blend_mode(original_img, result, blend_mode, opacity)

        # Reconversion en tensor
        result_tensor = torch.from_numpy(result.astype(np.float32) / 255.0)
        
        if batch_size > 1:
            result_tensor = result_tensor.unsqueeze(0).repeat(batch_size, 1, 1, 1)
        else:
            result_tensor = result_tensor.unsqueeze(0)
        
        return (result_tensor,)

    def parse_curve_points(self, curve_points_str):
        """Parse la chaîne de points de courbe en array numpy"""
        try:
            pairs = curve_points_str.strip().split(';')
            points = []
            for pair in pairs:
                if ',' in pair:
                    x_str, y_str = pair.split(',')
                    x = np.clip(float(x_str) / 255.0, 0.0, 1.0)
                    y = np.clip(float(y_str) / 255.0, 0.0, 1.0)
                    points.append((x, y))
            
            if len(points) >= 2:
                points.sort(key=lambda p: p[0])
                return np.array(points)
            else:
                return np.array([(0.0, 0.0), (1.0, 1.0)])
                
        except Exception as e:
            print(f"Erreur parsing curve points: {e}")
            return np.array([(0.0, 0.0), (1.0, 1.0)])

    def generate_curve_lut(self, points, interpolation, strength, gamma_correction, 
                          curve_smoothing=False, smoothing_strength=0.5, smoothing_iterations=3, anti_clipping=True):
        """Génère une LUT 256 à partir des points de contrôle avec lissage optionnel"""
        
        # Appliquer le lissage sur les points si demandé
        if curve_smoothing and len(points) > 2:
            points = self.smooth_curve_points(points, smoothing_strength, smoothing_iterations, anti_clipping)
        
        lut = np.zeros(256, dtype=np.float32)
        xs = points[:, 0] * 255
        ys = points[:, 1] * 255

        for i in range(256):
            x = float(i)
            
            if x <= xs[0]:
                y = ys[0]
            elif x >= xs[-1]:
                y = ys[-1]
            else:
                idx = np.searchsorted(xs, x) - 1
                idx = np.clip(idx, 0, len(xs) - 2)

                x0, x1 = xs[idx], xs[idx + 1]
                y0, y1 = ys[idx], ys[idx + 1]

                t = (x - x0) / (x1 - x0) if x1 != x0 else 0

                if interpolation == "linear" or len(points) < 4:
                    y = y0 + t * (y1 - y0)
                else:
                    p0 = ys[max(idx - 1, 0)]
                    p1 = y0
                    p2 = y1
                    p3 = ys[min(idx + 2, len(ys) - 1)]
                    y = self.catmull_rom(t, p0, p1, p2, p3)

            if strength != 1.0:
                y_norm = y / 255.0
                y_norm = np.power(y_norm, 1.0 / strength)
                y = y_norm * 255.0
            
            if gamma_correction != 1.0:
                y_norm = y / 255.0
                y_norm = np.power(y_norm, gamma_correction)
                y = y_norm * 255.0

            lut[i] = np.clip(y, 0, 255)

        # Appliquer un lissage supplémentaire sur la LUT finale si demandé
        if curve_smoothing:
            lut = self.apply_curve_smoothing_filter(lut.astype(np.uint8), smoothing_strength * 0.5)
        
        return lut.astype(np.uint8)

    def catmull_rom(self, t, p0, p1, p2, p3):
        """Interpolation Catmull-Rom"""
        t2 = t * t
        t3 = t2 * t
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        )

    def apply_multi_channel_curves(self, image, lut_rgb, lut_red, lut_green, lut_blue, preserve_luminosity):
        """Applique les courbes sur chaque canal séparément puis globalement"""
        result = image.copy()
        
        # Étape 1 : Appliquer les courbes individuelles par canal
        if not np.array_equal(lut_red, np.arange(256)):
            result[:, :, 0] = lut_red[result[:, :, 0]]
        
        if not np.array_equal(lut_green, np.arange(256)):
            result[:, :, 1] = lut_green[result[:, :, 1]]
        
        if not np.array_equal(lut_blue, np.arange(256)):
            result[:, :, 2] = lut_blue[result[:, :, 2]]
        
        if not np.array_equal(lut_rgb, np.arange(256)):
            for ch in range(3):
                result[:, :, ch] = lut_rgb[result[:, :, ch]]

        if preserve_luminosity:
            original_hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV).astype(np.float32)
            result_hsv = cv2.cvtColor(result, cv2.COLOR_RGB2HSV).astype(np.float32)
            result_hsv[:, :, 2] = original_hsv[:, :, 2]
            result = cv2.cvtColor(result_hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)

        return result

    def apply_blend_mode(self, base, overlay, mode, opacity):
        """Applique un mode de fusion"""
        base_f = base.astype(np.float32) / 255.0
        overlay_f = overlay.astype(np.float32) / 255.0
        
        if mode == "multiply":
            result = base_f * overlay_f
        elif mode == "screen":
            result = 1 - (1 - base_f) * (1 - overlay_f)
        elif mode == "overlay":
            mask = base_f < 0.5
            result = np.where(mask, 2 * base_f * overlay_f, 1 - 2 * (1 - base_f) * (1 - overlay_f))
        elif mode == "soft_light":
            result = np.where(overlay_f < 0.5,
                            base_f - (1 - 2 * overlay_f) * base_f * (1 - base_f),
                            base_f + (2 * overlay_f - 1) * (np.sqrt(base_f) - base_f))
        else:
            result = overlay_f
        
        final_result = base_f * (1 - opacity) + result * opacity
        return (np.clip(final_result * 255, 0, 255)).astype(np.uint8)

    def get_preset_points(self, preset_name):
        """Retourne les points prédéfinis"""
        presets = {
            "Linear": [(0,0), (1,1)],
            "Contrast+": [(0,0), (0.25,0.18), (0.5,0.5), (0.75,0.82), (1,1)],
            "Contrast-": [(0,0), (0.25,0.32), (0.5,0.5), (0.75,0.68), (1,1)],
            "Negative": [(0,1), (1,0)],
            "S-Curve": [(0,0), (0.25,0.12), (0.5,0.5), (0.75,0.88), (1,1)],
            "Inverse S": [(0,0), (0.25,0.38), (0.5,0.5), (0.75,0.62), (1,1)],
            "Bright Shadows": [(0,0.12), (0.25,0.35), (0.5,0.5), (0.75,0.75), (1,1)],
            "Dark Highlights": [(0,0), (0.25,0.25), (0.5,0.5), (0.75,0.65), (1,0.88)],
            "Film Look": [(0,0.06), (0.25,0.31), (0.5,0.56), (0.75,0.81), (1,0.94)],
            "Vintage": [(0,0.03), (0.25,0.28), (0.5,0.53), (0.75,0.78), (1,0.97)],
            "High Key": [(0,0.12), (0.25,0.37), (0.5,0.62), (0.75,0.81), (1,1)],
            "Low Key": [(0,0), (0.25,0.19), (0.5,0.38), (0.75,0.63), (1,0.88)],
            "Dramatic": [(0,0), (0.2,0.05), (0.5,0.5), (0.8,0.95), (1,1)],
            "Soft": [(0,0.05), (0.3,0.35), (0.5,0.5), (0.7,0.65), (1,0.95)],
            "Cinematic": [(0,0.02), (0.2,0.18), (0.5,0.5), (0.8,0.82), (1,0.98)],
            "Cross Process": [(0,0.1), (0.25,0.2), (0.5,0.6), (0.75,0.9), (1,0.9)],
            "Bleach Bypass": [(0,0), (0.3,0.4), (0.5,0.5), (0.7,0.6), (1,1)],
            "Teal Orange": [(0,0.05), (0.25,0.25), (0.5,0.55), (0.75,0.8), (1,0.95)],
        }
        
        return np.array(presets.get(preset_name, [(0,0), (1,1)]))

    def preserve_tones(self, original, processed, preserve_shadows, preserve_highlights):
        """Préserve les ombres et/ou hautes lumières"""
        if not preserve_shadows and not preserve_highlights:
            return processed
            
        luma_orig = cv2.cvtColor(original, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
        result = processed.copy()
        
        if preserve_shadows:
            shadow_mask = (luma_orig < 0.3).astype(np.float32)
            shadow_mask = cv2.GaussianBlur(shadow_mask, (21, 21), 0)
            
            for ch in range(3):
                result[:, :, ch] = (processed[:, :, ch] * (1 - shadow_mask) + 
                                  original[:, :, ch] * shadow_mask)
        
        if preserve_highlights:
            highlight_mask = (luma_orig > 0.7).astype(np.float32)
            highlight_mask = cv2.GaussianBlur(highlight_mask, (21, 21), 0)
            
            for ch in range(3):
                result[:, :, ch] = (result[:, :, ch] * (1 - highlight_mask) + 
                                  original[:, :, ch] * highlight_mask)
        
        return result.astype(np.uint8)

    def export_preset_user(self, settings, folder_path, name):
        """Exporte tous les réglages du node"""
        try:
            folder = Path(folder_path)
            folder.mkdir(parents=True, exist_ok=True)
            
            file_path = folder / f'{name}.json'
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(settings, f, indent=4)
            
            print(f"Preset exporté vers: {file_path}")
            return str(file_path)
        except Exception as e:
            print(f"Erreur export preset: {e}")
            return None

    def list_preset_files(self, folder_path):
        """Liste les fichiers JSON dans un dossier"""
        try:
            folder = Path(folder_path)
            if not folder.exists() or not folder.is_dir():
                return ["None"]
            files = [f.stem for f in folder.glob('*.json')]
            return ["None"] + files if files else ["None"]
        except Exception as e:
            print(f"Erreur liste presets: {e}")
            return ["None"]

    def load_preset_user(self, folder_path, file_name):
        """Charge un preset utilisateur"""
        try:
            file_path = Path(folder_path) / f'{file_name}.json'
            if not file_path.exists():
                return None
            
            with open(file_path, 'r', encoding='utf-8') as f:
                settings = json.load(f)
            
            print(f"Preset chargé depuis: {file_path}")
            return settings
        except Exception as e:
            print(f"Erreur chargement preset: {e}")
            return None
