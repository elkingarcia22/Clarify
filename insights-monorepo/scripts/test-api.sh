#!/bin/bash

# Script de pruebas para la API

API_URL="http://localhost:4000"

echo "🧪 Probando Motor de Insights API..."

# 1. Health check
echo "1. Health check..."
curl -s "$API_URL/health" | jq '.' || echo "❌ API no disponible"

echo ""

# 2. Ingesta manual
echo "2. Ingesta manual..."
MEETING_RESPONSE=$(curl -s -X POST "$API_URL/intake/manual" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Demo con ACME Corp",
    "raw_text": "Hola, soy Juan de ACME. Estamos buscando una solución para automatizar nuestros procesos de ventas. Actualmente perdemos mucho tiempo en tareas manuales y necesitamos algo que nos ayude a ser más eficientes. ¿Podrían ayudarnos con esto?",
    "team": "ventas",
    "session_type": "discovery",
    "created_by_email": "test@empresa.com"
  }')

echo "$MEETING_RESPONSE" | jq '.'

MEETING_ID=$(echo "$MEETING_RESPONSE" | jq -r '.meeting_id // empty')

if [ -n "$MEETING_ID" ] && [ "$MEETING_ID" != "null" ]; then
    echo "✅ Meeting creado con ID: $MEETING_ID"
    
    echo ""
    echo "3. Extracción de insights..."
    
    # 3. Extracción de insights
    INSIGHT_RESPONSE=$(curl -s -X POST "$API_URL/llm/extract" \
      -H 'Content-Type: application/json' \
      -d "{\"meeting_id\": \"$MEETING_ID\"}")
    
    echo "$INSIGHT_RESPONSE" | jq '.'
    
    if echo "$INSIGHT_RESPONSE" | jq -e '.ok' > /dev/null; then
        echo "✅ Insights extraídos exitosamente"
    else
        echo "❌ Error en extracción de insights"
    fi
else
    echo "❌ No se pudo crear el meeting"
fi

echo ""
echo "🏁 Pruebas completadas"
