#!/bin/sh
# Script para reemplazar variables de entorno en nginx.conf

# Valor por defecto - Usar la URL pública del backend
BACKEND_URL=${BACKEND_URL:-https://apiinv.miguelcuevas.com}

# Asegurarse de que no tenga /api al final
BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|/api/*$||')

echo "========================================="
echo "Configurando Nginx Frontend"
echo "========================================="
echo "BACKEND_URL: $BACKEND_URL"

# Reemplazar en nginx.conf
sed -i "s|\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Verificar que el reemplazo funcionó
echo ""
echo "Configuración del proxy /api:"
cat /etc/nginx/conf.d/default.conf | grep -A 15 "location /api"

echo ""
echo "IMPORTANTE: Request /api/health se proxea a $BACKEND_URL/health"
echo "            (el /api/ se quita automáticamente)"

# Verificar que los archivos HTML existan
echo ""
echo "Verificando archivos del frontend..."
ls -la /usr/share/nginx/html/ | head -20
echo ""
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ ERROR: No se encontró index.html"
    exit 1
else
    echo "✅ index.html encontrado"
fi

# Probar configuración de nginx
echo ""
echo "Verificando configuración de nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración de nginx válida"
else
    echo "❌ Error en configuración de nginx"
    cat /etc/nginx/conf.d/default.conf
    exit 1
fi

# Iniciar nginx
echo ""
echo "Iniciando nginx..."
exec nginx -g 'daemon off;'

