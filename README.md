# Hệ thống Khảo thí & Thi Trắc nghiệm Trực tuyến (Web Exams)

Dự án Kết thúc học phần môn Phát triển Ứng dụng Web — Hệ thống quản lý ngân hàng câu hỏi, tổ chức thi trắc nghiệm trực tuyến và chấm điểm tự động phân quyền 3 vai trò (`student`, `teacher`, `admin`).

---

## 1. Công nghệ sử dụng

- **Frontend (`client/`):** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons.
- **Backend (`server/`):** Node.js, Express, TypeScript, MySQL2 (`mysql2/promise` Connection Pool), JWT (`jsonwebtoken`), `bcryptjs`.
- **Cơ sở dữ liệu:** MySQL (`quiz_web_db` gồm 5 bảng: `users`, `subjects`, `exams`, `questions`, `exam_attempts`).

---

## 2. Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Khởi tạo Cơ sở dữ liệu & Backend (`server/`)
```bash
cd server
npm install
# Chỉnh sửa thông tin kết nối MySQL trong file .env (mặc định: root / mật khẩu trống)
npm run seed
npm run dev
```
Backend sẽ chạy tại `http://localhost:5000`.

### Bước 2: Khởi chạy Frontend (`client/`)
```bash
cd client
npm install
npm run dev
```
Frontend sẽ chạy tại `http://localhost:5173`.

---

## 3. Tài khoản Mẫu (Mật khẩu mặc định: `123456`)

| Vai trò | Email đăng nhập | Họ và tên |
| :--- | :--- | :--- |
| **Quản trị viên (`admin`)** | `admin@edu.vn` | Quản Trị Viên Hệ Thống |
| **Giảng viên 1 (`teacher`)** | `gv.an@edu.vn` | TS. Nguyễn Văn An |
| **Giảng viên 2 (`teacher`)** | `gv.binh@edu.vn` | ThS. Trần Thị Bình |
| **Sinh viên (`student`)** | `sv.bach@edu.vn` | Phạm Việt Bách |

---

## 4. Tài liệu Dự án
- [Tiến trình & Cấu trúc Dự án (PROCESSION.md)](./docs/PROCESSION.md)
- [Quy tắc Lập trình (RULE_CODE.md)](./docs/RULE_CODE.md)
