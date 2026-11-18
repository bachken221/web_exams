# TIẾN TRÌNH & CẤU TRÚC DỰ ÁN WEB THI TRẮC NGHIỆM (PROCESSTION)

Tài liệu này quản lý cấu trúc thư mục chuẩn doanh nghiệp, thiết kế cơ sở dữ liệu phân quyền 3 cấp (`student`, `teacher`, `admin`), lộ trình thực hiện từng giai đoạn và quy trình kiểm soát lỗi của dự án.

---

## 1. CẤU TRÚC THƯ MỤC CHUẨN (CHUẨN PHÂN QUYỀN & TÁCH ROUTE)

Dự án được chia làm 2 thư mục độc lập `client` (Frontend) và `server` (Backend). Phần Frontend được tổ chức bài bản với `layouts/`, `routes/` (tách biệt Public, Private, Role-based), `hooks/` (tái sử dụng logic sạch sẽ) và `pages/` chia theo đúng 3 phân hệ người dùng.

```
quiz-web-app/
├── client/                                 # FRONTEND (React + Vite + TS + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── assets/                         # Hình ảnh tĩnh, logo trường/hệ thống
│   │   ├── components/                     # Các UI Component tái sử dụng
│   │   │   ├── common/                     # Button, Modal, ConfirmModal, Pagination, LoadingSpinner, AlertBanner
│   │   │   └── navigation/                 # Navbar (Dùng chung cho cả 3 roles Student/Teacher/Admin, có khóa phòng thi)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx             # Quản lý state user, role, token, hàm login/logout/updateCurrentUser
│   │   ├── hooks/                          # CUSTOM HOOKS TÁI SỬ DỤNG (CLEAN CODE)
│   │   │   ├── useAsyncData.ts             # Chuẩn hóa vòng đời gọi API (data, loading, error, reload)
│   │   │   ├── useNotification.ts          # Quản lý thông báo lỗi/thành công tập trung
│   │   │   ├── usePagination.ts            # Tái sử dụng logic phân trang cho mọi bảng dữ liệu
│   │   │   ├── useCountdown.ts             # Đồng hồ đếm ngược chuẩn xác theo mốc endTimeMs
│   │   │   └── useExamSession.ts           # Đóng gói toàn bộ nghiệp vụ làm bài, lưu tạm & bảo vệ phòng thi
│   │   ├── layouts/                        # Khung giao diện đồng nhất cho cả 3 phân quyền
│   │   │   ├── AuthLayout.tsx              # Khung giao diện trang Đăng nhập / Đăng ký
│   │   │   ├── StudentLayout.tsx           # Khung giao diện Sinh viên (Navbar ngang + max-w-7xl + Footer)
│   │   │   ├── TeacherLayout.tsx           # Khung giao diện Giảng viên (Đồng bộ Navbar ngang + max-w-7xl + Footer)
│   │   │   └── AdminLayout.tsx             # Khung giao diện Quản trị viên (Đồng bộ Navbar ngang + max-w-7xl + Footer)
│   │   ├── routes/                         # QUẢN LÝ ĐỊNH TUYẾN & PHÂN QUYỀN (ENTERPRISE STANDARD)
│   │   │   ├── AppRoutes.tsx               # Tổng hợp tất cả các nhánh route của ứng dụng
│   │   │   ├── PublicRoute.tsx             # Route công khai (Nếu đã login thì tự đẩy về trang chủ theo role)
│   │   │   ├── PrivateRoute.tsx            # Kiểm tra đăng nhập (Chưa login -> đẩy về /login)
│   │   │   ├── RoleBasedRoute.tsx          # Kiểm tra quyền hạn (allowedRoles: ['admin', 'teacher', 'student'])
│   │   │   ├── studentRoutes.tsx           # Khai báo danh sách route riêng của Sinh viên
│   │   │   ├── teacherRoutes.tsx           # Khai báo danh sách route riêng của Giảng viên
│   │   │   └── adminRoutes.tsx             # Khai báo danh sách route riêng của Admin
│   │   ├── pages/                          # Các trang màn hình chính chia theo phân hệ
│   │   │   ├── common/                     # ProfilePage (Hồ sơ cá nhân & Đổi mật khẩu dùng chung 3 roles)
│   │   │   ├── public/                     # LandingPage, LoginPage, RegisterPage, Forbidden403, NotFound404
│   │   │   ├── student/                    # Dashboard, ExamList, ExamRoom (Phòng thi), ExamResult, ExamHistory
│   │   │   ├── teacher/                    # TeacherDashboard, MyExams (CRUD Đề), QuestionBank (CRUD Câu hỏi), StudentResults (Thống kê điểm)
│   │   │   └── admin/                      # AdminDashboard, UserManagement (CRUD User/Cấp quyền), SubjectManagement (CRUD Môn học), AllExamsMonitor
│   │   ├── services/                       # Tầng giao tiếp API (Tách theo từng module nghiệp vụ)
│   │   │   ├── axiosClient.ts              # Cấu hình Axios gốc, gắn Bearer Token & bắt lỗi 401/403
│   │   │   ├── authService.ts              # API đăng nhập, đăng ký, lấy profile, cập nhật hồ sơ, đổi mật khẩu
│   │   │   ├── subjectService.ts           # API môn học
│   │   │   ├── examService.ts              # API đề thi & làm bài
│   │   │   ├── questionService.ts          # API ngân hàng câu hỏi
│   │   │   └── userService.ts              # API quản lý người dùng & thống kê
│   │   ├── types/                          # Khai báo TypeScript Interface rõ ràng
│   │   │   ├── auth.types.ts
│   │   │   ├── exam.types.ts
│   │   │   └── user.types.ts
│   │   ├── utils/
│   │   │   ├── error.ts                    # Hàm getErrorMessage chuẩn hóa bóc tách lỗi từ Axios
│   │   │   ├── formatTime.ts               # Đổi giây sang MM:SS & định dạng ngày giờ VN
│   │   │   └── storage.ts                  # Xử lý localStorage / sessionStorage an toàn
│   │   ├── App.tsx                         # Bọc AuthProvider và gọi AppRoutes
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
└── server/                                 # BACKEND (Express + TS + MySQL2)
    ├── src/
    │   ├── config/
    │   │   ├── db.ts                       # Kết nối MySQL bằng mysql2/promise (Connection Pool)
    │   │   └── initDb.ts                   # Script tự động khởi tạo CSDL và nạp dữ liệu mẫu
    │   ├── controllers/
    │   │   ├── authController.ts           # Đăng ký, Đăng nhập, Lấy/Cập nhật hồ sơ, Đổi mật khẩu
    │   │   ├── subjectController.ts        # CRUD Môn học (Admin quản lý, Teacher/Student xem)
    │   │   ├── examController.ts           # CRUD Đề thi (Teacher tạo đề của mình, Admin quản lý tất cả)
    │   │   ├── questionController.ts       # CRUD Câu hỏi (Teacher quản lý câu hỏi thuộc đề của mình)
    │   │   ├── attemptController.ts        # Sinh viên bắt đầu thi, nộp bài, chấm điểm tự động
    │   │   └── userController.ts           # Admin quản lý tài khoản, cấp quyền Giảng viên, khóa user, thống kê
    │   ├── middlewares/
    │   │   └── authMiddleware.ts           # verifyToken (xác thực JWT) & authorizeRoles('admin', 'teacher')
    │   ├── routes/
    │   │   ├── authRoutes.ts
    │   │   ├── subjectRoutes.ts
    │   │   ├── examRoutes.ts
    │   │   ├── questionRoutes.ts
    │   │   ├── attemptRoutes.ts
    │   │   └── userRoutes.ts
    │   ├── types/
    │   │   └── express.d.ts                # Gắn thêm thông tin req.user (id, role) cho Express
    │   └── index.ts                        # Khởi tạo server Express & gắn tổng hợp routes
    ├── database.sql                        # File script tạo bảng và dữ liệu mẫu 3 roles
    ├── .env
    ├── package.json
    └── tsconfig.json
```

