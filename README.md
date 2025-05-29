<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ComfyUI Curve Master - Documentation Complète</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .nav {
            background: #34495e;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .nav ul {
            list-style: none;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .nav li {
            margin: 0 1rem;
        }
        
        .nav a {
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            transition: background 0.3s;
        }
        
        .nav a:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .content {
            padding: 2rem;
        }
        
        .section {
            margin-bottom: 3rem;
            padding: 1.5rem;
            border-radius: 10px;
            background: #f8f9fa;
            border-left: 5px solid #3498db;
        }
        
        .section h2 {
            color: #2c3e50;
            font-size: 1.8rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }
        
        .section h3 {
            color: #34495e;
            font-size: 1.4rem;
            margin: 1.5rem 0 1rem 0;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 0.5rem;
        }
        
        .emoji {
            font-size: 1.5rem;
            margin-right: 0.5rem;
        }
        
        .node-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1rem 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 5px solid #e74c3c;
        }
        
        .node-card.curve-master {
            border-left-color: #e74c3c;
        }
        
        .node-card.lut-manager {
            border-left-color: #f39c12;
        }
        
        .node-card.lut-generator {
            border-left-color: #27ae60;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        th {
            background: #3498db;
            color: white;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 0.8rem 1rem;
            border-bottom: 1px solid #ecf0f1;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .param-type {
            background: #e8f4f8;
            color: #2980b9;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9rem;
        }
        
        .param-default {
            background: #e8f5e8;
            color: #27ae60;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9rem;
        }
        
        .workflow-box {
            background: #2c3e50;
            color: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1rem 0;
            font-family: monospace;
            overflow-x: auto;
        }
        
        .workflow-step {
            background: #34495e;
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 5px;
            border-left: 3px solid #3498db;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .feature-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-top: 3px solid #3498db;
        }
        
        .feature-card h4 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        
        .button {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 0.5rem 0.5rem 0.5rem 0;
            transition: transform 0.2s;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
        }
        
        .alert {
            padding: 1rem;
            border-radius: 5px;
            margin: 1rem 0;
        }
        
        .alert.info {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .alert.warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        
        .alert.tip {
            background: #cce7ff;
            border: 1px solid #74b9ff;
            color: #0984e3;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 2rem;
            margin-top: 3rem;
        }
        
        @media (max-width: 768px) {
            .nav ul {
                flex-direction: column;
                align-items: center;
            }
            
            .nav li {
                margin: 0.2rem 0;
            }
            
            .content {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🎨 ComfyUI Curve Master</h1>
            <p class="subtitle">Suite professionnelle d'édition de courbes et LUTs pour ComfyUI</p>
        </header>
        
        <nav class="nav">
            <ul>
                <li><a href="#overview">Vue d'ensemble</a></li>
                <li><a href="#curve-master">Curve Master</a></li>
                <li><a href="#lut-manager">LUT Manager</a></li>
                <li><a href="#lut-generator">LUT Generator</a></li>
                <li><a href="#workflows">Workflows</a></li>
                <li><a href="#installation">Installation</a></li>
                <li><a href="#troubleshooting">Dépannage</a></li>
            </ul>
        </nav>
        
        <main class="content">
            <!-- Vue d'ensemble -->
            <section id="overview" class="section">
                <h2><span class="emoji">🌟</span>Vue d'ensemble</h2>
                <p>La suite <strong>Curve Master</strong> est une collection de nœuds professionnels pour ComfyUI, conçue pour l'édition avancée de courbes colorimétriques et la gestion de LUTs (Look-Up Tables).</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4>🎨 Interface Interactive</h4>
                        <p>Éditeur de courbes multi-canaux avec interface graphique intuitive</p>
                    </div>
                    <div class="feature-card">
                        <h4>🔧 Lissage Avancé</h4>
                        <p>Algorithmes de lissage et anti-écrêtage professionnels</p>
                    </div>
                    <div class="feature-card">
                        <h4>📊 Gestion LUT</h4>
                        <p>Support multi-format (.cube, .3dl, .csp) avec génération automatique</p>
                    </div>
                    <div class="feature-card">
                        <h4>💾 Système de Presets</h4>
                        <p>Sauvegarde et chargement de configurations personnalisées</p>
                    </div>
                </div>
            </section>
            
            <!-- Curve Master -->
            <section id="curve-master" class="section">
                <h2><span class="emoji">🎨</span>Curve Master</h2>
                
                <div class="node-card curve-master">
                    <h3>Description</h3>
                    <p>Éditeur de courbes professionnel avec interface graphique interactive pour ajustements colorimétriques précis sur les canaux RGB individuels et combinés.</p>
                    
                    <div class="alert info">
                        <strong>💡 Astuce :</strong> Utilisez l'interface graphique pour éditer visuellement vos courbes en temps réel !
                    </div>
                    
                    <h3>Paramètres d'entrée</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Paramètre</th>
                                <th>Type</th>
                                <th>Défaut</th>
                                <th>Plage</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>image</strong></td>
                                <td><span class="param-type">IMAGE</span></td>
                                <td>-</td>
                                <td>-</td>
                                <td>Image d'entrée à traiter</td>
                            </tr>
                            <tr>
                                <td><strong>curve_points_rgb</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"0,0;64,64;128,128;192,192;255,255"</span></td>
                                <td>-</td>
                                <td>Points de courbe pour le canal RGB combiné</td>
                            </tr>
                            <tr>
                                <td><strong>curve_points_red</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"0,0;255,255"</span></td>
                                <td>-</td>
                                <td>Points de courbe pour le canal rouge</td>
                            </tr>
                            <tr>
                                <td><strong>curve_points_green</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"0,0;255,255"</span></td>
                                <td>-</td>
                                <td>Points de courbe pour le canal vert</td>
                            </tr>
                            <tr>
                                <td><strong>curve_points_blue</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"0,0;255,255"</span></td>
                                <td>-</td>
                                <td>Points de courbe pour le canal bleu</td>
                            </tr>
                            <tr>
                                <td><strong>interpolation</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td><span class="param-default">catmull-rom</span></td>
                                <td>linear, cubic, catmull-rom</td>
                                <td>Méthode d'interpolation des courbes</td>
                            </tr>
                            <tr>
                                <td><strong>strength</strong></td>
                                <td><span class="param-type">FLOAT</span></td>
                                <td><span class="param-default">1.0</span></td>
                                <td>0.0 - 2.0</td>
                                <td>Force d'application de l'effet</td>
                            </tr>
                            <tr>
                                <td><strong>preserve_luminosity</strong></td>
                                <td><span class="param-type">BOOLEAN</span></td>
                                <td><span class="param-default">False</span></td>
                                <td>-</td>
                                <td>Préserver la luminosité originale</td>
                            </tr>
                            <tr>
                                <td><strong>blend_mode</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td><span class="param-default">normal</span></td>
                                <td>normal, multiply, screen, overlay, soft_light</td>
                                <td>Mode de fusion avec l'image originale</td>
                            </tr>
                            <tr>
                                <td><strong>opacity</strong></td>
                                <td><span class="param-type">FLOAT</span></td>
                                <td><span class="param-default">1.0</span></td>
                                <td>0.0 - 1.0</td>
                                <td>Opacité de l'effet appliqué</td>
                            </tr>
                            <tr>
                                <td><strong>gamma_correction</strong></td>
                                <td><span class="param-type">FLOAT</span></td>
                                <td><span class="param-default">1.0</span></td>
                                <td>0.1 - 3.0</td>
                                <td>Correction gamma appliquée</td>
                            </tr>
                            <tr>
                                <td><strong>curve_smoothing</strong></td>
                                <td><span class="param-type">BOOLEAN</span></td>
                                <td><span class="param-default">False</span></td>
                                <td>-</td>
                                <td>Activer le lissage des courbes</td>
                            </tr>
                            <tr>
                                <td><strong>smoothing_strength</strong></td>
                                <td><span class="param-type">FLOAT</span></td>
                                <td><span class="param-default">0.5</span></td>
                                <td>0.1 - 2.0</td>
                                <td>Force du lissage appliqué</td>
                            </tr>
                            <tr>
                                <td><strong>smoothing_iterations</strong></td>
                                <td><span class="param-type">INT</span></td>
                                <td><span class="param-default">3</span></td>
                                <td>1 - 10</td>
                                <td>Nombre d'itérations de lissage</td>
                            </tr>
                            <tr>
                                <td><strong>anti_clipping</strong></td>
                                <td><span class="param-type">BOOLEAN</span></td>
                                <td><span class="param-default">True</span></td>
                                <td>-</td>
                                <td>Prévention de l'écrêtage des valeurs</td>
                            </tr>
                            <tr>
                                <td><strong>save_preset</strong></td>
                                <td><span class="param-type">BOOLEAN</span></td>
                                <td><span class="param-default">False</span></td>
                                <td>-</td>
                                <td>Sauvegarder automatiquement le preset</td>
                            </tr>
                            <tr>
                                <td><strong>preset_user_path</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"./presets/curves"</span></td>
                                <td>-</td>
                                <td>Chemin du dossier de presets</td>
                            </tr>
                            <tr>
                                <td><strong>preset_user_name</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"my_preset"</span></td>
                                <td>-</td>
                                <td>Nom du preset à sauvegarder</td>
                            </tr>
                            <tr>
                                <td><strong>user_preset</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td><span class="param-default">None</span></td>
                                <td>Liste dynamique</td>
                                <td>Preset utilisateur à charger</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3>Interface graphique</h3>
                    <ul>
                        <li><strong>🎨 Multi-Channel Editor</strong> : Interface interactive avec onglets RGB/Red/Green/Blue</li>
                        <li><strong>✨ Load Preset</strong> : Chargement de presets prédéfinis par catégorie</li>
                        <li><strong>🔄 Reset All</strong> : Remise à zéro de tous les paramètres</li>
                    </ul>
                    
                    <div class="alert tip">
                        <strong>🎯 Conseil :</strong> Utilisez les presets par catégorie (Contrast, Brightness, Film, Vintage) comme point de départ !
                    </div>
                </div>
            </section>
            
            <!-- LUT Manager -->
            <section id="lut-manager" class="section">
                <h2><span class="emoji">📊</span>LUT Manager</h2>
                
                <div class="node-card lut-manager">
                    <h3>Description</h3>
                    <p>Gestionnaire professionnel de LUTs avec support multi-formats pour l'application de Look-Up Tables sur vos images.</p>
                    
                    <h3>Formats supportés</h3>
                    <ul>
                        <li><strong>.cube</strong> : Format Adobe (Photoshop, Premiere, After Effects)</li>
                        <li><strong>.3dl</strong> : Format Autodesk (Maya, 3ds Max)</li>
                        <li><strong>.csp</strong> : Format Rising Sun Research</li>
                    </ul>
                    
                    <h3>Paramètres d'entrée</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Paramètre</th>
                                <th>Type</th>
                                <th>Défaut</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>image</strong></td>
                                <td><span class="param-type">IMAGE</span></td>
                                <td>-</td>
                                <td>Image d'entrée à traiter</td>
                            </tr>
                            <tr>
                                <td><strong>lut_file</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td>-</td>
                                <td>Fichier LUT à appliquer</td>
                            </tr>
                            <tr>
                                <td><strong>intensity</strong></td>
                                <td><span class="param-type">FLOAT</span></td>
                                <td><span class="param-default">1.0</span></td>
                                <td>Intensité d'application (0-2)</td>
                            </tr>
                            <tr>
                                <td><strong>interpolation</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td><span class="param-default">trilinear</span></td>
                                <td>Méthode d'interpolation</td>
                            </tr>
                            <tr>
                                <td><strong>data_order</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td><span class="param-default">RGB</span></td>
                                <td>Ordre des données couleur</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            
            <!-- LUT Generator -->
            <section id="lut-generator" class="section">
                <h2><span class="emoji">🔧</span>LUT Generator</h2>
                
                <div class="node-card lut-generator">
                    <h3>Description</h3>
                    <p>Générateur de LUTs à partir d'images avant/après avec optimisations de performance pour des temps de traitement rapides.</p>
                    
                    <div class="alert warning">
                        <strong>⚠️ Performance :</strong> Utilisez lut_size=17 et processing_scale=0.5 pour un traitement rapide !
                    </div>
                    
                    <h3>Paramètres d'entrée</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Paramètre</th>
                                <th>Type</th>
                                <th>Défaut</th>
                                <th>Plage</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>image_before</strong></td>
                                <td><span class="param-type">IMAGE</span></td>
                                <td>-</td>
                                <td>-</td>
                                <td>Image originale (référence)</td>
                            </tr>
                            <tr>
                                <td><strong>image_after</strong></td>
                                <td><span class="param-type">IMAGE</span></td>
                                <td>-</td>
                                <td>-</td>
                                <td>Image avec effet appliqué</td>
                            </tr>
                            <tr>
                                <td><strong>lut_size</strong></td>
                                <td><span class="param-type">INT</span></td>
                                <td><span class="param-default">17</span></td>
                                <td>9 - 65 (impair)</td>
                                <td>Taille de la LUT 3D</td>
                            </tr>
                            <tr>
                                <td><strong>sample_count</strong></td>
                                <td><span class="param-type">INT</span></td>
                                <td><span class="param-default">5000</span></td>
                                <td>1000 - 50000</td>
                                <td>Nombre d'échantillons pour l'analyse</td>
                            </tr>
                            <tr>
                                <td><strong>processing_scale</strong></td>
                                <td><span class="param-type">FLOAT</span></td>
                                <td><span class="param-default">0.5</span></td>
                                <td>0.1 - 1.0</td>
                                <td>Échelle de traitement (performance)</td>
                            </tr>
                            <tr>
                                <td><strong>interpolation_method</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td><span class="param-default">linear</span></td>
                                <td>linear, nearest, cubic</td>
                                <td>Méthode d'interpolation</td>
                            </tr>
                            <tr>
                                <td><strong>smoothing_factor</strong></td>
                                <td><span class="param-type">FLOAT</span></td>
                                <td><span class="param-default">0.1</span></td>
                                <td>0.0 - 1.0</td>
                                <td>Facteur de lissage de la LUT</td>
                            </tr>
                            <tr>
                                <td><strong>export_format</strong></td>
                                <td><span class="param-type">COMBO</span></td>
                                <td><span class="param-default">cube</span></td>
                                <td>cube, 3dl, csp</td>
                                <td>Format d'export de la LUT</td>
                            </tr>
                            <tr>
                                <td><strong>export_path</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"./luts/generated"</span></td>
                                <td>-</td>
                                <td>Chemin d'export des LUTs</td>
                            </tr>
                            <tr>
                                <td><strong>lut_name</strong></td>
                                <td><span class="param-type">STRING</span></td>
                                <td><span class="param-default">"generated_lut"</span></td>
                                <td>-</td>
                                <td>Nom du fichier LUT généré</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3>Optimisations de performance</h3>
                    <ul>
                        <li><strong>Échantillonnage stratifié</strong> : Distribution intelligente des points d'analyse</li>
                        <li><strong>Redimensionnement adaptatif</strong> : Réduction automatique pour accélération</li>
                        <li><strong>Suppression des doublons</strong> : Optimisation automatique des données</li>
                        <li><strong>Interpolation vectorisée</strong> : Calculs optimisés avec NumPy/SciPy</li>
                    </ul>
                </div>
            </section>
            
            <!-- Workflows -->
            <section id="workflows" class="section">
                <h2><span class="emoji">🔄</span>Workflows Recommandés</h2>
                
                <h3>Workflow 1 : Correction colorimétrique complète</h3>
                <div class="workflow-box">
                    [Load Image] → [Curve Master] → [Save Image]
                                        ↓
                                [LUT Generator] → [Export LUT]
                </div>
                <div class="workflow-step">
                    <strong>Étape 1 :</strong> Chargez votre image originale<br>
                    <strong>Étape 2 :</strong> Appliquez les corrections avec Curve Master<br>
                    <strong>Étape 3 :</strong> Générez une LUT pour réutiliser l'effet<br>
                    <strong>Étape 4 :</strong> Sauvegardez l'image corrigée
                </div>
                
                <h3>Workflow 2 : Application de style avec LUT</h3>
                <div class="workflow-box">
                    [Load Image] → [LUT Manager] → [Curve Master] → [Save Image]
                </div>
                <div class="workflow-step">
                    <strong>Étape 1 :</strong> Chargez votre image<br>
                    <strong>Étape 2 :</strong> Appliquez une LUT de base<br>
                    <strong>Étape 3 :</strong> Affinez avec Curve Master<br>
                    <strong>Étape 4 :</strong> Sauvegardez le résultat final
                </div>
                
                <h3>Workflow 3 : Création et test de LUT personnalisée</h3>
                <div class="workflow-box">
                    [Image Original] → [Curve Master] → [LUT Generator: image_after]
                           ↓                                    ↑
                           └─────────────────────→ [image_before]
                                                           ↓
                                                   [Export LUT]
                                                           ↓
                                              [LUT Manager] → [Test sur nouvelle image]
                </div>
                <div class="workflow-step">
                    <strong>Étape 1 :</strong> Préparez une image de référence<br>
                    <strong>Étape 2 :</strong> Créez l'effet souhaité avec Curve Master<br>
                    <strong>Étape 3 :</strong> Générez la LUT avec LUT Generator<br>
                    <strong>Étape 4 :</strong> Testez la LUT sur d'autres images
                </div>
            </section>
            
            <!-- Installation -->
            <section id="installation" class="section">
                <h2><span class="emoji">🚀</span>Installation</h2>
                
                <h3>Méthode 1 : ComfyUI Manager (Recommandée)</h3>
                <div class="workflow-step">
                    1. Ouvrez ComfyUI Manager dans votre interface<br>
                    2. Recherchez "Curve Master"<br>
                    3. Cliquez sur "Install"<br>
                    4. Redémarrez ComfyUI
                </div>
                
                <h3>Méthode 2 : Installation manuelle</h3>
                <div class="workflow-box">
cd ComfyUI/custom_nodes
git clone https://github.com/votre-username/comfyui-curve-master.git
pip install -r comfyui-curve-master/requirements.txt
                </div>
                
                <h3>Dépendances requises</h3>
                <ul>
                    <li><strong>numpy</strong> >= 1.21.0</li>
                    <li><strong>opencv-python</strong> >= 4.5.0</li>
                    <li><strong>scipy</strong> >= 1.7.0</li>
                    <li><strong>torch</strong> >= 1.9.0</li>
                </ul>
            </section>
            
            <!-- Dépannage -->
            <section id="troubleshooting" class="section">
                <h2><span class="emoji">🔧</span>Dépannage</h2>
                
                <h3>Problèmes courants</h3>
                
                <div class="alert warning">
                    <strong>LUT Generator très lent :</strong><br>
                    • Réduisez lut_size à 17<br>
                    • Diminuez sample_count à 3000<br>
                    • Utilisez processing_scale: 0.3
                </div>
                
                <div class="alert warning">
                    <strong>Courbes ne s'appliquent pas :</strong><br>
                    • Vérifiez que strength > 0<br>
                    • Contrôlez les points de courbe<br>
                    • Redémarrez ComfyUI si nécessaire
                </div>
                
                <div class="alert warning">
                    <strong>Presets non sauvegardés :</strong><br>
                    • Vérifiez save_preset: True<br>
                    • Changez preset_user_name<br>
                    • Contrôlez les permissions du dossier
                </div>
                
                <div class="alert warning">
                    <strong>Erreurs de chargement LUT :</strong><br>
                    • Vérifiez le format du fichier LUT<br>
                    • Contrôlez le chemin d'accès<br>
                    • Testez avec data_order différent
                </div>
                
                <h3>Optimisation des performances</h3>
                <ul>
                    <li>Utilisez des images de résolution modérée pour les tests</li>
                    <li>Activez le lissage seulement si nécessaire</li>
                    <li>Préférez l'interpolation "linear" pour la vitesse</li>
                    <li>Fermez les autres applications gourmandes en mémoire</li>
                </ul>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2025 ComfyUI Curve Master - Documentation créée avec ❤️</p>
            <p>Pour toute question, consultez le dépôt GitHub ou ouvrez une issue</p>
        </footer>
    </div>
</body>
</html>
