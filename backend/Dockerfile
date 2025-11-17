FROM node:18-bullseye

# Install system packages (for OpenCV, etc.)
RUN apt-get update && apt-get install -y \
    libopencv-dev python3-opencv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package definitions and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the backend source code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
