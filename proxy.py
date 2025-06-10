from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

OLLAMA_BASE_URL = "http://localhost:11434"

@app.route('/api/tags', methods=['GET'])
def get_tags():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=data)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        response = requests.post(f"{OLLAMA_BASE_URL}/api/chat", json=data)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) 