---

## 2. MA TRẬN PHÂN QUYỀN (RBAC) & THIẾT KẾ CƠ SỞ DỮ LIỆU (MySQL)

### 2.1. Ma trận phân quyền 3 vai trò (Role-Based Access Control)

| Chức năng / Nghiệp vụ | Sinh viên (`student`) | Giảng viên (`teacher`) | Quản trị viên (`admin`) |
| :--- | :---: | :---: | :---: |
| Đăng ký / Đăng nhập / Xem hồ sơ cá nhân (Họ tên & Email cố định chỉ xem) / Đổi mật khẩu | Có | Có | Có |
| Quản lý Người dùng (Thêm tài khoản GV, Sửa thông tin, Đặt lại mật khẩu, Khóa/Mở khóa, Đổi Role) | Không | Không | **Toàn quyền (CRUD)** |
| Quản lý Môn học / Học phần (`subjects`) | Chỉ xem | Chỉ xem | **Toàn quyền (CRUD)** |
| Quản lý Đề thi (`exams`) | Chỉ xem đề đang mở | **CRUD đề do mình tạo** | Xem tất cả, Ẩn/Xóa đề vi phạm |
| Quản lý Câu hỏi (`questions`) | Không (Chỉ xem khi thi) | **CRUD câu hỏi thuộc đề mình** | Xem tất cả câu hỏi |
| Tham gia làm bài thi & Nộp bài (`exam_attempts`) | **Có** | Không (Có thể xem thử đề) | Không |
| Xem lịch sử & bảng điểm | Xem lịch sử cá nhân | Xem bảng điểm các đề mình tạo | Xem thống kê toàn hệ thống |

