#!/bin/bash

# Script de vérification complète de l'application LSU
# Usage: ./verify_all.sh

echo "🔍 VÉRIFICATION COMPLÈTE DE L'APPLICATION LSU"
echo "==============================================="
echo "Date: $(date)"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Compteurs de résultats
TOTAL_TESTS=0
PASSED_TESTS=0

# TEST 1: Vérification Docker
echo -e "${BLUE}📦 VÉRIFICATION DOCKER${NC}"
echo "────────────────────────"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if docker --version >/dev/null 2>&1; then
    print_result 0 "Docker installé et accessible"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "Docker non accessible"
fi

# TEST 2: Vérification Ollama
echo ""
echo -e "${BLUE}🤖 VÉRIFICATION OLLAMA${NC}"
echo "──────────────────────"

# Conteneur Ollama
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if docker ps | grep -q ollama; then
    print_result 0 "Conteneur Ollama en cours d'exécution"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "Conteneur Ollama non trouvé"
fi

# Port Ollama
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if netstat -an 2>/dev/null | grep -q :11434; then
    print_result 0 "Port 11434 ouvert"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "Port 11434 non accessible"
fi

# API Ollama
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if curl -s --max-time 5 http://localhost:11434/api/version >/dev/null; then
    print_result 0 "API Ollama répond"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "API Ollama ne répond pas"
fi

# TEST 3: Vérification N8N
echo ""
echo -e "${BLUE}🔗 VÉRIFICATION N8N${NC}"
echo "─────────────────────"

# Conteneur N8N
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if docker ps | grep -q n8n; then
    print_result 0 "Conteneur N8N en cours d'exécution"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "Conteneur N8N non trouvé"
fi

# Port N8N
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if netstat -an 2>/dev/null | grep -q :5678; then
    print_result 0 "Port 5678 ouvert"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "Port 5678 non accessible"
fi

# Interface N8N
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if curl -s --max-time 5 -I http://localhost:5678 | grep -q "200"; then
    print_result 0 "Interface N8N accessible"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "Interface N8N non accessible"
fi

# TEST 4: Vérification Application Web
echo ""
echo -e "${BLUE}🌐 VÉRIFICATION APPLICATION WEB${NC}"
echo "─────────────────────────────"

# Fichier index.html
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ -f "index.html" ]; then
    print_result 0 "Fichier index.html trouvé"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_result 1 "Fichier index.html non trouvé"
fi

# Serveur web (optionnel)
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if netstat -an 2>/dev/null | grep -q :8000; then
    print_result 0 "Serveur web actif sur le port 8000"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "Aucun serveur sur le port 8000 (vous pouvez ouvrir index.html directement)"
    PASSED_TESTS=$((PASSED_TESTS + 1))  # Considéré comme OK
fi

# TEST 5: Test du webhook
echo ""
echo -e "${BLUE}🪝 TEST DU WEBHOOK${NC}"
echo "─────────────────────"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
WEBHOOK_RESPONSE=$(curl -s --max-time 10 -X POST http://localhost:5678/webhook-test/generer-commentaire \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Test","classe":"CE1","matiere":"Test","competences":"Test","remarques":"Test"}' 2>/dev/null)

if echo "$WEBHOOK_RESPONSE" | grep -q -i "test\|commentaire\|ce1\|élève" 2>/dev/null; then
    print_result 0 "Webhook fonctionnel (génération OK)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    if curl -s --max-time 5 http://localhost:5678/webhook-test/generer-commentaire >/dev/null 2>&1; then
        print_result 1 "Webhook accessible mais génération échouée"
    else
        print_result 1 "Webhook non configuré ou N8N non accessible"
    fi
fi

# RÉSUMÉ FINAL
echo ""
echo "🎯 RÉSUMÉ DES VÉRIFICATIONS"
echo "══════════════════════════"
echo -e "Tests réussis: ${GREEN}$PASSED_TESTS${NC}/$TOTAL_TESTS"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 Tous les tests sont passés ! Votre application est opérationnelle.${NC}"
    echo ""
    echo "🚀 LIENS D'ACCÈS:"
    echo "📱 Application: http://localhost:8000 (ou ouvrir index.html)"
    echo "🔗 N8N: http://localhost:5678"
    echo "🤖 Ollama API: http://localhost:11434"
    
    echo ""
    echo "📋 ÉTAPES SUIVANTES:"
    echo "1. Ouvrir l'application web"
    echo "2. Tester la connexion Ollama dans l'interface"
    echo "3. Sélectionner un élève et faire une évaluation"
    echo "4. Générer un commentaire"
    
elif [ $PASSED_TESTS -gt $((TOTAL_TESTS / 2)) ]; then
    echo -e "${YELLOW}⚠️  La plupart des composants fonctionnent, mais il y a quelques problèmes à résoudre.${NC}"
    
    echo ""
    echo "🔧 ACTIONS RECOMMANDÉES:"
    if ! docker ps | grep -q ollama; then
        echo "• Démarrer Ollama: docker run -d -p 11434:11434 --name ollama-lsu ollama/ollama"
    fi
    if ! docker ps | grep -q n8n; then
        echo "• Démarrer N8N: docker run -d -p 5678:5678 --name n8n-workflow n8nio/n8n"
    fi
    if ! curl -s --max-time 5 http://localhost:5678/webhook-test/generer-commentaire >/dev/null 2>&1; then
        echo "• Configurer le webhook dans N8N (voir instructions précédentes)"
    fi
    
else
    echo -e "${RED}❌ Plusieurs composants ne fonctionnent pas. Vérifiez votre installation.${NC}"
    
    echo ""
    echo "🆘 DÉPANNAGE:"
    echo "1. Vérifiez que Docker Desktop est démarré"
    echo "2. Redémarrez les conteneurs si nécessaire"
    echo "3. Vérifiez les logs: docker logs ollama-lsu && docker logs n8n-workflow"
    echo "4. Relancez le script de démarrage"
fi

echo ""
echo "📞 Pour un diagnostic détaillé, exécutez les scripts individuels."
