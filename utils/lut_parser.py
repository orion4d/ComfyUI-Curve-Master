"""
LUT Parser for ComfyUI-Curve_Master
Support for various LUT formats (.cube, .3dl, .csp, etc.)
"""

import numpy as np
import os
import re
from pathlib import Path

class LUTParser:
    """Parser for various LUT file formats"""
    
    SUPPORTED_FORMATS = ['.cube', '.3dl', '.csp', '.lut', '.mga']
    
    @staticmethod
    def parse_file(file_path):
        """
        Parse LUT file based on extension
        Args:
            file_path: Path to LUT file
        Returns:
            Dictionary with LUT data and metadata
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"LUT file not found: {file_path}")
        
        extension = file_path.suffix.lower()
        
        if extension == '.cube':
            return LUTParser.parse_cube_file(file_path)
        elif extension == '.3dl':
            return LUTParser.parse_3dl_file(file_path)
        elif extension == '.csp':
            return LUTParser.parse_csp_file(file_path)
        elif extension == '.lut':
            return LUTParser.parse_lut_file(file_path)
        elif extension == '.mga':
            return LUTParser.parse_mga_file(file_path)
        else:
            raise ValueError(f"Unsupported LUT format: {extension}")
    
    @staticmethod
    def parse_cube_file(file_path):
        """
        Parse Adobe .cube LUT file
        Args:
            file_path: Path to .cube file
        Returns:
            Dictionary with LUT data and metadata
        """
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        lut_size = 33  # Default
        domain_min = [0.0, 0.0, 0.0]
        domain_max = [1.0, 1.0, 1.0]
        title = ""
        lut_data = []
        
        for line in lines:
            line = line.strip()
            
            # Skip comments and empty lines
            if line.startswith('#') or not line:
                continue
            
            # Parse metadata
            if line.startswith('TITLE'):
                title = line.split('"')[1] if '"' in line else line.split()[1]
            elif line.startswith('LUT_3D_SIZE'):
                lut_size = int(line.split()[-1])
            elif line.startswith('DOMAIN_MIN'):
                domain_min = [float(x) for x in line.split()[1:4]]
            elif line.startswith('DOMAIN_MAX'):
                domain_max = [float(x) for x in line.split()[1:4]]
            else:
                # Parse RGB data
                parts = line.split()
                if len(parts) == 3:
                    try:
                        r, g, b = map(float, parts)
                        lut_data.append([r, g, b])
                    except ValueError:
                        continue
        
        # Validate data size
        expected_size = lut_size ** 3
        if len(lut_data) != expected_size:
            raise ValueError(f"Invalid LUT data size: expected {expected_size}, got {len(lut_data)}")
        
        # Reshape to 3D array
        lut_array = np.array(lut_data, dtype=np.float32)
        lut_3d = lut_array.reshape(lut_size, lut_size, lut_size, 3)
        
        return {
            'data': lut_3d,
            'size': lut_size,
            'domain_min': domain_min,
            'domain_max': domain_max,
            'title': title,
            'format': 'cube'
        }
    
    @staticmethod
    def parse_3dl_file(file_path):
        """
        Parse Lustre .3dl LUT file
        Args:
            file_path: Path to .3dl file
        Returns:
            Dictionary with LUT data and metadata
        """
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        lut_data = []
        
        for line in lines:
            line = line.strip()
            
            # Skip comments and empty lines
            if line.startswith('#') or not line:
                continue
            
            # Parse RGB data
            parts = line.split()
            if len(parts) >= 3:
                try:
                    r, g, b = map(float, parts[:3])
                    
                    # Normalize if values are in 0-1023 range
                    if max(r, g, b) > 1.0:
                        r, g, b = r / 1023.0, g / 1023.0, b / 1023.0
                    
                    lut_data.append([r, g, b])
                except ValueError:
                    continue
        
        # Determine LUT size (usually 32x32x32 for .3dl)
        lut_size = round(len(lut_data) ** (1/3))
        expected_size = lut_size ** 3
        
        if len(lut_data) != expected_size:
            # Try common sizes
            for size in [17, 32, 33, 65]:
                if len(lut_data) == size ** 3:
                    lut_size = size
                    break
            else:
                raise ValueError(f"Cannot determine LUT size from {len(lut_data)} data points")
        
        # Reshape to 3D array
        lut_array = np.array(lut_data, dtype=np.float32)
        lut_3d = lut_array.reshape(lut_size, lut_size, lut_size, 3)
        
        return {
            'data': lut_3d,
            'size': lut_size,
            'domain_min': [0.0, 0.0, 0.0],
            'domain_max': [1.0, 1.0, 1.0],
            'title': Path(file_path).stem,
            'format': '3dl'
        }
    
    @staticmethod
    def parse_csp_file(file_path):
        """
        Parse Rising Sun Research .csp LUT file
        Args:
            file_path: Path to .csp file
        Returns:
            Dictionary with LUT data and metadata
        """
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Parse header
        lines = content.split('\n')
        header_end = 0
        
        for i, line in enumerate(lines):
            if line.strip() == 'BEGIN_DATA':
                header_end = i + 1
                break
        
        # Parse data section
        lut_data = []
        for line in lines[header_end:]:
            line = line.strip()
            if line == 'END_DATA' or not line:
                break
            
            parts = line.split()
            if len(parts) >= 3:
                try:
                    r, g, b = map(float, parts[:3])
                    lut_data.append([r, g, b])
                except ValueError:
                    continue
        
        # Determine size
        lut_size = round(len(lut_data) ** (1/3))
        
        # Reshape to 3D array
        lut_array = np.array(lut_data, dtype=np.float32)
        lut_3d = lut_array.reshape(lut_size, lut_size, lut_size, 3)
        
        return {
            'data': lut_3d,
            'size': lut_size,
            'domain_min': [0.0, 0.0, 0.0],
            'domain_max': [1.0, 1.0, 1.0],
            'title': Path(file_path).stem,
            'format': 'csp'
        }
    
    @staticmethod
    def parse_lut_file(file_path):
        """
        Parse generic .lut file (try to auto-detect format)
        Args:
            file_path: Path to .lut file
        Returns:
            Dictionary with LUT data and metadata
        """
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Try to detect format based on content
        if 'LUT_3D_SIZE' in content:
            # Looks like a .cube file
            return LUTParser.parse_cube_file(file_path)
        elif 'BEGIN_DATA' in content:
            # Looks like a .csp file
            return LUTParser.parse_csp_file(file_path)
        else:
            # Try as .3dl format
            return LUTParser.parse_3dl_file(file_path)
    
    @staticmethod
    def parse_mga_file(file_path):
        """
        Parse Pandora .mga LUT file
        Args:
            file_path: Path to .mga file
        Returns:
            Dictionary with LUT data and metadata
        """
        # Simplified .mga parser (binary format would need more complex handling)
        # This is a basic text-based .mga parser
        return LUTParser.parse_3dl_file(file_path)  # Fallback to 3dl parser
    
    @staticmethod
    def write_cube_file(lut_data, file_path, title="Generated LUT", domain_min=None, domain_max=None):
        """
        Write LUT data to .cube file
        Args:
            lut_data: 3D numpy array of LUT data
            file_path: Output file path
            title: LUT title
            domain_min: Domain minimum values
            domain_max: Domain maximum values
        """
        if domain_min is None:
            domain_min = [0.0, 0.0, 0.0]
        if domain_max is None:
            domain_max = [1.0, 1.0, 1.0]
        
        lut_size = lut_data.shape[0]
        
        with open(file_path, 'w') as f:
            # Write header
            f.write(f'# Generated by ComfyUI Curve Master\n')
            f.write(f'TITLE "{title}"\n')
            f.write(f'DOMAIN_MIN {domain_min[0]:.6f} {domain_min[1]:.6f} {domain_min[2]:.6f}\n')
            f.write(f'DOMAIN_MAX {domain_max[0]:.6f} {domain_max[1]:.6f} {domain_max[2]:.6f}\n')
            f.write(f'LUT_3D_SIZE {lut_size}\n\n')
            
            # Write data
            for b in range(lut_size):
                for g in range(lut_size):
                    for r in range(lut_size):
                        rgb = lut_data[r, g, b]
                        f.write(f'{rgb[0]:.6f} {rgb[1]:.6f} {rgb[2]:.6f}\n')
    
    @staticmethod
    def write_3dl_file(lut_data, file_path):
        """
        Write LUT data to .3dl file
        Args:
            lut_data: 3D numpy array of LUT data
            file_path: Output file path
        """
        lut_size = lut_data.shape[0]
        
        with open(file_path, 'w') as f:
            # Write header comment
            f.write('# Generated by ComfyUI Curve Master\n')
            
            # Write data (3dl format uses 0-1023 range)
            for b in range(lut_size):
                for g in range(lut_size):
                    for r in range(lut_size):
                        rgb = lut_data[r, g, b]
                        r_val = int(rgb[0] * 1023)
                        g_val = int(rgb[1] * 1023)
                        b_val = int(rgb[2] * 1023)
                        f.write(f'{r_val} {g_val} {b_val}\n')
    
    @staticmethod
    def convert_lut_format(input_path, output_path, output_format=None):
        """
        Convert LUT from one format to another
        Args:
            input_path: Input LUT file path
            output_path: Output LUT file path
            output_format: Target format ('cube', '3dl', etc.)
        """
        # Parse input LUT
        lut_info = LUTParser.parse_file(input_path)
        
        # Determine output format
        if output_format is None:
            output_format = Path(output_path).suffix.lower()[1:]  # Remove dot
        
        # Write in target format
        if output_format == 'cube':
            LUTParser.write_cube_file(
                lut_info['data'], 
                output_path, 
                lut_info.get('title', 'Converted LUT'),
                lut_info.get('domain_min'),
                lut_info.get('domain_max')
            )
        elif output_format == '3dl':
            LUTParser.write_3dl_file(lut_info['data'], output_path)
        else:
            raise ValueError(f"Unsupported output format: {output_format}")
    
    @staticmethod
    def validate_lut(lut_data):
        """
        Validate LUT data integrity
        Args:
            lut_data: LUT data array
        Returns:
            Dictionary with validation results
        """
        issues = []
        
        # Check shape
        if len(lut_data.shape) != 4 or lut_data.shape[3] != 3:
            issues.append("Invalid LUT shape - should be (size, size, size, 3)")
        
        # Check if cubic
        if lut_data.shape[0] != lut_data.shape[1] or lut_data.shape[1] != lut_data.shape[2]:
            issues.append("LUT is not cubic")
        
        # Check value range
        if np.any(lut_data < 0) or np.any(lut_data > 1):
            issues.append("LUT values outside 0-1 range")
        
        # Check for NaN or infinite values
        if np.any(np.isnan(lut_data)) or np.any(np.isinf(lut_data)):
            issues.append("LUT contains NaN or infinite values")
        
        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'size': lut_data.shape[0] if len(lut_data.shape) >= 3 else 0,
            'total_points': lut_data.size // 3 if len(lut_data.shape) == 4 else 0
        }
