#!/bin/bash

# Script para verificar conexiones a servicios externos

echo "🔍 Verificando conexiones a servicios..."

# Cargar variables de entorno
source .env

# Función para verificar si una variable está configurada
check_var() {
    local var_name=$1
    local var_value=$2
    
    if [[ "$var_value" == *"YOUR_"* ]] || [[ "$var_value" == *"..." ]] || [[ -z "$var_value" ]]; then
        echo "❌ $var_name: No configurado"
        return 1
    else
        echo "✅ $var_name: Configurado"
        return 0
    fi
}

echo ""
echo "📋 Verificando variables de entorno:"
echo "=================================="

# Verificar variables críticas
check_var "SUPABASE_URL" "$SUPABASE_URL"
check_var "SUPABASE_SERVICE_ROLE" "$SUPABASE_SERVICE_ROLE"
check_var "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
check_var "GEMINI_API_KEY" "$GEMINI_API_KEY"

echo ""
echo "🔗 Verificando conexiones:"
echo "========================="

# 1. Verificar Supabase
if check_var "SUPABASE_URL" "$SUPABASE_URL" && check_var "SUPABASE_SERVICE_ROLE" "$SUPABASE_SERVICE_ROLE"; then
    echo "🔍 Probando conexión a Supabase..."
    SUPABASE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
        -H "apikey: $SUPABASE_SERVICE_ROLE" \
        "$SUPABASE_URL/rest/v1/")
    
    if [ "$SUPABASE_RESPONSE" = "200" ]; then
        echo "✅ Supabase: Conexión exitosa"
    else
        echo "❌ Supabase: Error de conexión (HTTP $SUPABASE_RESPONSE)"
    fi
fi

# 2. Verificar Gemini
if check_var "GEMINI_API_KEY" "$GEMINI_API_KEY"; then
    echo "🔍 Probando conexión a Gemini..."
    GEMINI_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Content-Type: application/json" \
        "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY")
    
    if [ "$GEMINI_RESPONSE" = "200" ]; then
        echo "✅ Gemini: Conexión exitosa"
    else
        echo "❌ Gemini: Error de conexión (HTTP $GEMINI_RESPONSE)"
    fi
fi

# 3. Verificar vLLM local
echo "🔍 Probando conexión a vLLM local..."
VLLM_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "$VLLM_BASE_URL/models" 2>/dev/null)

if [ "$VLLM_RESPONSE" = "200" ]; then
    echo "✅ vLLM local: Disponible"
else
    echo "⚠️  vLLM local: No disponible (¿Docker corriendo?)"
fi

# 4. Verificar Slack (opcional)
if check_var "SLACK_BOT_TOKEN" "$SLACK_BOT_TOKEN"; then
    echo "🔍 Probando conexión a Slack..."
    SLACK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
        "https://slack.com/api/auth.test")
    
    if [ "$SLACK_RESPONSE" = "200" ]; then
        echo "✅ Slack: Conexión exitosa"
    else
        echo "❌ Slack: Error de conexión (HTTP $SLACK_RESPONSE)"
    fi
fi

echo ""
echo "📊 Resumen:"
echo "==========="
echo "• Supabase: $(check_var "SUPABASE_URL" "$SUPABASE_URL" && echo "✅" || echo "❌")"
echo "• Gemini: $(check_var "GEMINI_API_KEY" "$GEMINI_API_KEY" && echo "✅" || echo "❌")"
echo "• vLLM: $([ "$VLLM_RESPONSE" = "200" ] && echo "✅" || echo "⚠️")"
echo "• Slack: $(check_var "SLACK_BOT_TOKEN" "$SLACK_BOT_TOKEN" && echo "✅" || echo "❌")"

echo ""
echo "💡 Próximos pasos:"
echo "=================="
echo "1. Configura las variables faltantes en .env"
echo "2. Ejecuta 'docker compose up -d' para vLLM local"
echo "3. Ejecuta los seeds SQL en Supabase"
echo "4. Ejecuta 'npm run dev' para iniciar la API"
