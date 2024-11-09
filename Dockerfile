# Use uma imagem do Node.js como base
FROM node:16

# Cria um diretório de trabalho na imagem
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json ./

# Instala as dependências
RUN npm install

# Copia o resto dos arquivos da aplicação para o diretório de trabalho
COPY . .

# Expõe a porta (embora o WebJs não use diretamente)
EXPOSE 4001

# Comando para iniciar o script
CMD ["node", "decryptMediaTest.js"]
