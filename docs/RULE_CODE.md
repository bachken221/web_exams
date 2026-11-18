# QUY TẮC LẬP TRÌNH DỰ ÁN WEB THI TRẮC NGHIỆM (RULE_CODE)

Tài liệu này định nghĩa các quy chuẩn viết code cho dự án cuối kì môn Lập trình Web. **Yêu cầu AI Agent hoặc thành viên nhóm tuân thủ tuyệt đối** để đảm bảo kiến trúc phân tầng rõ ràng như một ứng dụng doanh nghiệp thực tế, nhưng code bên trong vẫn giữ sự tường minh, dễ hiểu và đúng chuẩn đồ án sinh viên.

---

## 1. TRIẾT LÝ CODE ("KIẾN TRÚC DOANH NGHIỆP - LOGIC SINH VIÊN")
- **Tổ chức file chuẩn doanh nghiệp:** Tách bạch rõ ràng giữa `layouts/`, `routes/`, `pages/`, `components/`, `services/` và `types/`. Không viết lẫn lộn code gọi API trực tiếp bằng đường dẫn cứng rải rác khắp nơi.
- **Logic bên trong đơn giản & Tường minh (KISS):** Dù cấu trúc thư mục chuyên nghiệp, code xử lý bên trong từng file phải dễ đọc, dễ giải thích khi bảo vệ đồ án.
- **Hạn chế thư viện nâng cao:** Tự xây dựng các thành phần UI (Modal, Dropdown, Pagination, Tabs, Alert) bằng HTML + Tailwind CSS và State của React.
- **TypeScript rõ ràng:** Khai báo `interface` đầy đủ cho từng đối tượng (`User`, `Subject`, `Exam`, `Question`, `ExamAttempt`). Không dùng các kỹ thuật Generic phức tạp.
- **Comment tiếng Việt:** Ghi chú ngắn gọn ở các đoạn kiểm tra phân quyền, chấm điểm, đếm ngược thời gian.

---

## 2. QUY TẮC FRONTEND (React + Tailwind CSS + TypeScript)

### 2.1. Công nghệ & Thư viện được phép dùng
- **Khởi tạo:** Vite (`react-ts`).
- **Routing:** `react-router-dom` (v6).
- **Gọi API:** `axios` (thông qua `services/axiosClient.ts` và các file service theo từng phân hệ).
- **Quản lý State:** Chỉ dùng `useState`, `useEffect`, và `useContext` (`AuthContext`). **CẤM** dùng Redux, Zustand, React Query.
- **Quản lý Form:** Sử dụng Controlled Components bằng `useState` truyền thống và tự viết hàm kiểm tra dữ liệu (`validateForm()`). **CẤM** dùng Formik, React Hook Form, Zod, Yup.
- **Icons:** `lucide-react`.

### 2.2. Quy chuẩn Tổ chức Route & Phân quyền (BẮT BUỘC TUÂN THỦ)
Toàn bộ định tuyến phải nằm trong thư mục `src/routes/` và chia thành 3 lớp bảo vệ rõ ràng:
1. **`PublicRoute.tsx`:** Dành cho trang `/login`, `/register`. Nếu người dùng **đã đăng nhập**, tự động điều hướng về đúng trang chủ của Role đó (`/admin/dashboard`, `/teacher/dashboard`, hoặc `/student/dashboard`).
2. **`PrivateRoute.tsx`:** Kiểm tra xem người dùng đã đăng nhập chưa (`isAuthenticated`).
   - *Lưu ý quan trọng:* Phải kiểm tra `if (isLoading) return <LoadingSpinner />;` trước khi kiểm tra `user` để tránh lỗi nhấn F5 bị văng ra trang Login.
3. **`RoleBasedRoute.tsx`:** Nhận prop `allowedRoles: Array<'student' | 'teacher' | 'admin'>`.
   - Nếu `user.role` nằm trong `allowedRoles` -> Cho phép hiển thị `<Outlet />`.
   - Nếu không khớp quyền -> Điều hướng sang `<Navigate to="/403" replace />`.
4. **Tách Layout theo từng phân hệ:**
   - Nhánh `/student/*` bọc trong `<StudentLayout />`.
   - Nhánh `/teacher/*` bọc trong `<TeacherLayout />`.
   - Nhánh `/admin/*` bọc trong `<AdminLayout />`.

