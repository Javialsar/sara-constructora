FROM node:18-alpine

WORKDIR /usr/src/app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto de la API
EXPOSE 4000

# Iniciar en modo desarrollo con nodemon o ts-node-dev
CMD ["npm", "run", "dev"]