### 2.2. Thiết kế 5 bảng CSDL (MySQL)

1. **`users`**:
   - `id`, `full_name`, `email`, `password`, `role` (`ENUM('student', 'teacher', 'admin') DEFAULT 'student'`), `is_locked` (`BOOLEAN DEFAULT FALSE`), `created_at`.
2. **`subjects` (Môn học)**:
   - `id`, `code` (Mã môn, VD: `INT3306`), `name` (Tên môn), `description`, `created_at`.
3. **`exams` (Đề thi - Có gắn ID Giảng viên tạo đề)**:
   - `id`, `subject_id`, `created_by` (Khóa ngoại tham chiếu `users.id` của Giảng viên/Admin tạo đề), `title`, `description`, `duration_minutes`, `pass_score`, `is_published`, `created_at`.
4. **`questions` (Câu hỏi & 4 Đáp án)**:
   - `id`, `exam_id`, `content`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option` (`'A'` | `'B'` | `'C'` | `'D'`), `explanation`.
5. **`exam_attempts` (Lượt làm bài & Kết quả)**:
   - `id`, `user_id` (Sinh viên làm bài), `exam_id`, `score` (Thang điểm 10), `total_correct`, `total_questions`, `user_answers` (JSON lưu đáp án đã chọn), `started_at`, `submitted_at`.

---

## 3. LỘ TRÌNH THỰC HIỆN DỰ ÁN (6 GIAI ĐOẠN)

### Giai đoạn 1: Khởi tạo Database & Khung Dự Án
- [x] Viết `database.sql` tạo 5 bảng với đầy đủ khóa ngoại và thêm dữ liệu mẫu (1 Admin, 2 Giảng viên, 3 Sinh viên, 3 Môn học, 3 Đề thi hoàn chỉnh).
- [x] Khởi tạo `server` (Express + TypeScript) và `client` (React + Vite + TypeScript + Tailwind CSS).
- [x] Cấu hình kết nối MySQL Pool và kiểm tra API health-check.

### Giai đoạn 2: Hệ thống Định tuyến (Routing) & Xác thực Phân quyền (RBAC)
- [x] **BE:** Xây dựng API `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/profile`, `/api/auth/change-password`. Viết middleware `verifyToken` và `authorizeRoles(...allowedRoles)`.
- [x] **FE:** Xây dựng `AuthContext`, `PublicRoute`, `PrivateRoute`, và `RoleBasedRoute`.
- [x] **Tự động điều hướng sau khi Login:**
  - Nếu `role === 'admin'` -> chuyển hướng tới `/admin/dashboard`
  - Nếu `role === 'teacher'` -> chuyển hướng tới `/teacher/dashboard`
  - Nếu `role === 'student'` -> chuyển hướng tới `/student/dashboard`
- [x] Xây dựng trang `/403` (Forbidden - Không có quyền truy cập), `/404` (Not Found) và trang Hồ sơ cá nhân (`ProfilePage` - Họ tên & Email ở trạng thái cố định chỉ xem `disabled/readOnly`, chỉ cho phép đổi mật khẩu; việc sửa họ tên/email do Admin quản lý) cho cả 3 vai trò.

### Giai đoạn 3: Xây dựng Phân hệ Quản trị viên (Admin Portal)
- [x] Thiết kế `AdminLayout` đồng nhất bố cục thanh điều hướng ngang (`Navbar` + khung `max-w-7xl` nền `#F8F9FA`) như trang Sinh viên.
- [x] **Dashboard Admin (`/admin/dashboard`):** Banner chào mừng, 4 thẻ chỉ số chính, biểu đồ phân bố phổ điểm toàn trường, thống kê chất lượng theo từng học phần và xem chi tiết phiếu trả lời của sinh viên.
- [x] **CRUD Người dùng (`/admin/users`):** Xem danh sách kèm mức độ hoạt động, lọc theo Role/Trạng thái khóa, cấp tài khoản mới, chỉnh sửa thông tin, đặt lại mật khẩu, Khóa / Mở khóa tài khoản.
- [x] **CRUD Môn học (`/admin/subjects`):** Thêm mã môn, tên môn, sửa, xóa môn học và xem danh sách đề thi thuộc từng môn.
- [x] **Giám sát Đề thi (`/admin/exams`):** Xem toàn bộ đề thi của tất cả giảng viên, kiểm duyệt danh sách câu hỏi & đáp án, xem bảng điểm sinh viên, hỗ trợ gỡ bỏ hoặc khóa đề thi.

