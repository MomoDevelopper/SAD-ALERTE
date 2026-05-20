import time
import requests
import os
from PyPDF2 import PdfReader

API_BASE_URL = "http://127.0.0.1:4000/api"
API_KEY = os.getenv("DOCUMENTS_AI_API_KEY", "")
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "uploads"))

def load_api_key():
    key = os.getenv("DOCUMENTS_AI_API_KEY", "")
    if key:
        return key
        
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("DOCUMENTS_AI_API_KEY="):
                    return line.split("=", 1)[1].strip('"\'')
    return ""

API_KEY = load_api_key()

def fetch_pending_documents():
    try:
        if not API_KEY:
            print("[FAIL] DOCUMENTS_AI_API_KEY manquante dans l'environnement et dans backend/.env")
            return []
        response = requests.get(
            f"{API_BASE_URL}/documents/non_traites",
            headers={"x-api-key": API_KEY}
        )
        if response.status_code == 200:
            return response.json().get('documents', [])
    except Exception as e:
        print(f"Erreur de connexion a l'API: {e}")
    return []

def analyze_pdf(filepath):
    # Mock analysis based on text extracted
    try:
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + " "
            
        print(f"Extrait {len(text)} caracteres.")
        
        # VERY Simple mock intelligence
        text_lower = text.lower()
        if "attaque" in text_lower or "terroriste" in text_lower or "embuscade" in text_lower:
            return {"gravite_ia": 5, "type_incident": "Terroriste", "description": "L'IA a détecté une attaque terroriste majeure basée sur les mots-clés du document fourni.", "niveau_certitude": "Je suis sûr"}
        elif "vol" in text_lower or "criminel" in text_lower or "braquage" in text_lower:
            return {"gravite_ia": 3, "type_incident": "Criminel", "description": "Activité criminelle rapportée.", "niveau_certitude": "Je pense"}
        elif "frontière" in text_lower or "incursion" in text_lower:
            return {"gravite_ia": 4, "type_incident": "Frontière", "description": "Mouvements suspects à la frontière.", "niveau_certitude": "Je suis sûr"}
        else:
            return {"gravite_ia": 2, "type_incident": "Autre", "description": "Incident mineur ou rapport de routine. L'IA a lu le document mais n'a trouvé aucune menace immédiate.", "niveau_certitude": "Je pense"}
            
    except Exception as e:
        print(f"Erreur parsing PDF: {e}")
        return {"gravite_ia": 1, "type_incident": "Inconnu", "description": "Impossible d'analyser le document. Lecture IA échouée.", "niveau_certitude": "Rumeur"}

def update_document(doc_id, analysis):
    try:
        if not API_KEY:
            print("[FAIL] DOCUMENTS_AI_API_KEY manquante dans l'environnement.")
            return
        payload = {
            "api_key": API_KEY,
            "gravite_ia": analysis["gravite_ia"],
            "type_incident": analysis["type_incident"],
            "description": analysis["description"],
            "niveau_certitude": analysis["niveau_certitude"]
        }
        res = requests.put(f"{API_BASE_URL}/documents/{doc_id}/traiter", json=payload)
        if res.status_code == 200:
            print(f"[OK] Document {doc_id} traité et base de données mise à jour.")
        else:
            print(f"[FAIL] Erreur mise à jour {doc_id}: {res.text}")
    except Exception as e:
         print(f"Erreur de connexion api lors de l'update: {e}")


def main():
    print("==================================================")
    print("Démarrage du NLP Pipeline (Python)")
    print(f"Dossier cible: {UPLOAD_DIR}")
    print("Mode d'attente (Polling toutes les 5s...)")
    print("==================================================")
    
    while True:
        docs = fetch_pending_documents()
        if docs:
            print(f"-> {len(docs)} document(s) non traité(s) trouvé(s) dans la file d'attente.")
            for doc in docs:
                print(f"--- Début analyse du document {doc['id']} ({doc['titre']}) ---")
                filepath = os.path.join(UPLOAD_DIR, doc['chemin_fichier'])
                
                # Simuler le temps de calcul IA
                time.sleep(3) 
                
                if os.path.exists(filepath):
                    analysis = analyze_pdf(filepath)
                    update_document(doc['id'], analysis)
                else:
                    print(f"[ERREUR] Fichier introuvable sur le disque: {filepath}")
        
        time.sleep(5)

if __name__ == "__main__":
    main()
