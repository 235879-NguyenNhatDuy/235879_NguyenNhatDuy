# 235879_NguyenNhatDuy
## Hướng dẫn chạy Backend bằng Docker
docker build -t 235879_nguyennhatduy/backend:latest ./backend
docker run -d -p 5000:5000 --env-file ./backend/.env 235879_nguyennhatduy/backend:latest

## Hướng dẫn chạy Frontend bằng Docker
docker build -t 235879_nguyennhatduy/frontend:latest ./frontend
docker run -d -p 80:80 235879_nguyennhatduy/frontend:latest
