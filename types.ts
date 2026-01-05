
export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR', // External course creators
  TEACHER = 'TEACHER', // School-specific class managers
  SCHOOL_ADMIN = 'SCHOOL_ADMIN', // School owner/principal
  ADMIN = 'ADMIN' // SuperAdmin
}

export type AccountType = 'INDIVIDUAL' | 'SCHOOL_MEMBER';

export type GradeLevel = 
  | 'Primary 1' | 'Primary 2' | 'Primary 3' | 'Primary 4' | 'Primary 5' | 'Primary 6'
  | 'JSS 1' | 'JSS 2' | 'JSS 3'
  | 'SS 1' | 'SS 2' | 'SS 3';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  walletBalance: number;
  accountType: AccountType;
  schoolId?: string;
  schoolName?: string;
  classId?: string; // Linked to a SchoolClass
  subscriptionExpiry?: string; // ISO string for individual users
}

export interface School {
  id: string;
  name: string;
  adminId: string;
  subscriptionExpiry?: string; // ISO string
  isTermActive: boolean;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  teacherId: string;
  grade: GradeLevel;
  className: string; // e.g., "Primary 4 Blue"
}

export interface Exam {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  durationMinutes: number;
  questions: Question[];
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  total: number;
  takenAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructorId: string;
  instructorName: string;
  categoryId: string;
  price: number;
  thumbnail: string;
  isPublished: boolean;
  lessons: Lesson[];
  enrollmentCount: number;
  rating: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: string;
  order: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
}
