import numpy as np
import torch
import cv2
import os
from pathlib import Path

class LUTManagerNode:
    @classmethod
    def INPUT_TYPES(cls):
        # Charger dynamiquement les presets disponibles
        presets_path = Path(__file__).parent.parent / "presets" / "luts"
        available_presets = ["None"]
        
        if presets_path.exists():
            for file in presets_path.glob("*.cube"):
                available_presets.append(file.stem)
        
        return {
            "required": {
                "image": ("IMAGE",),
                "path_lut_file": ("STRING", {"default": "", "multiline": False}),
                "lut_preset": (available_presets, {"default": "None"}),
                "intensity": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1}),
                "interpolation": (["trilinear", "tetrahedral"], {"default": "trilinear"}),
                "data_order": (["RGB", "BGR"], {"default": "BGR"}),
                "table_order": (["RGB", "BGR"], {"default": "BGR"}),
            },
            "optional": {
                "opacity": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 1.0, "step": 0.05}),
            }
        }

    RETURN_TYPES = ("IMAGE", "STRING")
    RETURN_NAMES = ("image", "lut_info")
    FUNCTION = "apply_lut"
    CATEGORY = "Curve Master"

    def __init__(self):
        self.lut_cache = {}
        self.preset_luts = {}
        self.load_presets()

    def load_presets(self):
        """Charger les fichiers LUT dans presets/luts"""
        self.presets_path = Path(__file__).parent.parent / "presets" / "luts"
        self.available_presets = {"None": None}
        
        if self.presets_path.exists():
            for file in self.presets_path.glob("*.cube"):
                self.available_presets[file.stem] = str(file)
        else:
            # Créer le dossier s'il n'existe pas
            self.presets_path.mkdir(parents=True, exist_ok=True)

    def apply_lut(self, image, path_lut_file, lut_preset, intensity, interpolation, data_order, table_order, opacity=1.0):
        
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

        # Conversion selon l'ordre des DONNÉES
        if data_order == "BGR":
            img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # Déterminer quelle LUT utiliser
        lut_data = None
        lut_info = ""

        if lut_preset != "None" and lut_preset in self.available_presets:
            # Utiliser un preset depuis presets/luts
            lut_file_path = self.available_presets[lut_preset]
            lut_data = self.load_lut_file(lut_file_path, table_order)
            lut_info = f"Preset: {lut_preset}, Data: {data_order}, Table: {table_order}"
        elif path_lut_file and os.path.exists(path_lut_file):
            # Utiliser un fichier LUT externe
            lut_data = self.load_lut_file(path_lut_file, table_order)
            lut_info = f"File: {os.path.basename(path_lut_file)}, Data: {data_order}, Table: {table_order}"
        else:
            # Pas de LUT, retourner l'image originale
            result_tensor = torch.from_numpy(original_img.astype(np.float32) / 255.0)
            if batch_size > 1:
                result_tensor = result_tensor.unsqueeze(0).repeat(batch_size, 1, 1, 1)
            else:
                result_tensor = result_tensor.unsqueeze(0)
            return (result_tensor, "No LUT applied")

        if lut_data is None:
            # Erreur de chargement
            result_tensor = torch.from_numpy(original_img.astype(np.float32) / 255.0)
            if batch_size > 1:
                result_tensor = result_tensor.unsqueeze(0).repeat(batch_size, 1, 1, 1)
            else:
                result_tensor = result_tensor.unsqueeze(0)
            return (result_tensor, "LUT loading failed")

        # Appliquer la LUT
        result = self.apply_lut_to_image(img_np, lut_data, interpolation, intensity)

        # Reconversion selon l'ordre des DONNÉES
        if data_order == "BGR":
            result = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)

        # Application de l'opacité
        if opacity < 1.0:
            base_f = original_img.astype(np.float32) / 255.0
            overlay_f = result.astype(np.float32) / 255.0
            result_f = base_f * (1 - opacity) + overlay_f * opacity
            result = (np.clip(result_f * 255, 0, 255)).astype(np.uint8)

        # Reconversion en tensor
        result_tensor = torch.from_numpy(result.astype(np.float32) / 255.0)
        if batch_size > 1:
            result_tensor = result_tensor.unsqueeze(0).repeat(batch_size, 1, 1, 1)
        else:
            result_tensor = result_tensor.unsqueeze(0)

        return (result_tensor, lut_info)

    def load_lut_file(self, file_path, table_order):
        """Charge un fichier LUT avec gestion de l'ordre de la table"""
        cache_key = f"{file_path}_{table_order}"
        
        if cache_key in self.lut_cache:
            return self.lut_cache[cache_key]

        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()

            lut_size = 33
            domain_min = [0.0, 0.0, 0.0]
            domain_max = [1.0, 1.0, 1.0]
            lut_data = []

            for line in lines:
                line = line.strip()
                
                if line.startswith('#') or not line:
                    continue
                    
                if line.startswith('LUT_3D_SIZE'):
                    lut_size = int(line.split()[-1])
                    continue
                    
                if line.startswith('DOMAIN_MIN'):
                    domain_min = [float(x) for x in line.split()[1:4]]
                    continue
                elif line.startswith('DOMAIN_MAX'):
                    domain_max = [float(x) for x in line.split()[1:4]]
                    continue
                    
                parts = line.split()
                if len(parts) == 3:
                    try:
                        r, g, b = map(float, parts)
                        
                        # Réorganiser selon l'ordre de la TABLE
                        if table_order == "BGR":
                            lut_data.append([b, g, r])
                        else:
                            lut_data.append([r, g, b])
                            
                    except ValueError:
                        continue

            if len(lut_data) != lut_size ** 3:
                print(f"Taille LUT incorrecte: attendu {lut_size**3}, reçu {len(lut_data)}")
                return None

            lut_array = np.array(lut_data, dtype=np.float32)
            
            # Normaliser le domaine si nécessaire
            if domain_min != [0.0, 0.0, 0.0] or domain_max != [1.0, 1.0, 1.0]:
                for i in range(len(lut_array)):
                    lut_array[i, 0] = (lut_array[i, 0] - domain_min[0]) / (domain_max[0] - domain_min[0])
                    lut_array[i, 1] = (lut_array[i, 1] - domain_min[1]) / (domain_max[1] - domain_min[1])
                    lut_array[i, 2] = (lut_array[i, 2] - domain_min[2]) / (domain_max[2] - domain_min[2])
            
            lut_array = np.clip(lut_array, 0.0, 1.0)
            lut_3d = lut_array.reshape(lut_size, lut_size, lut_size, 3)
            
            self.lut_cache[cache_key] = lut_3d
            return lut_3d

        except Exception as e:
            print(f"Erreur chargement LUT {file_path}: {e}")
            return None

    def apply_lut_to_image(self, image, lut, interpolation, intensity):
        """Applique une LUT 3D à l'image avec interpolation trilinéaire correcte"""
        h, w, c = image.shape
        result = image.copy().astype(np.float32) / 255.0
        lut_size = lut.shape[0]
        
        result = np.clip(result, 0.0, 1.0)
        
        # Coordonnées LUT
        r_idx = result[:, :, 0] * (lut_size - 1)
        g_idx = result[:, :, 1] * (lut_size - 1)
        b_idx = result[:, :, 2] * (lut_size - 1)
        
        result_rgb = self.trilinear_interpolation_correct(lut, r_idx, g_idx, b_idx)
        result_rgb = np.clip(result_rgb, 0.0, 1.0)
        
        if intensity != 1.0:
            original = result
            result_rgb = original * (1 - intensity) + result_rgb * intensity
        
        return (np.clip(result_rgb * 255, 0, 255)).astype(np.uint8)

    def trilinear_interpolation_correct(self, lut, r_idx, g_idx, b_idx):
        """Interpolation trilinéaire correcte et complète"""
        lut_size = lut.shape[0]
        
        r0 = np.floor(r_idx).astype(int)
        g0 = np.floor(g_idx).astype(int)
        b0 = np.floor(b_idx).astype(int)
        
        r1 = np.minimum(r0 + 1, lut_size - 1)
        g1 = np.minimum(g0 + 1, lut_size - 1)
        b1 = np.minimum(b0 + 1, lut_size - 1)
        
        dr = r_idx - r0
        dg = g_idx - g0
        db = b_idx - b0
        
        c000 = lut[r0, g0, b0]
        c001 = lut[r0, g0, b1]
        c010 = lut[r0, g1, b0]
        c011 = lut[r0, g1, b1]
        c100 = lut[r1, g0, b0]
        c101 = lut[r1, g0, b1]
        c110 = lut[r1, g1, b0]
        c111 = lut[r1, g1, b1]
        
        dr = dr[..., np.newaxis]
        dg = dg[..., np.newaxis]
        db = db[..., np.newaxis]
        
        c00 = c000 * (1 - dr) + c100 * dr
        c01 = c001 * (1 - dr) + c101 * dr
        c10 = c010 * (1 - dr) + c110 * dr
        c11 = c011 * (1 - dr) + c111 * dr
        
        c0 = c00 * (1 - dg) + c10 * dg
        c1 = c01 * (1 - dg) + c11 * dg
        
        result = c0 * (1 - db) + c1 * db
        
        return result
