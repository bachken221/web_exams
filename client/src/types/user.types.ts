import { User } from './auth.types';

export interface RecentAttemptSummary {
  id: number;
  score: number;
  total_correct: number;
  total_questions: number;
  submitted_at: string;
  student_name: string;
  student_email: string;
  exam_id?: number;
  exam_title: string;
  pass_score: number;
  subject_code: string;
  is_passed: boolean;
}

export interface SubjectAnalyticsItem {
  id: number;
  code: string;
  name: string;
  exam_count: number;
  attempt_count: number;
  avg_score: number;
  pass_rate: number;
}

export interface ScoreDistribution {
  excellent: number;
  good: number;
  average: number;
  fail: number;
}

export interface AdminDashboardStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  locked_users: number;
  total_subjects: number;
  total_exams: number;
  published_exams: number;
  total_questions: number;
  total_attempts: number;
  passed_attempts: number;
  pass_rate: number;
  average_score: number;
  highest_score: number;
  score_distribution: ScoreDistribution;
  subject_stats: SubjectAnalyticsItem[];
  recent_attempts: RecentAttemptSummary[];
  recent_users: User[];
}

export interface TeacherDashboardStats {
  total_exams: number;
  published_exams: number;
  total_questions: number;
  total_attempts: number;
  passed_attempts: number;
  pass_rate: number;
  average_score: number;
  recent_attempts: RecentAttemptSummary[];
}

export type UserRecord = User;
