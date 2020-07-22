FROM node:10.17.0
RUN ["mkdir", "/home/application"]
COPY dist /home/application/dist
COPY .environments /home/application/.environments
COPY ./dotenv.config.js /home/application/dotenv.config.js
COPY ./service.config.js /home/application/service.config.js
COPY package.json /home/application/package.json
COPY .env.example /home/application/.env.example
WORKDIR /home/application
RUN npm install --production
CMD ["npm", "start"]