### Giai đoạn 4: Xây dựng Phân hệ Giảng viên (Teacher Portal)
- [x] Thiết kế `TeacherLayout` đồng nhất bố cục thanh điều hướng ngang (`Navbar` + khung `max-w-7xl` nền `#F8F9FA`) và tông màu `teal-700` xuyên suốt với trang Sinh viên.
- [x] **Dashboard Giảng viên (`/teacher/dashboard`):** Banner chào mừng, 4 thẻ thống kê học thuật, lưới thẻ đề thi đang phụ trách và bảng kết quả nộp bài gần đây của sinh viên.
- [x] **CRUD Đề thi của tôi (`/teacher/exams`):** Bộ lọc theo học phần, tìm kiếm, thẻ đề thi 2 cột đồng nhất với `ExamList`, tạo/sửa/đóng/mở/xóa đề thi của chính mình.
- [x] **CRUD Ngân hàng Câu hỏi (`/teacher/exams/:examId/questions`):** Thêm/Sửa/Xóa câu hỏi, 4 lựa chọn A/B/C/D và giải thích chi tiết cho từng đề thi.
- [x] **Quản lý Kết quả Sinh viên (`/teacher/exams/:examId/results`):** Xem danh sách sinh viên đã làm đề thi đó, điểm số, thời gian nộp bài và chi tiết bài làm của từng sinh viên.

### Giai đoạn 5: Xây dựng Phân hệ Sinh viên & Phòng Thi Trực Tuyến (Student Portal)
- [x] Thiết kế `StudentLayout` (Thanh điều hướng ngang gọn gàng, tự động khóa chuyển trang khi đang trong phòng thi).
- [x] **Danh sách Đề thi (`/student/exams`):** Tìm kiếm đề theo tên hoặc mã môn học, xem thông tin đề thi trước khi vào phòng thi.
- [x] **Phòng Thi Trực Tuyến (`/student/exams/:examId/take`):**
  - Hiển thị câu hỏi rõ ràng, hỗ trợ chọn đáp án, chuyển câu nhanh và đánh dấu câu hỏi cần xem lại.
  - Đồng hồ đếm ngược thời gian thực (`useCountdown`), tự động thu bài khi hết giờ.
  - Lưu tạm đáp án vào `sessionStorage` (`useExamSession`) để chống mất bài khi lỡ tay nhấn F5.
  - Khóa thanh điều hướng `Navbar`, chặn nút Back trình duyệt (`popstate`) và cảnh báo đóng tab (`beforeunload`) trong suốt thời gian làm bài; chỉ cho phép rời phòng thi sau khi nộp bài.
