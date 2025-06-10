#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import urllib.error
import json
import os

class CORSHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Headers CORS pour toutes les réponses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Gérer les requêtes preflight CORS"""
        self.send_response(200)
        self.end_headers()
    
    def do_POST(self):
        """Gérer toutes les requêtes POST"""
        print(f"📍 POST reçu sur: {self.path}")
        
        if self.path == '/api/generer-commentaire':
            self.handle_generate_comment()
        else:
            # Pour les autres chemins, servir normalement
            super().do_POST()
    
    def handle_generate_comment(self):
        """Gérer la génération de commentaires via n8n"""
        try:
            # Lire les données de la requête
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                raise Exception("Aucune donnée reçue")
            
            post_data = self.rfile.read(content_length)
            print(f"📤 Données reçues: {len(post_data)} bytes")
            
            # Créer la requête vers n8n
            n8n_url = 'http://localhost:5678/webhook-test/generer-commentaire'
            print(f"🔗 Redirection vers: {n8n_url}")
            
            req = urllib.request.Request(
                n8n_url,
                data=post_data,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            )
            
            # Envoyer la requête à n8n
            with urllib.request.urlopen(req, timeout=30) as response:
                result = response.read()
                content_type = response.headers.get('Content-Type', 'application/json')
            
            print(f"✅ Réponse n8n: {response.status} ({len(result)} bytes)")
            
            # Retourner la réponse au navigateur
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.end_headers()
            self.wfile.write(result)
            
        except urllib.error.HTTPError as e:
            print(f"❌ Erreur HTTP n8n: {e.code} - {e.reason}")
            try:
                error_details = e.read().decode('utf-8')
                print(f"📄 Détails: {error_details}")
            except:
                error_details = str(e)
            
            error_response = json.dumps({
                'success': False,
                'error': f'Erreur n8n: {e.code} - {e.reason}',
                'details': error_details
            }).encode('utf-8')
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(error_response)
            
        except Exception as e:
            print(f"❌ Erreur proxy: {e}")
            
            error_response = json.dumps({
                'success': False,
                'error': 'Erreur de connexion',
                'details': str(e)
            }).encode('utf-8')
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(error_response)

def main():
    # Démarrer dans le bon dossier
    try:
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
    except:
        pass
    
    # Créer et démarrer le serveur
    server = HTTPServer(('localhost', 8000), CORSHTTPRequestHandler)
    
    print("🚀 Générateur LSU V2 - Serveur CORS démarré !")
    print("📍 URL: http://localhost:8000")
    print("✅ Proxy n8n: /api/generer-commentaire → http://localhost:5678/webhook-test/generer-commentaire")
    print("🔄 CORS activé pour toutes les requêtes")
    print("⏹️  Ctrl+C pour arrêter")
    print("-" * 60)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Serveur arrêté")
        server.shutdown()

if __name__ == '__main__':
    main()
