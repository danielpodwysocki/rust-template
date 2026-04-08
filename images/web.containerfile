FROM node:22-alpine AS build

WORKDIR /app
COPY frontends/web ./
RUN npm ci
RUN npx nuxt build

FROM node:22-alpine AS prod

WORKDIR /app
COPY --from=build /app/.output ./.output

ENV PORT=3001
ENV NITRO_PORT=3001

EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