- [x] **Trang Kết quả & Lịch sử (`/student/results/:attemptId`, `/student/history`):** Chấm điểm tự động ở Backend, hiển thị điểm số, trạng thái Đạt/Trượt và xem lại đáp án đúng kèm lời giải thích của Giảng viên.

### Giai đoạn 6: Tối ưu Clean Code Frontend, Kiểm thử Phân quyền & Hoàn thiện Đồ án
- [x] **Tối ưu Clean Code & Custom Hooks tái sử dụng (`client/src/hooks/`):**
  - Xây dựng `useAsyncData` chuẩn hóa việc gọi API bất đồng bộ (tự động quản lý `loading`, `error`, `data`, `reload` và xử lý `403 Forbidden`), loại bỏ code `try...catch...finally` lặp lại ở các trang.
  - Xây dựng `useNotification` và `utils/error.ts` (`getErrorMessage`) để quản lý thông báo lỗi/thành công thống nhất.
  - Xây dựng `usePagination` tái sử dụng logic phân trang cho tất cả các bảng dữ liệu lớn (`UserManagement`, `ExamHistory`, `StudentResults`).
  - Xây dựng `useCountdown` và `useExamSession` tách biệt hoàn toàn logic phòng thi khỏi giao diện `ExamRoom.tsx`.
  - Xây dựng `ConfirmModal.tsx` (hỗ trợ bảng tóm tắt thông tin `details` và phân lớp `z-[60]`) áp dụng cho **toàn bộ các nút nhấn quan trọng** trên cả 3 phân hệ:
    - **Sinh viên:** Popup xác nhận trước khi vào phòng thi / thi lại (`Dashboard`, `ExamList`, `ExamResult`, `ExamHistory` - hiển thị tóm tắt học phần, thời gian, số câu, điểm đạt) và xác nhận nộp bài thi (`ExamRoom`).
    - **Giảng viên:** Popup xác nhận tạo mới / cập nhật đề thi, mở / tạm đóng đề thi, xóa đề thi (`MyExams`); xác nhận thêm / sửa / xóa câu hỏi (`QuestionBank`).
    - **Quản trị viên:** Popup xác nhận tạo tài khoản mới, lưu chỉnh sửa thông tin / đặt lại mật khẩu, khóa / mở khóa tài khoản, xóa tài khoản (`UserManagement`); thêm / sửa / xóa học phần (`SubjectManagement`); mở / đóng và gỡ bỏ đề thi (`AllExamsMonitor`).
    - **Tài khoản & Chung:** Popup xác nhận đổi mật khẩu đăng nhập (`ProfilePage`) và xác nhận đăng xuất khỏi hệ thống (`Navbar`).
- [x] **Đồng bộ hóa Giao diện (UI/UX Unification) cho cả 3 vai trò (`Student`, `Teacher`, `Admin`):**
  - Thống nhất `StudentLayout`, `TeacherLayout` và `AdminLayout` cùng sử dụng thanh điều hướng ngang `Navbar.tsx` (tự động hiển thị các mục menu theo `user.role`), nền `#F8F9FA`, khung nội dung chuẩn `max-w-7xl` và chân trang (`Footer`) đồng bộ.
  - Chuẩn hóa cấu trúc hiển thị ở tất cả các trang quản trị và giảng viên theo mẫu của trang Sinh viên: Khung Banner chào mừng / Khung tiêu đề trắng (`bg-white border border-slate-200 rounded-md p-5`), 4 thẻ thống kê chỉ số phẳng, thanh công cụ lọc theo học phần/vai trò với nút điểm nhấn `bg-teal-700`, lưới thẻ đề thi 2 cột và bảng dữ liệu có phân trang.
  - Loại bỏ hoàn toàn các thuật ngữ kỹ thuật/mô tả kiến trúc khỏi văn bản hiển thị trên giao diện người dùng, mang lại trải nghiệm như một cổng khảo thí đại học thực tế.
- [x] Kiểm thử chéo quyền hạn (Sinh viên cố tình gõ URL `/teacher/exams` hoặc `/admin/users` phải bị chặn ở cả FE và BE).
- [x] Rà soát giao diện Responsive và hoàn thiện tài liệu báo cáo.

