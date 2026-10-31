# 235879_NguyenNhatDuy
## Hướng dẫn chạy Backend bằng Docker
docker build -t 235879_nguyennhatduy/backend:latest ./backend
docker run -d -p 5000:5000 --env-file ./backend/.env 235879_nguyennhatduy/backend:latest
