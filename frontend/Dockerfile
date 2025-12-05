# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação (variável de ambiente injetada no build)
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Instalar serve globalmente e wget para healthcheck
RUN npm install -g serve && \
    apk add --no-cache wget

# Copiar arquivos buildados
COPY --from=build /app/dist ./dist

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Servir arquivos estáticos na porta 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
