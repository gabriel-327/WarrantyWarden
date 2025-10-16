# WarrantyWarden

Minimal MERN scaffold added (Express + Mongoose server, Vite + React client).

Quick start (PowerShell):

```powershell
# install server and client deps
npm run install-all

# start both in development (server nodemon, client vite)
npm run dev
```

Server:
- `server` runs on port 5000 by default. Environment example: `server/.env.example`.
Client:
- `client` runs on port 3000 and proxies `/api` to the server.

Next steps:
- Provide a MongoDB connection string in `server/.env` or run a local MongoDB instance.
- If you want a different stack or CI, request changes and I'll update the scaffold.