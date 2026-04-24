FROM node:18-alpine

# Nastavenie pracovného adresára
WORKDIR /app

# Kopírovanie package files
COPY package*.json ./

# Inštalácia závislostí
RUN npm ci --only=production

# Kopírovanie zdrojového kódu
COPY . .

# Exponovanie portu
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Spustenie aplikácie
CMD ["node", "server.js"]
