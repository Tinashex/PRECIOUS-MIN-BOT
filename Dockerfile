FROM node:20-bullseye
USER root
RUN apt-get update && \
    apt-get install -y ffmpeg webp git && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*
USER node
RUN git clone https://github.com/watson-xd6/WATSON-XD-BOT.git /home/node/WATSON-XD-BOT 
WORKDIR /home/node/WATSON-XD-BOT 
RUN chmod -R 777 /home/node/WATSON-XD-BOT/
RUN yarn install --network-concurrency 1 --ignore-engines
EXPOSE 7860
ENV NODE_ENV=production
CMD ["npm", "start"]
