FROM node:20-alpine
#ENV NODE_ENV=production

WORKDIR /app

COPY . .

#RUN cd /app/server && npm i -G typescript -y
#RUN cd /app/server && npm install bcrypt -y && npm i --save-dev @types/bcrypt

RUN cd /app/client && rm -rf /app/client/build && npm run build
RUN cd /app/server && rm -rf node_modules && npm i && rm -rf /app/server/dist && npm run build
#RUN cd /app/server && cp .env dist/ && cp users.json dist/ && cp config.json dist/

CMD [ "node", "./server/dist/index.js" ]
