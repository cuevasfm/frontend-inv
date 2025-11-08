#!/bin/sh
# Script para reemplazar variables de entorno en nginx.conf

# Valor por defecto si no se proporciona BACKEND_URL
BACKEND_URL=${BACKEND_URL:-http://backend:3000}

# Reemplazar en nginx.conf
sed -i "s|\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Iniciar nginx
exec nginx -g 'daemon off;'

