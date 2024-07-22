FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Instalar PM2 globalmente
RUN npm install -g pm2

COPY . .

# Instalar dependências necessárias para o Puppeteer
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["pm2-runtime", "start", "server.js"]
