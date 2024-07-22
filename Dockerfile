# Use a base image com Node.js
FROM node:14

# Configuração de diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install pm2 -g && npm install

# Copiar código da aplicação
COPY . .

# Expor a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
