# Sử dụng Node.js image
FROM node:16

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Mở cổng cần thiết
EXPOSE 8000

# Lệnh để chạy ứng dụng
CMD ["npm", "run", "start:dev"]