### 2.3. Quy chuẩn tầng Services (Gọi API)
- Không gọi `axios.get('http://localhost:5000/...')` trực tiếp trong Component.
- Mọi lời gọi API phải đặt trong `src/services/` (Ví dụ: `examService.getMyExams()`, `userService.updateRole()`).
- Trong Component, khi gọi service luôn phải quản lý 2 state: `loading` và `error` trong khối `try...catch...finally`.

---

## 3. QUY TẮC UI/UX & PHONG CÁCH THIẾT KẾ (CHỐNG "MÙI AI")

Giao diện hướng tới phong cách **"Academic Paper & Enterprise Flat"** (Nghiêm túc, học thuật, sắc nét như hệ thống khảo thí đại học hoặc nền tảng Coursera/Canvas).

### 3.1. Các điều CẤM trong UI (Anti-AI Rules)
- **CẤM dùng màu Gradient xanh-tím** (`from-blue-500 to-purple-600`, `indigo`, `violet`).
- **CẤM dùng hiệu ứng Glassmorphism** (`backdrop-blur`, thẻ bán trong suốt) hoặc đổ bóng phát sáng màu mè.
- **CẤM bo góc quá tròn** (`rounded-3xl`) cho các khung bảng biểu, hoặc hiệu ứng phóng to (`hover:scale-105`) gây rối mắt.

### 3.2. Bảng màu nhận diện riêng cho từng Phân hệ
- **Màu nền chung (Background):** Trắng ngà ấm (`bg-[#F8F9FA]` hoặc `bg-stone-50`), khung nội dung trắng tinh (`bg-white`) có viền mảnh (`border border-slate-200`).
- **Phân hệ Sinh viên (`StudentLayout`):**
  - Thanh Navbar nền trắng (`bg-white border-b border-slate-200`), nút bấm chính màu **Xanh cổ vịt đậm** (`bg-teal-700 hover:bg-teal-800 text-white`).
- **Phân hệ Giảng viên (`TeacherLayout`):**
  - Sidebar bên trái màu **Xanh Slate đậm** (`bg-slate-800 text-slate-100`), điểm nhấn màu **Xanh ngọc (Teal)** thể hiện không gian học thuật, biên soạn đề thi.
- **Phân hệ Quản trị viên (`AdminLayout`):**
  - Sidebar bên trái màu **Đen xám than** (`bg-zinc-900 text-zinc-100`), điểm nhấn màu **Hổ phách (Amber)** (`bg-amber-600`) thể hiện quyền quản trị hệ thống.
- **Màu trạng thái chuẩn:**
  - Thành công / Đạt: `text-emerald-700 bg-emerald-50 border-emerald-200`
  - Cảnh báo / Đánh dấu câu hỏi (Flag): `text-amber-700 bg-amber-50 border-amber-200`
  - Lỗi / Không đạt / Xóa: `text-rose-700 bg-rose-50 border-rose-200`

---

## 4. QUY TẮC BACKEND (Node.js + Express + TypeScript + MySQL)

### 4.1. Công nghệ & Thư viện được phép dùng
- **Core:** `express`, `cors`, `dotenv`.
- **Database:** `mysql2` (sử dụng `mysql2/promise` với Connection Pool). **CẤM** dùng ORM (Prisma, TypeORM, Sequelize) để giữ nguyên các câu truy vấn SQL thuần phục vụ chấm đồ án.
- **Bảo mật:** `jsonwebtoken` (JWT) và `bcryptjs`.

### 4.2. Quy chuẩn Phân quyền & Kiểm tra Sở hữu ở Backend
- **Middleware phân quyền (`authMiddleware.ts`):**
  - `verifyToken`: Giải mã JWT, gắn `req.user = { id, email, role }`.
  - `authorizeRoles(...roles)`: Kiểm tra `roles.includes(req.user.role)`. Nếu sai quyền trả về `403 Forbidden`.
- **Kiểm tra quyền sở hữu dữ liệu (Ownership Check):**
  - Với vai trò `teacher`: Chỉ được phép Sửa / Xóa / Thêm câu hỏi vào những đề thi do chính giảng viên đó tạo (`exams.created_by === req.user.id`).
  - Với vai trò `admin`: Có quyền can thiệp trên toàn bộ dữ liệu.
- **Viết câu lệnh SQL an toàn:** Luôn sử dụng dấu `?` (Prepared Statements).
- **Cấu trúc JSON phản hồi thống nhất:**
  ```json
  {
    "success": true,
    "message": "Thao tác thành công",
    "data": {}
  }
  ```