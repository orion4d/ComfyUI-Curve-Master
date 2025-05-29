"""
Utilities for ComfyUI-Curve_Master
Mathematical and parsing utilities for curve and LUT processing
"""

from .curve_math import CurveMath
from .lut_parser import LUTParser
from .interpolation import Interpolation

__all__ = [
    'CurveMath',
    'LUTParser', 
    'Interpolation'
]

__version__ = "1.0.0"
