# Go-Live TODOs

Things to do before deploying to production.

## Backend Containerization
- [ ] Write backend `Dockerfile`
- [ ] Add `backend` service to `docker-compose.yml` with a `uploads_data` named volume mounted at `/app/uploads`
- [ ] Set `UPLOAD_DIR=/app/uploads` in the backend container environment
