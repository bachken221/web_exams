-- =========================================================================
-- CƠ SỞ DỮ LIỆU HỆ THỐNG KHẢO THÍ & THI TRẮC NGHIỆM TRỰC TUYẾN (QUIZ WEB)
-- Phân quyền 3 cấp: student, teacher, admin
-- Mật khẩu mặc định của tất cả tài khoản mẫu: 123456
-- =========================================================================

CREATE DATABASE IF NOT EXISTS quiz_web_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quiz_web_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS exam_attempts;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Bảng Người dùng (users)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Môn học / Học phần (subjects)
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Đề thi (exams)
CREATE TABLE exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  created_by INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  pass_score DECIMAL(4,2) NOT NULL DEFAULT 5.00,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_exams_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Câu hỏi & 4 Đáp án (questions)
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  content TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500) NOT NULL,
  option_d VARCHAR(500) NOT NULL,
  correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
  explanation TEXT,
  CONSTRAINT fk_questions_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Lượt làm bài & Kết quả (exam_attempts)
CREATE TABLE exam_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_id INT NOT NULL,
  score DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  total_correct INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  user_answers JSON NOT NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempts_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- Mật khẩu tất cả tài khoản: 123456
-- =========================================================================

INSERT INTO users (id, full_name, email, password, role, is_locked) VALUES
(1, 'Quản Trị Viên Hệ Thống', 'admin@edu.vn', '$2a$10$tT1QqBKRW7icpOsPnvrPXuaQudy9Q4BgkisRVGPNJXI9VbRrGi9e.', 'admin', FALSE),
(2, 'TS. Nguyễn Văn An', 'gv.an@edu.vn', '$2a$10$tT1QqBKRW7icpOsPnvrPXuaQudy9Q4BgkisRVGPNJXI9VbRrGi9e.', 'teacher', FALSE),
(3, 'ThS. Trần Thị Bình', 'gv.binh@edu.vn', '$2a$10$tT1QqBKRW7icpOsPnvrPXuaQudy9Q4BgkisRVGPNJXI9VbRrGi9e.', 'teacher', FALSE),
(4, 'Phạm Việt Bách', 'sv.bach@edu.vn', '$2a$10$tT1QqBKRW7icpOsPnvrPXuaQudy9Q4BgkisRVGPNJXI9VbRrGi9e.', 'student', FALSE),
(5, 'Lê Hoàng Minh', 'sv.minh@edu.vn', '$2a$10$tT1QqBKRW7icpOsPnvrPXuaQudy9Q4BgkisRVGPNJXI9VbRrGi9e.', 'student', FALSE),
(6, 'Đỗ Phương Lan', 'sv.lan@edu.vn', '$2a$10$tT1QqBKRW7icpOsPnvrPXuaQudy9Q4BgkisRVGPNJXI9VbRrGi9e.', 'student', FALSE);

INSERT INTO subjects (id, code, name, description) VALUES
(1, 'INT3306', 'Phát triển Ứng dụng Web', 'Học phần cung cấp kiến thức về kiến trúc Client-Server, HTML/CSS/JS, React, RESTful API với Node.js/Express và bảo mật ứng dụng web.'),
(2, 'INT2208', 'Cơ sở Dữ liệu', 'Học phần trang bị kiến thức về mô hình dữ liệu quan hệ, đại số quan hệ, ngôn ngữ truy vấn SQL, chuẩn hóa cơ sở dữ liệu và giao dịch.'),
(3, 'INT2204', 'Lập trình Hướng đối tượng', 'Học phần trình bày 4 tính chất cốt lõi của OOP: Đóng gói, Kế thừa, Đa hình, Trừu tượng cùng các mẫu thiết kế cơ bản.');

