export interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
  exam_count?: number;
  created_at?: string;
}

export interface Exam {
  id: number;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  created_by: number;
  creator_name: string;
  title: string;
  description: string;
  duration_minutes: number;
  pass_score: number;
  is_published: boolean;
  question_count: number;
  attempt_count: number;
  created_at: string;
}

// Câu hỏi dùng cho Giảng viên / Admin (có đáp án đúng & giải thích)
export interface Question {
  id: number;
  exam_id: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

// Câu hỏi dùng trong Phòng thi Sinh viên (Tuyệt đối không có correct_option)
export interface ExamRoomQuestion {
  id: number;
  exam_id: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface ExamAttempt {
  id: number;
  user_id?: number;
  student_name?: string;
  student_email?: string;
  exam_id: number;
  exam_title: string;
  subject_code: string;
  subject_name: string;
  duration_minutes: number;
  pass_score: number;
  score: number;
  is_passed: boolean;
  total_correct: number;
  total_questions: number;
  started_at: string;
  submitted_at: string;
}

export interface QuestionReviewItem extends Question {
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean;
}

export interface AttemptDetailResponse {
  attempt: ExamAttempt;
  questions: QuestionReviewItem[];
}

