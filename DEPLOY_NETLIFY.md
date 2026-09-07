# Hướng Dẫn Deploy Lên Netlify (Wedding Invitation)

Dự án thiệp cưới đã được cấu hình toàn diện để hoạt động 100% trên Netlify (bao gồm cả giao diện React Vite và hệ thống Serverless API tiếp nhận RSVP gửi về Make.com/Excel).

---

## 🚀 Cách 1: Deploy Tự Động Qua Git (GitHub / GitLab / Bitbucket) — Khuyên Dùng

1. Đẩy toàn bộ source code dự án lên repository GitHub (hoặc GitLab).
2. Đăng nhập vào [Netlify](https://app.netlify.com/) và chọn **"Add new site"** -> **"Import an existing project"**.
3. Chọn Git provider và repository của bạn.
4. Netlify sẽ tự động nhận diện file `netlify.toml` ở thư mục gốc với các thông số:
   - **Build command**: `npm --prefix client install && npm --prefix client run build`
   - **Publish directory**: `client/dist`
   - **Functions directory**: `netlify/functions`
5. Nhấn **"Deploy site"**.

---

## ⚡ Cách 2: Deploy Thủ Công (Kéo Thả Nhanh)

1. Chạy lệnh build ở thư mục client:
   ```bash
   cd client
   npm run build
   ```
2. Mở trình duyệt và truy cập [app.netlify.com/drop](https://app.netlify.com/drop).
3. Kéo toàn bộ thư mục `client/dist` thả vào khung trình duyệt.
4. Website sẽ online ngay lập tức với link dạng `https://your-site-name.netlify.app`.

---

## 💻 Cách 3: Deploy Bằng Netlify CLI

1. Chạy lệnh deploy:
   ```bash
   npx netlify deploy --prod
   ```
2. Làm theo hướng dẫn trên terminal để đăng nhập tài khoản Netlify và chọn site deploy.

---

## ⚙️ Cấu Hình Biến Môi Trường Trên Netlify (Environment Variables)

Vào **Site configuration** -> **Environment variables** trên Netlify Dashboard và thêm:

| Biến | Giá trị mẫu | Mô tả |
|---|---|---|
| `MAKE_WEBHOOK_URL` | `https://hook.eu2.make.com/your-webhook-id` | URL Webhook của kịch bản Make.com lưu danh sách khách vào Microsoft Excel |
| `NODE_VERSION` | `20` | Phiên bản Node.js cho quá trình build |

---

## 📁 Cấu Trúc File Netlify Trong Dự Án

- **`netlify.toml`** (Gốc): Cấu hình lệnh build, thư mục publish `client/dist`, serverless functions và các luật redirects SPA `/* -> /index.html`.
- **`netlify/functions/rsvp.js`**: Serverless function tiếp nhận RSVP khách mời, chuẩn hóa dữ liệu tiếng Việt (ICT UTC+7), và gửi về Make.com -> Excel mà không cần duy trì server Node.js riêng.
- **`netlify/functions/health.js`**: Serverless endpoint kiểm tra trạng thái hoạt động của hệ thống.
- **`client/public/_redirects`**: Đảm bảo điều hướng SPA hoạt động chuẩn xác, không bao giờ bị lỗi 404 khi tải lại trang.
