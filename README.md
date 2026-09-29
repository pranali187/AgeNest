# AgeNest (MERN)
MongoDB (optional) · Express · React (Vite) · Node 18+

## Run (development)
1. `npm install`
2. `cp .env.example .env`   (Windows: `copy .env.example .env`)
3. `npm run dev`  → open http://localhost:5173   (API runs on :5000)

## Run (production)
`npm run build && npm start` → http://localhost:5000

## Tests
`npm test`

## MongoDB (optional)
Leave `MONGODB_URI` empty and everything works except saving Contact messages and page-view counts.
Free option: MongoDB Atlas → paste the connection string into `.env`. Dates of birth are NEVER sent to the server.

## Deploy
Render / Railway / Fly: Build `npm install && npm run build`, Start `npm start`. Set env vars SITE, OWNER, CONTACT_EMAIL, MONGODB_URI.
