from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import base64
from colorizer import ImageColorizer

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize colorizer
colorizer = ImageColorizer()

@app.route('/api/status', methods=['GET'])
def check_status():
    """Check if model files are ready."""
    try:
        ready = colorizer.ensure_models()
        return jsonify({"ready": ready})
    except Exception as e:
        return jsonify({"ready": False, "error": str(e)}), 500

@app.route('/api/colorize', methods=['POST'])
def colorize_image():
    """Upload and colorize an image."""
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        print(f"Processing image: {file.filename}")
        img_bytes = file.read()
        colorized_bytes = colorizer.colorize(img_bytes)
        
        # Return as base64 for easy frontend consumption
        encoded = base64.b64encode(colorized_bytes).decode('utf-8')
        return jsonify({
            "image": f"data:image/jpeg;base64,{encoded}",
            "message": "Successfully colorized"
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initial status check
    print("Checking model files...")
    colorizer.ensure_models()
    print("Starting server on port 5000...")
    app.run(port=5000)
