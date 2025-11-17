FROM node:18

WORKDIR /app

# Install frontend dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
