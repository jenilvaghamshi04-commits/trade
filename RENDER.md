# Render deployment

The repository includes a root Dockerfile and a dependency-free Node HTTP server.

Existing Docker service:
- Branch: main
- Root Directory: blank (repository root)
- Dockerfile Path: ./Dockerfile
- Docker Command: blank (use the image default)
- Health Check Path: /health
- Manual Deploy > Deploy latest commit

No environment variables or API keys are required. The server binds 0.0.0.0 and uses Render's PORT variable, defaulting to 10000.

For Node runtime instead: Build Command `npm install --omit=dev`, Start Command `npm start`.

Binance data connects directly from the visitor's browser. Deployment does not bypass regional Binance restrictions.
