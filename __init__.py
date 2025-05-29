"""
ComfyUI Curve Master - Professional curve and LUT editor
"""

from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

# IMPORTANT : Déclarer le répertoire web pour l'interface graphique
WEB_DIRECTORY = "./web"

__version__ = "1.0.0"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY", "__version__"]

print(f"[Curve Master] Package v{__version__} loaded with {len(NODE_CLASS_MAPPINGS)} nodes")
print(f"[Curve Master] Web interface directory: {WEB_DIRECTORY}")
