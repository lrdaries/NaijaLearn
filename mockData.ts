
import { User, Course, Category, UserRole } from './types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Software Development', slug: 'software-dev', icon: '💻' },
  { id: '2', name: 'Digital Marketing', slug: 'digital-marketing', icon: '📈' },
  { id: '3', name: 'Product Design', slug: 'design', icon: '🎨' },
  { id: '4', name: 'Business Management', slug: 'business', icon: '💼' },
];

export const mockUser: User = {
  id: 'u1',
  name: 'Tunde Afolayan',
  email: 'tunde@example.com',
  role: UserRole.STUDENT,
  accountType: 'INDIVIDUAL',
  avatar: 'https://picsum.photos/seed/tunde/200',
  walletBalance: 25000,
};

export const mockSchoolStudent: User = {
  id: 'u3',
  name: 'Ebuka James',
  email: 'ebuka@school.edu.ng',
  role: UserRole.STUDENT,
  // Fix: changed 'SCHOOL_STUDENT' to 'SCHOOL_MEMBER' to align with AccountType definition in types.ts
  accountType: 'SCHOOL_MEMBER',
  schoolId: 's1',
  schoolName: 'St. Judes Tech Academy',
  avatar: 'https://picsum.photos/seed/ebuka/200',
  walletBalance: 0,
};

export const mockSuperAdmin: User = {
  id: 'u_admin',
  name: 'NaijaLearn Boss',
  email: 'boss@naijalearn.com',
  role: UserRole.ADMIN,
  accountType: 'INDIVIDUAL',
  avatar: 'https://picsum.photos/seed/boss/200',
  walletBalance: 1000000,
};

export const mockSchoolAdmin: User = {
  id: 'u2',
  name: 'Sister Mary Joseph',
  email: 'admin@st-judes.edu.ng',
  role: UserRole.SCHOOL_ADMIN,
  accountType: 'INDIVIDUAL',
  avatar: 'https://picsum.photos/seed/school/200',
  walletBalance: 500000,
  schoolId: 's1',
  schoolName: 'St. Judes Tech Academy'
};

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Modern Web Development with Next.js',
    slug: 'modern-web-dev',
    description: 'Learn to build production-grade applications using the latest web technologies used by top Nigerian startups.',
    instructorId: 'i1',
    instructorName: 'Sarah Okafor',
    categoryId: '1',
    price: 15000,
    thumbnail: 'https://picsum.photos/seed/web/800/450',
    isPublished: true,
    enrollmentCount: 450,
    rating: 4.8,
    // Fix: Removed 'hasExam' as it is not a valid property of the Course interface
    lessons: [
      { id: 'l1', courseId: 'c1', title: 'Introduction to Next.js', content: 'In this lesson...', duration: '15:00', order: 1 },
      { id: 'l2', courseId: 'c1', title: 'Routing and Layouts', content: 'Deep dive into...', duration: '25:00', order: 2 },
    ]
  },
  {
    id: 'c2',
    title: 'UI/UX Design for African Markets',
    slug: 'ui-ux-design',
    description: 'Master the principles of design with a specific focus on low-bandwidth and mobile-first users in Africa.',
    instructorId: 'i2',
    // Added missing quotes around 'David Adeleke'
    instructorName: 'David Adeleke',
    categoryId: '3',
    price: 0,
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    isPublished: true,
    enrollmentCount: 1200,
    rating: 4.9,
    // Fix: Removed 'hasExam' as it is not a valid property of the Course interface
    lessons: [
      { id: 'l3', courseId: 'c2', title: 'Mobile-First Design Basics', content: 'Why mobile matters...', duration: '20:00', order: 1 },
    ]
  }
];
