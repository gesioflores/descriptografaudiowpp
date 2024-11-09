# Usar uma imagem base do Node.js (versão LTS recomendada)
FROM node:16

# Crie um diretório de trabalho na imagem
WORKDIR /app

# Copie os arquivos package.json para o diretório de trabalho
COPY package.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o resto dos arquivos da aplicação para o diretório de trabalho
COPY . .

# Expõe a porta 4001 para o serviço de descriptografia
EXPOSE 4001

# Comando para iniciar o servidor
CMD ["npm", "start"]
