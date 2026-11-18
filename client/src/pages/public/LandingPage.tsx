import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, FileCheck, GraduationCap, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, getHomePathByRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      {/* Thanh điều hướng trên cùng */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-teal-700 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-none">
                CỔNG KHẢO THÍ TRỰC TUYẾN
              </span>
              <span className="text-[11px] text-slate-500">
                Trung tâm Khảo thí & Đảm bảo Chất lượng Đào tạo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getHomePathByRole()}
                className="px-4 py-2 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white transition-colors"
              >
                Vào hệ thống làm việc
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded text-xs font-semibold text-slate-700 border border-slate-300 bg-white hover:bg-stone-50"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
                >
                  Đăng ký tài khoản
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Nội dung trang chủ */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Khu vực giới thiệu & Lịch thi học kỳ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-md p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-100 border border-slate-300 text-xs font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Kỳ thi Học kỳ I • Năm học 2026 - 2027</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                Hệ thống Thi Trắc nghiệm & Đánh giá Học phần Trực tuyến
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Cổng thông tin phục vụ công tác tổ chức thi giữa kỳ, cuối kỳ và kiểm tra thường xuyên
                cho sinh viên các khoa đào tạo. Sinh viên đăng nhập bằng tài khoản email để tra cứu
                đề thi đang mở, làm bài trực tuyến và xem lại kết quả chấm điểm.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? getHomePathByRole() : '/login'}
                className="px-5 py-2.5 rounded text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
              >
                {isAuthenticated ? 'Truy cập Cổng khảo thí' : 'Đăng nhập vào phòng thi'}
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded text-xs font-semibold bg-white hover:bg-stone-50 text-slate-700 border border-slate-300"
                >
                  Đăng ký tài khoản mới
                </Link>
              )}
            </div>
          </div>

          {/* Thông báo từ phòng khảo thí */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5">
                Thông báo từ Phòng Khảo thí
              </h2>
              <ul className="divide-y divide-slate-100 text-xs mt-2">
                <li className="py-2.5 space-y-1">
                  <span className="text-[11px] font-semibold text-teal-700 block">
                    16/11/2026
                  </span>
                  <p className="font-medium text-slate-800">
                    Mở đợt kiểm tra giữa kỳ học phần Phát triển Ứng dụng Web (INT3306)
                  </p>
                </li>
                <li className="py-2.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    12/11/2026
                  </span>
                  <p className="font-medium text-slate-800">
                    Lịch ôn tập và kiểm tra cuối kỳ môn Cơ sở Dữ liệu (INT2208)
                  </p>
                </li>
                <li className="py-2.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    05/11/2026
                  </span>
                  <p className="font-medium text-slate-800">
                    Quy định về chuẩn bị thiết bị và kết nối mạng trước khi vào phòng thi
                  </p>
                </li>
              </ul>
            </div>
            <div className="text-[11px] text-slate-500 bg-stone-50 border border-slate-200 rounded p-2.5">
              Sinh viên gặp sự cố tài khoản vui lòng liên hệ trực tiếp văn phòng P.304 nhà A1.
            </div>
          </div>
        </div>

        {/* Hướng dẫn quy trình làm bài thi cho sinh viên */}
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Quy trình tham gia làm bài thi trực tuyến
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            <div className="p-4 rounded bg-stone-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>Bước 1: Chọn học phần</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Tra cứu đề thi theo mã học phần (VD: INT3306, INT2208) hoặc tìm theo tên bài kiểm tra.
              </p>
            </div>

            <div className="p-4 rounded bg-stone-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>Bước 2: Làm bài trong thời gian</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Theo dõi đồng hồ đếm ngược trên màn hình, có thể đánh dấu câu hỏi cần xem lại trước khi nộp.
              </p>
            </div>

            <div className="p-4 rounded bg-stone-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileCheck className="w-4 h-4 text-teal-700" />
                <span>Bước 3: Nộp bài & Chấm điểm</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Nhấn nộp bài hoặc hệ thống tự động thu bài khi hết giờ và công bố điểm số ngay lập tức.
              </p>
            </div>

            <div className="p-4 rounded bg-stone-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <HelpCircle className="w-4 h-4 text-teal-700" />
                <span>Bước 4: Xem đáp án & Giải thích</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Sau khi hoàn thành bài thi, sinh viên xem lại chi tiết từng câu hỏi kèm lời giải của giảng viên.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 Trung tâm Khảo thí & Đảm bảo Chất lượng Đào tạo.</span>
          <span>Địa chỉ: Phòng 304 Nhà A1 • Email: khaothi@edu.vn • Điện thoại: (024) 3754 7890</span>
        </div>
      </footer>
    </div>
  );
};
