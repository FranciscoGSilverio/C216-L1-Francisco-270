FROM node:22-alpine

WORKDIR /app

# Copia apenas os manifestos primeiro: a camada de dependências só é
# reconstruída quando package.json ou package-lock.json mudam.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
