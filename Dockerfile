FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY config.json *.config.json ./
ENTRYPOINT ["node", "src/cli.mjs"]
CMD ["plan"]