---

## 4. QUY TRÌNH BÁO LỖI, XỬ LÝ LỖI & NHẬT KÝ BUG (ERROR HANDLING)

### 4.1. Quy chuẩn xử lý lỗi phân quyền & API
- **Lỗi `401 Unauthorized` (Chưa đăng nhập hoặc Token hết hạn):** `axiosClient` tự động xóa dữ liệu trong `localStorage` và điều hướng người dùng về `/login`.
- **Lỗi `403 Forbidden` (Sai quyền truy cập hoặc Giảng viên A cố sửa đề của Giảng viên B):**
  - Ở Frontend: `RoleBasedRoute` và hook `useAsyncData` (`onForbidden`) tự động chuyển hướng sang trang `/403` (Trang thông báo "Bạn không có quyền truy cập khu vực này").
  - Ở Backend: Middleware kiểm tra cả `req.user.role` và quyền sở hữu (`exam.created_by === req.user.id`), trả về mã `403` kèm thông báo rõ ràng.
- **Lỗi `400 Bad Request` & `500 Server Error`:** Bóc tách qua hàm `getErrorMessage()` và hiển thị thông báo bằng `AlertBanner` màu đỏ trầm (`bg-rose-50 border border-rose-200 text-rose-700`) ngay trên giao diện.

### 4.2. Các tình huống lỗi nghiệp vụ quan trọng cần chặn
1. **Giảng viên chỉnh sửa hoặc xóa đề thi của Giảng viên khác:**
   - *Cách chặn:* Trong `examController.ts` và `questionController.ts`, luôn kiểm tra `SELECT created_by FROM exams WHERE id = ?`. Nếu `req.user.role === 'teacher'` và `created_by !== req.user.id` thì trả về lỗi `403 Forbidden`.
2. **Sinh viên dùng F12 (Network Tab) để xem đáp án đúng khi đang thi:**
   - *Cách chặn:* API lấy câu hỏi cho phòng thi (`GET /api/attempts/exam/:examId/questions`) chỉ `SELECT id, content, option_a, option_b, option_c, option_d`, tuyệt đối không lấy cột `correct_option` và `explanation`.
3. **Sinh viên F5 trình duyệt khi đang làm bài thi:**
   - *Cách chặn:* Hook `useExamSession` đồng bộ đáp án đang chọn, danh sách câu đánh dấu và mốc `endTimeMs` vào `sessionStorage`. Khi trang tải lại, khôi phục nguyên vẹn trạng thái làm bài.
4. **Sinh viên chuyển sang các mục/trang khác khi đang làm bài thi:**
   - *Cách chặn:* `Navbar` kiểm tra đường dẫn phòng thi (`/student/exams/:examId/take`), tự động khóa toàn bộ các liên kết điều hướng và nút đăng xuất, đồng thời hiển thị cảnh báo quy chế phòng thi. Hook `useExamSession` chặn thêm sự kiện `popstate` (nút Back trình duyệt) và `beforeunload` (đóng tab), bắt buộc sinh viên phải nộp bài mới được rời phòng thi.
5. **Người dùng tự ý thay đổi Họ tên và Email định danh trong trang Hồ sơ:**
   - *Cách chặn:* Tại trang `ProfilePage.tsx`, hai trường `Họ và tên` và `Địa chỉ Email` được khóa ở trạng thái chỉ xem (`disabled` & `readOnly`) để tránh việc sinh viên tự đổi họ tên/email giả danh người khác khi dự thi; mọi thay đổi thông tin định danh do Quản trị viên (`Admin`) thực hiện tại trang Quản lý Tài khoản.

### 4.3. Nhật ký Theo dõi & Khắc phục Lỗi (Bug Tracking Log)

