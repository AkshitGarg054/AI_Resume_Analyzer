FROM node:20-slim

# Install necessary linux dependencies and chromium via apt-get
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip installing Chrome/Chromium and use the installed one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# The render.yaml sets context to root, so we copy from Backend/
COPY Backend/package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY Backend/ ./

EXPOSE 3000

CMD ["npm", "start"]
