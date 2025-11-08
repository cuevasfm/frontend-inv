# Dockerfile para Frontend - Sistema de Inventario Licorería
# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (usar npm install si no hay package-lock.json)
RUN npm install

# Copiar el código fuente
COPY . .

# Variables de entorno para el build de Vite
# IMPORTANTE: Las variables VITE_* se incrustan en el código durante el build
ENV NODE_ENV=production
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build de producción
RUN echo "Building with VITE_API_URL=$VITE_API_URL" && npm run build

# Verificar que el build se generó
RUN ls -la /app/dist && echo "Build completado exitosamente"

# Etapa 2: Servidor de producción con nginx
FROM nginx:alpine

# Copiar build al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de entrada
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto
EXPOSE 80

# Usar script de entrada para configurar nginx
ENTRYPOINT ["/docker-entrypoint.sh"]

