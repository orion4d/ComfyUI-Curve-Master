import numpy as np
import torch
import cv2
import os
import json
from pathlib import Path
from scipy.interpolate import griddata
from scipy.spatial import cKDTree
import time

class LUTGeneratorNode:
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image_before": ("IMAGE",),
                "image_after": ("IMAGE",),
                "lut_size": ("INT", {"default": 17, "min": 9, "max": 65, "step": 2}),
                "sample_count": ("INT", {"default": 5000, "min": 1000, "max": 50000, "step": 1000}),
                "processing_scale": ("FLOAT", {"default": 0.5, "min": 0.1, "max": 1.0, "step": 0.1}),
                "interpolation_method": (["linear", "nearest", "cubic"], {"default": "linear"}),
                "smoothing_factor": ("FLOAT", {"default": 0.1, "min": 0.0, "max": 1.0, "step": 0.1}),
                "export_format": (["cube", "3dl", "csp"], {"default": "cube"}),
                "export_path": ("STRING", {"default": "./luts/generated", "multiline": False}),
                "lut_name": ("STRING", {"default": "generated_lut", "multiline": False}),
            }
        }

    RETURN_TYPES = ("IMAGE", "STRING")
    RETURN_NAMES = ("preview_image", "lut_path")
    FUNCTION = "generate_lut"
    CATEGORY = "Curve Master"

    def generate_lut(self, image_before, image_after, lut_size, sample_count, processing_scale, 
                    interpolation_method, smoothing_factor, export_format, export_path, lut_name):
        
        print(f"🔧 Starting LUT generation: {lut_size}³ with {sample_count} samples")
        start_time = time.time()
        
        # Validation des images
        if image_before.shape != image_after.shape:
            raise ValueError("Images must have the same dimensions")
        
        # Gestion des dimensions du tensor
        if len(image_before.shape) == 4:
            img_before = image_before[0].cpu().numpy()
            img_after = image_after[0].cpu().numpy()
        else:
            img_before = image_before.cpu().numpy()
            img_after = image_after.cpu().numpy()
        
        # Redimensionnement pour optimiser les performances
        if processing_scale < 1.0:
            h, w = img_before.shape[:2]
            new_h, new_w = int(h * processing_scale), int(w * processing_scale)
            img_before = cv2.resize(img_before, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
            img_after = cv2.resize(img_after, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
            print(f"📏 Images resized to {new_w}x{new_h} for processing")
        
        # Génération optimisée de la LUT
        lut_3d = self._generate_lut_optimized(img_before, img_after, lut_size, sample_count, 
                                            interpolation_method, smoothing_factor)
        
        # Export de la LUT
        lut_file_path = self._export_lut(lut_3d, export_format, export_path, lut_name, lut_size)
        
        # Génération de l'image de prévisualisation
        preview_image = self._generate_preview(lut_3d, lut_size)
        
        elapsed_time = time.time() - start_time
        print(f"✅ LUT generation completed in {elapsed_time:.2f} seconds")
        print(f"📁 LUT saved to: {lut_file_path}")
        
        return (preview_image, lut_file_path)

    def _generate_lut_optimized(self, img_before, img_after, lut_size, sample_count, 
                               interpolation_method, smoothing_factor):
        """Génération optimisée de LUT avec échantillonnage intelligent"""
        
        print("🔄 Sampling pixels...")
        
        # Échantillonnage intelligent des pixels
        h, w = img_before.shape[:2]
        total_pixels = h * w
        
        if sample_count >= total_pixels:
            # Utiliser tous les pixels si l'échantillon est plus grand que l'image
            before_samples = img_before.reshape(-1, 3)
            after_samples = img_after.reshape(-1, 3)
        else:
            # Échantillonnage stratifié pour une meilleure distribution
            indices = self._stratified_sampling(img_before, sample_count)
            before_samples = img_before.reshape(-1, 3)[indices]
            after_samples = img_after.reshape(-1, 3)[indices]
        
        print(f"📊 Using {len(before_samples)} sample points")
        
        # Création de la grille 3D
        print("🏗️ Building 3D LUT grid...")
        coords = np.linspace(0, 1, lut_size)
        r_coords, g_coords, b_coords = np.meshgrid(coords, coords, coords, indexing='ij')
        grid_points = np.column_stack([r_coords.ravel(), g_coords.ravel(), b_coords.ravel()])
        
        # Interpolation optimisée
        print(f"🔄 Interpolating with {interpolation_method} method...")
        lut_flat = self._fast_interpolation(before_samples, after_samples, grid_points, 
                                          interpolation_method, smoothing_factor)
        
        # Reshape en 3D
        lut_3d = lut_flat.reshape(lut_size, lut_size, lut_size, 3)
        
        # Validation et nettoyage
        lut_3d = np.clip(lut_3d, 0, 1)
        
        return lut_3d

    def _stratified_sampling(self, image, sample_count):
        """Échantillonnage stratifié pour une meilleure distribution des couleurs"""
        h, w = image.shape[:2]
        total_pixels = h * w
        
        # Diviser l'image en régions
        grid_size = int(np.sqrt(sample_count / 10))  # Environ 10 échantillons par région
        step_h = max(1, h // grid_size)
        step_w = max(1, w // grid_size)
        
        indices = []
        samples_per_region = sample_count // (grid_size * grid_size)
        
        for i in range(0, h, step_h):
            for j in range(0, w, step_w):
                # Région actuelle
                region_h = min(step_h, h - i)
                region_w = min(step_w, w - j)
                
                # Échantillonnage aléatoire dans cette région
                region_indices = []
                for _ in range(min(samples_per_region, region_h * region_w)):
                    rand_i = np.random.randint(i, min(i + region_h, h))
                    rand_j = np.random.randint(j, min(j + region_w, w))
                    region_indices.append(rand_i * w + rand_j)
                
                indices.extend(region_indices)
        
        # Compléter avec échantillonnage aléatoire si nécessaire
        while len(indices) < sample_count:
            indices.append(np.random.randint(0, total_pixels))
        
        return np.array(indices[:sample_count])

    def _fast_interpolation(self, source_points, target_points, grid_points, method, smoothing):
        """Interpolation rapide avec optimisations"""
        
        # Supprimer les doublons pour améliorer les performances
        unique_indices = self._remove_duplicates(source_points)
        source_unique = source_points[unique_indices]
        target_unique = target_points[unique_indices]
        
        print(f"📊 Unique points: {len(source_unique)} / {len(source_points)}")
        
        try:
            if method == "linear":
                # Interpolation linéaire avec scipy
                result = griddata(source_unique, target_unique, grid_points, 
                                method='linear', fill_value=0, rescale=True)
            elif method == "nearest":
                # Plus rapide pour de gros datasets
                result = griddata(source_unique, target_unique, grid_points, 
                                method='nearest', rescale=True)
            elif method == "cubic":
                # Plus lent mais plus lisse
                result = griddata(source_unique, target_unique, grid_points, 
                                method='cubic', fill_value=0, rescale=True)
            
            # Gérer les valeurs NaN
            nan_mask = np.isnan(result).any(axis=1)
            if np.any(nan_mask):
                print(f"⚠️ Filling {np.sum(nan_mask)} NaN values")
                # Remplir avec interpolation nearest pour les valeurs manquantes
                result[nan_mask] = griddata(source_unique, target_unique, 
                                          grid_points[nan_mask], method='nearest', rescale=True)
            
            # Lissage optionnel
            if smoothing > 0:
                result = self._apply_smoothing(result, grid_points, smoothing)
            
            return result
            
        except Exception as e:
            print(f"❌ Interpolation error: {e}")
            # Fallback: interpolation nearest
            return griddata(source_unique, target_unique, grid_points, 
                          method='nearest', rescale=True)

    def _remove_duplicates(self, points, tolerance=1e-6):
        """Supprime les points dupliqués pour améliorer les performances"""
        if len(points) < 1000:
            return np.arange(len(points))  # Pas de nettoyage pour les petits datasets
        
        # Utiliser un arbre KD pour trouver les doublons rapidement
        tree = cKDTree(points)
        unique_indices = []
        used = set()
        
        for i, point in enumerate(points):
            if i not in used:
                # Trouver tous les points proches
                neighbors = tree.query_ball_point(point, tolerance)
                unique_indices.append(i)
                used.update(neighbors)
        
        return np.array(unique_indices)

    def _apply_smoothing(self, lut_values, grid_points, smoothing_factor):
        """Applique un lissage spatial à la LUT"""
        if smoothing_factor <= 0:
            return lut_values
        
        # Lissage gaussien 3D simple
        from scipy.ndimage import gaussian_filter
        
        # Reshape temporairement pour le lissage
        lut_size = int(round(len(grid_points) ** (1/3)))
        lut_3d = lut_values.reshape(lut_size, lut_size, lut_size, 3)
        
        # Appliquer le lissage sur chaque canal
        sigma = smoothing_factor * 2
        for c in range(3):
            lut_3d[:, :, :, c] = gaussian_filter(lut_3d[:, :, :, c], sigma=sigma)
        
        return lut_3d.reshape(-1, 3)

    def _export_lut(self, lut_3d, format_type, export_path, lut_name, lut_size):
        """Exporte la LUT dans le format spécifié"""
        
        # Créer le dossier d'export
        export_dir = Path(export_path)
        export_dir.mkdir(parents=True, exist_ok=True)
        
        # Nom du fichier avec extension
        file_extension = {"cube": ".cube", "3dl": ".3dl", "csp": ".csp"}
        file_path = export_dir / f"{lut_name}{file_extension[format_type]}"
        
        if format_type == "cube":
            self._export_cube_format(lut_3d, file_path, lut_size)
        elif format_type == "3dl":
            self._export_3dl_format(lut_3d, file_path, lut_size)
        elif format_type == "csp":
            self._export_csp_format(lut_3d, file_path, lut_size)
        
        return str(file_path)

    def _export_cube_format(self, lut_3d, file_path, lut_size):
        """Export au format .cube (Adobe)"""
        with open(file_path, 'w') as f:
            f.write(f"# Generated by ComfyUI Curve Master\n")
            f.write(f"# LUT size: {lut_size}x{lut_size}x{lut_size}\n")
            f.write(f"LUT_3D_SIZE {lut_size}\n")
            f.write(f"DOMAIN_MIN 0.0 0.0 0.0\n")
            f.write(f"DOMAIN_MAX 1.0 1.0 1.0\n\n")
            
            for b in range(lut_size):
                for g in range(lut_size):
                    for r in range(lut_size):
                        rgb = lut_3d[r, g, b]
                        f.write(f"{rgb[0]:.6f} {rgb[1]:.6f} {rgb[2]:.6f}\n")

    def _export_3dl_format(self, lut_3d, file_path, lut_size):
        """Export au format .3dl (Autodesk)"""
        with open(file_path, 'w') as f:
            for b in range(lut_size):
                for g in range(lut_size):
                    for r in range(lut_size):
                        rgb = lut_3d[r, g, b] * 4095  # 12-bit
                        f.write(f"{int(rgb[0])} {int(rgb[1])} {int(rgb[2])}\n")

    def _export_csp_format(self, lut_3d, file_path, lut_size):
        """Export au format .csp (Rising Sun Research)"""
        with open(file_path, 'w') as f:
            f.write(f"CSPLUTV100\n")
            f.write(f"3D\n")
            f.write(f"{lut_size}\n")
            
            for r in range(lut_size):
                for g in range(lut_size):
                    for b in range(lut_size):
                        rgb = lut_3d[r, g, b]
                        f.write(f"{rgb[0]:.6f} {rgb[1]:.6f} {rgb[2]:.6f}\n")

    def _generate_preview(self, lut_3d, lut_size):
        """Génère une image de prévisualisation de la LUT"""
        
        # Créer une image de test avec dégradés
        preview_size = 256
        preview = np.zeros((preview_size, preview_size, 3), dtype=np.float32)
        
        # Dégradé horizontal (R), vertical (G), diagonal (B)
        for y in range(preview_size):
            for x in range(preview_size):
                preview[y, x, 0] = x / (preview_size - 1)  # Rouge
                preview[y, x, 1] = y / (preview_size - 1)  # Vert
                preview[y, x, 2] = (x + y) / (2 * (preview_size - 1))  # Bleu
        
        # Appliquer la LUT à l'image de prévisualisation
        preview_transformed = self._apply_lut_to_image(preview, lut_3d, lut_size)
        
        # Convertir en tensor pour ComfyUI
        preview_tensor = torch.from_numpy(preview_transformed).unsqueeze(0)
        
        return preview_tensor

    def _apply_lut_to_image(self, image, lut_3d, lut_size):
        """Applique la LUT 3D à une image"""
        
        h, w = image.shape[:2]
        flat_image = image.reshape(-1, 3)
        
        # Conversion des coordonnées RGB en indices de LUT
        indices = flat_image * (lut_size - 1)
        
        # Interpolation trilinéaire
        result = np.zeros_like(flat_image)
        
        for i, rgb in enumerate(indices):
            # Indices entiers et fractions
            r0, g0, b0 = np.floor(rgb).astype(int)
            r1, g1, b1 = np.ceil(rgb).astype(int)
            
            # Contraindre les indices
            r0, g0, b0 = np.clip([r0, g0, b0], 0, lut_size - 1)
            r1, g1, b1 = np.clip([r1, g1, b1], 0, lut_size - 1)
            
            # Fractions pour l'interpolation
            fr, fg, fb = rgb - np.floor(rgb)
            
            # Interpolation trilinéaire
            c000 = lut_3d[r0, g0, b0]
            c001 = lut_3d[r0, g0, b1]
            c010 = lut_3d[r0, g1, b0]
            c011 = lut_3d[r0, g1, b1]
            c100 = lut_3d[r1, g0, b0]
            c101 = lut_3d[r1, g0, b1]
            c110 = lut_3d[r1, g1, b0]
            c111 = lut_3d[r1, g1, b1]
            
            # Interpolation en 3 étapes
            c00 = c000 * (1 - fb) + c001 * fb
            c01 = c010 * (1 - fb) + c011 * fb
            c10 = c100 * (1 - fb) + c101 * fb
            c11 = c110 * (1 - fb) + c111 * fb
            
            c0 = c00 * (1 - fg) + c01 * fg
            c1 = c10 * (1 - fg) + c11 * fg
            
            result[i] = c0 * (1 - fr) + c1 * fr
        
        return result.reshape(h, w, 3)
