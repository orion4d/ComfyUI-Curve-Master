"""
Curve Mathematics for ComfyUI-Curve_Master
Advanced mathematical operations for curve manipulation
"""

import numpy as np
from scipy import interpolate
from scipy.optimize import minimize_scalar
import math

class CurveMath:
    """Mathematical operations for curve processing"""
    
    @staticmethod
    def catmull_rom_spline(points, num_samples=256):
        """
        Generate Catmull-Rom spline interpolation
        Args:
            points: List of (x, y) control points
            num_samples: Number of output samples
        Returns:
            numpy array of interpolated curve values
        """
        if len(points) < 2:
            return np.linspace(0, 1, num_samples)
        
        # Convert to numpy arrays
        points = np.array(points)
        x_vals = points[:, 0]
        y_vals = points[:, 1]
        
        # Create output array
        curve = np.zeros(num_samples)
        
        for i in range(num_samples):
            t = i / (num_samples - 1)
            
            # Find segment
            segment_idx = 0
            for j in range(len(x_vals) - 1):
                if t >= x_vals[j] and t <= x_vals[j + 1]:
                    segment_idx = j
                    break
            
            if len(points) < 4:
                # Linear interpolation for less than 4 points
                if segment_idx < len(x_vals) - 1:
                    local_t = (t - x_vals[segment_idx]) / (x_vals[segment_idx + 1] - x_vals[segment_idx])
                    curve[i] = y_vals[segment_idx] + local_t * (y_vals[segment_idx + 1] - y_vals[segment_idx])
                else:
                    curve[i] = y_vals[-1]
            else:
                # Catmull-Rom interpolation
                p0_idx = max(0, segment_idx - 1)
                p1_idx = segment_idx
                p2_idx = min(len(y_vals) - 1, segment_idx + 1)
                p3_idx = min(len(y_vals) - 1, segment_idx + 2)
                
                p0 = y_vals[p0_idx]
                p1 = y_vals[p1_idx]
                p2 = y_vals[p2_idx]
                p3 = y_vals[p3_idx]
                
                if p1_idx < len(x_vals) - 1:
                    local_t = (t - x_vals[p1_idx]) / (x_vals[p2_idx] - x_vals[p1_idx])
                else:
                    local_t = 0
                
                curve[i] = CurveMath._catmull_rom_interpolate(local_t, p0, p1, p2, p3)
        
        return np.clip(curve, 0, 1)
    
    @staticmethod
    def _catmull_rom_interpolate(t, p0, p1, p2, p3):
        """Catmull-Rom interpolation between 4 points"""
        t2 = t * t
        t3 = t2 * t
        
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        )
    
    @staticmethod
    def bezier_curve(control_points, num_samples=256):
        """
        Generate Bézier curve from control points
        Args:
            control_points: List of (x, y) control points
            num_samples: Number of output samples
        Returns:
            numpy array of interpolated curve values
        """
        n = len(control_points) - 1
        curve = np.zeros(num_samples)
        
        for i in range(num_samples):
            t = i / (num_samples - 1)
            x = 0
            y = 0
            
            for j, (px, py) in enumerate(control_points):
                # Bernstein polynomial
                coeff = CurveMath._binomial_coefficient(n, j) * (t ** j) * ((1 - t) ** (n - j))
                x += coeff * px
                y += coeff * py
            
            # Map x back to index and store y
            if i == 0:
                curve[i] = control_points[0][1]
            elif i == num_samples - 1:
                curve[i] = control_points[-1][1]
            else:
                # Find corresponding curve value
                curve[i] = y
        
        return np.clip(curve, 0, 1)
    
    @staticmethod
    def _binomial_coefficient(n, k):
        """Calculate binomial coefficient"""
        if k > n - k:
            k = n - k
        result = 1
        for i in range(k):
            result = result * (n - i) // (i + 1)
        return result
    
    @staticmethod
    def cubic_spline(points, num_samples=256):
        """
        Generate cubic spline interpolation
        Args:
            points: List of (x, y) control points
            num_samples: Number of output samples
        Returns:
            numpy array of interpolated curve values
        """
        if len(points) < 2:
            return np.linspace(0, 1, num_samples)
        
        points = np.array(points)
        x_vals = points[:, 0]
        y_vals = points[:, 1]
        
        # Create cubic spline
        cs = interpolate.CubicSpline(x_vals, y_vals, bc_type='natural')
        
        # Generate samples
        x_new = np.linspace(0, 1, num_samples)
        curve = cs(x_new)
        
        return np.clip(curve, 0, 1)
    
    @staticmethod
    def smooth_curve(curve, sigma=1.0):
        """
        Apply Gaussian smoothing to curve
        Args:
            curve: Input curve array
            sigma: Smoothing strength
        Returns:
            Smoothed curve array
        """
        from scipy.ndimage import gaussian_filter1d
        return gaussian_filter1d(curve.astype(np.float64), sigma=sigma)
    
    @staticmethod
    def curve_derivative(curve):
        """
        Calculate first derivative of curve
        Args:
            curve: Input curve array
        Returns:
            Derivative array
        """
        return np.gradient(curve)
    
    @staticmethod
    def curve_curvature(curve):
        """
        Calculate curvature of curve
        Args:
            curve: Input curve array
        Returns:
            Curvature array
        """
        dy = np.gradient(curve)
        d2y = np.gradient(dy)
        
        # Curvature formula: |d2y/dx2| / (1 + (dy/dx)^2)^(3/2)
        curvature = np.abs(d2y) / np.power(1 + dy**2, 1.5)
        return curvature
    
    @staticmethod
    def find_curve_extrema(curve):
        """
        Find local minima and maxima in curve
        Args:
            curve: Input curve array
        Returns:
            Dictionary with 'minima' and 'maxima' indices
        """
        from scipy.signal import find_peaks
        
        # Find maxima
        maxima, _ = find_peaks(curve)
        
        # Find minima (peaks in inverted curve)
        minima, _ = find_peaks(-curve)
        
        return {
            'minima': minima,
            'maxima': maxima
        }
    
    @staticmethod
    def curve_area_under(curve):
        """
        Calculate area under curve using trapezoidal rule
        Args:
            curve: Input curve array
        Returns:
            Area value
        """
        return np.trapz(curve)
    
    @staticmethod
    def normalize_curve(curve, target_range=(0, 1)):
        """
        Normalize curve to target range
        Args:
            curve: Input curve array
            target_range: Tuple of (min, max) target values
        Returns:
            Normalized curve array
        """
        curve_min = np.min(curve)
        curve_max = np.max(curve)
        
        if curve_max == curve_min:
            return np.full_like(curve, target_range[0])
        
        # Normalize to 0-1
        normalized = (curve - curve_min) / (curve_max - curve_min)
        
        # Scale to target range
        target_min, target_max = target_range
        return normalized * (target_max - target_min) + target_min
    
    @staticmethod
    def apply_gamma_correction(curve, gamma):
        """
        Apply gamma correction to curve
        Args:
            curve: Input curve array
            gamma: Gamma value
        Returns:
            Gamma-corrected curve array
        """
        return np.power(curve, gamma)
    
    @staticmethod
    def curve_histogram_equalization(curve, num_bins=256):
        """
        Apply histogram equalization to curve
        Args:
            curve: Input curve array
            num_bins: Number of histogram bins
        Returns:
            Equalized curve array
        """
        # Calculate histogram
        hist, bins = np.histogram(curve, bins=num_bins, range=(0, 1))
        
        # Calculate cumulative distribution function
        cdf = hist.cumsum()
        cdf_normalized = cdf / cdf[-1]
        
        # Apply equalization
        equalized = np.interp(curve, bins[:-1], cdf_normalized)
        
        return equalized
    
    @staticmethod
    def fit_curve_to_points(points, curve_type='catmull_rom', num_samples=256):
        """
        Fit different curve types to control points
        Args:
            points: List of (x, y) control points
            curve_type: Type of curve ('catmull_rom', 'bezier', 'cubic_spline')
            num_samples: Number of output samples
        Returns:
            Fitted curve array
        """
        if curve_type == 'catmull_rom':
            return CurveMath.catmull_rom_spline(points, num_samples)
        elif curve_type == 'bezier':
            return CurveMath.bezier_curve(points, num_samples)
        elif curve_type == 'cubic_spline':
            return CurveMath.cubic_spline(points, num_samples)
        else:
            raise ValueError(f"Unknown curve type: {curve_type}")
    
    @staticmethod
    def curve_distance(curve1, curve2):
        """
        Calculate distance between two curves
        Args:
            curve1, curve2: Input curve arrays
        Returns:
            Distance value (RMS difference)
        """
        if len(curve1) != len(curve2):
            # Resample to same length
            x = np.linspace(0, 1, len(curve1))
            curve2 = np.interp(x, np.linspace(0, 1, len(curve2)), curve2)
        
        return np.sqrt(np.mean((curve1 - curve2) ** 2))
    
    @staticmethod
    def optimize_curve_fit(target_curve, control_points_count=5, curve_type='catmull_rom'):
        """
        Optimize control points to best fit target curve
        Args:
            target_curve: Target curve to fit
            control_points_count: Number of control points to optimize
            curve_type: Type of curve to fit
        Returns:
            Optimized control points
        """
        def objective(params):
            # Reshape params to control points
            points = []
            for i in range(control_points_count):
                x = i / (control_points_count - 1)
                y = np.clip(params[i], 0, 1)
                points.append((x, y))
            
            # Generate curve
            fitted_curve = CurveMath.fit_curve_to_points(points, curve_type, len(target_curve))
            
            # Calculate error
            return CurveMath.curve_distance(target_curve, fitted_curve)
        
        # Initial guess (linear)
        initial_params = np.linspace(0, 1, control_points_count)
        
        # Optimize
        from scipy.optimize import minimize
        result = minimize(objective, initial_params, method='L-BFGS-B', 
                         bounds=[(0, 1)] * control_points_count)
        
        # Convert back to control points
        optimized_points = []
        for i in range(control_points_count):
            x = i / (control_points_count - 1)
            y = np.clip(result.x[i], 0, 1)
            optimized_points.append((x, y))
        
        return optimized_points
