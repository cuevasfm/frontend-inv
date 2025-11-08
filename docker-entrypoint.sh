#!/bin/sh
# Script para reemplazar variables de entorno en nginx.conf

# Valor por defecto si no se proporciona BACKEND_URL
# Cambia esto por el nombre de tu servicio backend en Dokploy
BACKEND_URL=${BACKEND_URL:-http://licoreria-backend:3000}

echo "Configurando nginx con BACKEND_URL: $BACKEND_URL"

# Reemplazar en nginx.conf
sed -i "s|\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Mostrar configuración para debug
echo "Configuración de nginx:"
cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api"

# Iniciar nginx
echo "Iniciando nginx..."
exec nginx -g 'daemon off;'

