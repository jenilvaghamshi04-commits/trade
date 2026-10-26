FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node index.html app.js engine.js paper.js server.mjs ./
USER node
EXPOSE 10000
CMD ["node", "server.mjs"]
