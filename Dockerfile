# syntax=docker/dockerfile:1

FROM node:16-bullseye

RUN useradd -ms /bin/bash worker
USER worker
WORKDIR /home/worker

ENV PATH="/home/worker/.local/bin:${PATH}"

COPY --chown=worker:worker ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY --chown=worker:worker . .

CMD [ "npm", "start" ]