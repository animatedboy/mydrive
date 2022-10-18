FROM node:16.18.0

WORKDIR /mydrive

COPY package.json package.json
COPY package-lock.json package-lock.json

COPY . .

RUN npm install

CMD [ "npm" ,"start" ]