INSERT INTO exams (id, subject_id, created_by, title, description, duration_minutes, pass_score, is_published) VALUES
(1, 1, 2, 'Đề thi Giữa kỳ: Kiến trúc Web, React & RESTful API', 'Bài kiểm tra đánh giá kiến thức về giao thức HTTP, React Hooks, định tuyến phân quyền và bảo mật JWT trong ứng dụng Web hiện đại.', 20, 5.00, TRUE),
(2, 2, 3, 'Đề thi Cuối kỳ: Hệ Quản trị Cơ sở Dữ liệu & SQL Chuẩn', 'Đánh giá kỹ năng thiết kế lược đồ quan hệ, khóa ngoại, truy vấn JOIN, GROUP BY và chống lỗ hổng SQL Injection.', 25, 5.00, TRUE),
(3, 3, 2, 'Bài kiểm tra Nhanh: Nguyên lý Lập trình Hướng đối tượng', 'Kiểm tra 15 phút về tính đóng gói, kế thừa, đa hình và interface.', 15, 6.00, TRUE);

-- Câu hỏi cho Đề thi số 1 (INT3306 - TS. Nguyễn Văn An)
INSERT INTO questions (exam_id, content, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(1, 'Trong kiến trúc RESTful API, mã trạng thái HTTP nào biểu thị người dùng ĐÃ đăng nhập nhưng KHÔNG đủ quyền truy cập vào tài nguyên?', '400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found', 'C', '401 Unauthorized dùng khi chưa xác thực (chưa đăng nhập hoặc token không hợp lệ), còn 403 Forbidden dùng khi đã xác thực danh tính nhưng vai trò (role) không có quyền truy cập tài nguyên.'),
(1, 'Trong React, Hook nào được sử dụng để thực thi các tác vụ phụ (side effects) như gọi API lấy dữ liệu hoặc thiết lập bộ đếm thời gian (setInterval)?', 'useState', 'useEffect', 'useContext', 'useMemo', 'B', 'useEffect cho phép thực hiện side effects sau khi component render và hỗ trợ hàm cleanup (như clearInterval) khi component unmount.'),
(1, 'Khi sử dụng cơ chế xác thực JWT (JSON Web Token), thông tin token thường được gửi từ Client lên Server ở phần nào của HTTP Request chuẩn?', 'Header Authorization với tiền tố Bearer', 'Truyền trực tiếp trên thanh URL dưới dạng Query String', 'Lưu cố định trong thẻ meta của file index.html', 'Gửi trong phần thân (Body) của mọi request GET', 'A', 'Chuẩn công nghiệp là gắn JWT vào HTTP Request Header: Authorization: Bearer <token>.'),
(1, 'Để ngăn chặn sinh viên gian lận xem đáp án qua tab Network (F12) khi đang làm bài thi, Backend cần xử lý như thế nào ở API lấy danh sách câu hỏi phòng thi?', 'Mã hóa đáp án bằng Base64 trước khi gửi về Client', 'Chỉ SELECT các cột nội dung câu hỏi và 4 phương án A, B, C, D; tuyệt đối không trả về cột correct_option', 'Ẩn cột đáp án bằng thuộc tính CSS display: none', 'Vô hiệu hóa chuột phải trên trình duyệt', 'B', 'Mọi dữ liệu trả về trong JSON của API đều có thể đọc được qua tab Network. Vì vậy Backend tuyệt đối không trả về correct_option khi đang thi, chỉ chấm điểm ở phía Server khi nộp bài.'),
(1, 'Trong React Router v6, thành phần nào được dùng trong Layout cha để hiển thị nội dung của các Route con (Nested Routes)?', '<Switch />', '<Outlet />', '<Redirect />', '<Portal />', 'B', '<Outlet /> trong react-router-dom v6 được đặt trong component Layout (như StudentLayout, TeacherLayout, AdminLayout) để render các route con tương ứng.');

-- Câu hỏi cho Đề thi số 2 (INT2208 - ThS. Trần Thị Bình)
INSERT INTO questions (exam_id, content, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(2, 'Trong MySQL, việc sử dụng Prepared Statements với dấu hỏi chấm (?) trong thư viện mysql2 giúp ngăn chặn trực tiếp lỗ hổng bảo mật nào?', 'Cross-Site Scripting (XSS)', 'Cross-Site Request Forgery (CSRF)', 'SQL Injection (SQLi)', 'Denial of Service (DoS)', 'C', 'Prepared Statements tách biệt cấu trúc câu lệnh SQL và dữ liệu đầu vào của người dùng, giúp vô hiệu hóa hoàn toàn các đoạn mã SQL độc hại chèn vào tham số.'),
(2, 'Ràng buộc khóa ngoại (FOREIGN KEY) với tùy chọn ON DELETE CASCADE trên bảng questions (tham chiếu tới exams.id) có ý nghĩa gì?', 'Không cho phép xóa bất kỳ câu hỏi nào nếu đề thi đang mở', 'Khi xóa một đề thi trong bảng exams, toàn bộ câu hỏi thuộc đề thi đó trong bảng questions sẽ tự động được xóa theo', 'Khi xóa một câu hỏi, đề thi chứa câu hỏi đó cũng bị xóa', 'Tự động nhân đôi câu hỏi khi cập nhật mã đề thi', 'B', 'ON DELETE CASCADE giúp đảm bảo toàn vẹn tham chiếu bằng cách tự động xóa các bản ghi con phụ thuộc khi bản ghi cha bị xóa.'),
(2, 'Câu lệnh SQL nào dùng để lọc kết quả sau khi đã gom nhóm bằng mệnh đề GROUP BY?', 'WHERE', 'ORDER BY', 'HAVING', 'LIMIT', 'C', 'WHERE lọc các dòng trước khi gom nhóm (GROUP BY), còn HAVING dùng để lọc các nhóm dựa trên hàm tổng hợp (COUNT, AVG, SUM).'),
(2, 'Trong thiết kế bảng exam_attempts, kiểu dữ liệu nào trong MySQL phù hợp nhất để lưu trữ danh sách đáp án đã chọn của sinh viên dạng cặp {"questionId": "A"}?', 'VARCHAR(10)', 'JSON', 'INT', 'BOOLEAN', 'B', 'Kiểu dữ liệu JSON trong MySQL cho phép lưu trữ cấu trúc đối tượng linh hoạt và kiểm tra tính hợp lệ của chuỗi JSON tự động.');

-- Câu hỏi cho Đề thi số 3 (INT2204 - TS. Nguyễn Văn An)
INSERT INTO questions (exam_id, content, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
(3, 'Tính chất nào của Lập trình Hướng đối tượng (OOP) cho phép che giấu dữ liệu bên trong đối tượng và chỉ cho phép tương tác qua các phương thức công khai?', 'Tính Kế thừa (Inheritance)', 'Tính Đóng gói (Encapsulation)', 'Tính Đa hình (Polymorphism)', 'Tính Trừu tượng (Abstraction)', 'B', 'Tính đóng gói (Encapsulation) gom dữ liệu và phương thức vào một lớp, đồng thời giới hạn quyền truy cập trực tiếp vào thuộc tính nội bộ.'),
(3, 'Trong TypeScript, từ khóa nào dùng để định nghĩa khuôn mẫu cấu trúc dữ liệu cho một đối tượng (như User, Exam, Question)?', 'interface', 'package', 'namespace', 'module', 'A', 'Trong TypeScript, interface được dùng để khai báo kiểu dữ liệu tường minh cho các đối tượng và props.');

-- Lượt làm bài mẫu (exam_attempts)
INSERT INTO exam_attempts (user_id, exam_id, score, total_correct, total_questions, user_answers, started_at, submitted_at) VALUES
(4, 1, 8.00, 4, 5, '{"1": "C", "2": "B", "3": "A", "4": "B", "5": "A"}', '2026-11-15 09:00:00', '2026-11-15 09:14:30'),
(5, 1, 6.00, 3, 5, '{"1": "C", "2": "B", "3": "B", "4": "B", "5": "C"}', '2026-11-15 10:00:00', '2026-11-15 10:18:10'),
(6, 1, 4.00, 2, 5, '{"1": "B", "2": "B", "3": "A", "4": "A", "5": "D"}', '2026-11-15 14:00:00', '2026-11-15 14:19:45'),
(4, 2, 10.00, 4, 4, '{"6": "C", "7": "B", "8": "C", "9": "B"}', '2026-11-16 08:30:00', '2026-11-16 08:48:20');

