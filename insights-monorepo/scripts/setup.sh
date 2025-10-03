#!/bin/bash

# Script de configuración inicial para el Motor de Insights

echo "🚀 Configurando Motor de Insights de Reuniones..."

# 1. Instalar dependencias del monorepo
echo "📦 Instalando dependencias del monorepo..."
npm install

# 2. Instalar dependencias de cada workspace
echo "📦 Instalando dependencias de workspaces..."
cd apps/api && npm install && cd ../../
cd packages/schemas && npm install && cd ../../
cd packages/llm && npm install && cd ../../
cd packages/core && npm install && cd ../../
cd packages/slack && npm install && cd ../../

# 3. Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "⚙️  Creando archivo .env..."
    cp env.example .env
    echo "📝 Por favor edita el archivo .env con tus credenciales"
fi

# 4. Verificar Docker
if command -v docker &> /dev/null; then
    echo "🐳 Docker encontrado. Puedes ejecutar 'docker compose up -d' para vLLM local"
else
    echo "⚠️  Docker no encontrado. Instala Docker Desktop para usar vLLM local"
fi

# 5. Verificar Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo "✅ Node.js $NODE_VERSION.x detectado (requerido: ≥20)"
else
    echo "❌ Node.js $NODE_VERSION.x detectado (requerido: ≥20)"
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "Próximos pasos:"
echo "1. Edita el archivo .env con tus credenciales"
echo "2. Ejecuta 'docker compose up -d' para vLLM local (opcional)"
echo "3. Ejecuta los seeds SQL en tu instancia de Supabase"
echo "4. Ejecuta 'npm run dev' para iniciar la API"
echo ""
echo "📚 Lee el README.md para más información"
