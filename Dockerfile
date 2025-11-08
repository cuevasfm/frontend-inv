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

# Build de producción con variables de entorno
ENV NODE_ENV=production
RUN npm run build

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

