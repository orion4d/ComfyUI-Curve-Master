from .curve_master_node import CurveMasterNode
from .lut_manager_node import LUTManagerNode
from .lut_generator_node import LUTGeneratorNode

NODE_CLASS_MAPPINGS = {
    "CurveMasterNode": CurveMasterNode,
    "LUTManagerNode": LUTManagerNode,
    "LUTGeneratorNode": LUTGeneratorNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "CurveMasterNode": "🎨 Curve Master",
    "LUTManagerNode": "📊 LUT Manager", 
    "LUTGeneratorNode": "🔧 LUT Generator",
}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]
