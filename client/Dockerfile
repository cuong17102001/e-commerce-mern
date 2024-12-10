# Sử dụng image Node.js để xây dựng ứng dụng
FROM node:16 AS build

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Xây dựng ứng dụng
RUN npm run build

# Sử dụng image nginx để phục vụ ứng dụng
FROM nginx:alpine

# Sao chép các tệp xây dựng vào thư mục phục vụ của nginx
COPY --from=build /app/build /usr/share/nginx/html

# Cấu hình cổng cho nginx
EXPOSE 80

# Khởi động nginx
CMD ["nginx", "-g", "daemon off;"]