FROM node:18-alpine

WORKDIR /usr/src/app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto de desarrollo de Vite/React
EXPOSE 3000

# Iniciar servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