| Mã lỗi | Phân hệ | Mô tả hiện tượng lỗi | Nguyên nhân | Giải pháp khắc phục & Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `BUG-01` | FE - Routing | Khi đang ở trang `/teacher/exams` nhấn F5 bị văng về `/login` dù đã đăng nhập | Do `AuthContext` chưa kịp đọc xong token từ `localStorage` (state `loading` ban đầu chưa được chờ trong `PrivateRoute`) | **Đã khắc phục:** Kiểm tra `if (isLoading) return <LoadingSpinner />` trong `PrivateRoute` và `RoleBasedRoute`. |
| `BUG-02` | BE - Permission | Giảng viên A gọi API xóa/sửa được câu hỏi trong đề của Giảng viên B | Controller câu hỏi mới chỉ kiểm tra `role === 'teacher'` mà quên kiểm tra `exam.created_by === req.user.id` | **Đã khắc phục:** Bổ sung truy vấn JOIN bảng `exams` để kiểm tra `created_by` trong mọi hàm của `questionController.ts` và `examController.ts`. |
| `BUG-03` | FE - Phòng thi | Đồng hồ đếm ngược chạy lệch nhịp hoặc tạo lại `setInterval` liên tục mỗi giây | Đưa `remainingSeconds` vào dependency array của `useEffect` khiến bộ đếm bị khởi tạo lại mỗi giây | **Đã khắc phục:** Tách custom hook `useCountdown.ts` tính toán thời gian còn lại dựa trên mốc `endTimeMs` cố định với duy nhất 1 `setInterval`. |
| `BUG-04` | FE - Phòng thi | Khi đang làm bài thi, sinh viên vẫn có thể bấm thanh menu `Navbar` chuyển sang trang khác hoặc hộp thoại `window.confirm` khi nộp bài bị trình duyệt chặn | `Navbar` chưa kiểm tra trạng thái đang thi và `window.confirm` bị chặn trên một số môi trường webview | **Đã khắc phục:** Khóa điều hướng trên `Navbar` khi khớp route `/student/exams/:examId/take`, chặn `popstate`/`beforeunload` trong `useExamSession.ts`, và thay thế `window.confirm` bằng component `<ConfirmModal />`. |
| `BUG-05` | FE - Clean Code | Code gọi API (`loading`, `error`, `try...catch`) và phân trang bị viết lặp lại ở nhiều trang | Chưa tách các custom hooks dùng chung | **Đã khắc phục:** Tách bộ custom hooks `useAsyncData`, `useNotification`, `usePagination`, `useCountdown`, `useExamSession` tại `client/src/hooks/`. |
| `BUG-06` | FE - UI/UX | Giao diện trang Giảng viên và Quản trị viên (dùng Sidebar tối màu) bị lệch tông và thiếu đồng nhất so với trang Sinh viên | Mỗi phân hệ đang dùng một kiểu khung bố cục và màu nút khác nhau; văn bản trên UI còn lẫn thuật ngữ kỹ thuật | **Đã khắc phục:** Đồng bộ `TeacherLayout` và `AdminLayout` sang dùng chung thanh điều hướng ngang `Navbar`, khung `max-w-7xl`, thẻ tiêu đề trắng, bộ lọc học phần/vai trò và tông màu `teal-700` thống nhất với trang Sinh viên. |
| `BUG-07` | FE - UX Safety | Các thao tác quan trọng (vào phòng thi, tạo đề, mở/khóa đề thi, khóa/mở tài khoản, đổi mật khẩu, đăng xuất) thực thi ngay lập tức khi bấm nhầm | Chưa có bước xác nhận trung gian cho các hành động làm thay đổi trạng thái quan trọng | **Đã khắc phục:** Nâng cấp `ConfirmModal.tsx` kèm bảng tóm tắt thông tin chi tiết (`details`) và tích hợp bước xác nhận Popup cho toàn bộ thao tác quan trọng ở cả 3 vai trò. |
| `BUG-08` | FE - Modal UI | Lớp nền mờ (`backdrop`) của `Modal` và `ConfirmModal` bị hở một khoảng trắng ở mép trên cùng của màn hình | Component Modal được đặt trực tiếp bên trong thẻ `div` dùng class `space-y-5`/`space-y-6` của Tailwind khiến phần tử `fixed inset-0` bị cộng thêm `margin-top: 1.5rem` | **Đã khắc phục:** Sử dụng `createPortal(..., document.body)` kết hợp `fixed inset-0 !m-0` tại `Modal.tsx` và `ConfirmModal.tsx` để lớp phủ luôn che kín 100% toàn màn hình. |
