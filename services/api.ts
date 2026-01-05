
import { User, Course, Enrollment, UserRole, School, SchoolClass, Exam, GradeLevel, ExamResult } from '../types';
import { mockCourses, mockUser, mockSchoolStudent, mockSchoolAdmin, mockSuperAdmin } from '../mockData';

const STORAGE_KEYS = {
  USER: 'oyaskill_user',
  USERS: 'oyaskill_all_users',
  ENROLLMENTS: 'oyaskill_enrollments',
  COURSES: 'oyaskill_courses',
  WALLET: 'oyaskill_wallet',
  SCHOOLS: 'oyaskill_schools',
  CLASSES: 'oyaskill_classes',
  EXAMS: 'oyaskill_exams',
  RESULTS: 'oyaskill_results'
};

const INDIVIDUAL_SUBSCRIPTION_FEE = 10000;
const SCHOOL_TERM_FEE = 150000;

const delay = (ms?: number) => new Promise(resolve => setTimeout(resolve, ms || Math.random() * 400 + 100));

class ApiService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(mockCourses));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const mockTeacher1: User = {
        id: 't1',
        name: 'Mr. Segun Arinze',
        email: 'segun@stjudes.edu.ng',
        role: UserRole.TEACHER,
        accountType: 'SCHOOL_MEMBER',
        schoolId: 's1',
        schoolName: 'St. Judes Tech Academy',
        avatar: 'https://picsum.photos/seed/segun/200',
        walletBalance: 0
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
        mockUser, mockSchoolStudent, mockSchoolAdmin, mockSuperAdmin, mockTeacher1
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
      const initialSchools: School[] = [
        {
          id: 's1',
          name: 'St. Judes Tech Academy',
          adminId: 'u2',
          subscriptionExpiry: new Date(Date.now() + 864000000).toISOString(),
          isTermActive: true
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(initialSchools));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      const initialClasses: SchoolClass[] = [
        { id: 'c1', schoolId: 's1', teacherId: 't1', grade: 'SS 3', className: 'SS3 Gold' }
      ];
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(initialClasses));
    }
  }

  // --- Core User Management ---

  async getAllUsers(): Promise<User[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  async saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  async createUser(userData: Partial<User>): Promise<User> {
    await delay(800);
    const users = await this.getAllUsers();
    const newUser = {
      ...userData,
      id: `u_${Date.now()}`,
      walletBalance: userData.walletBalance || 0,
      avatar: userData.avatar || `https://picsum.photos/seed/${userData.email}/200`,
    } as User;
    users.push(newUser);
    await this.saveUsers(users);
    return newUser;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    await delay(500);
    const users = await this.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("Eya! We no find this person for our database o.");
    users[idx] = { ...users[idx], ...data };
    await this.saveUsers(users);
    return users[idx];
  }

  async deleteUser(userId: string): Promise<void> {
    await delay(500);
    const users = await this.getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    await this.saveUsers(filtered);
  }

  // --- School Specific Logic ---

  getSchool(schoolId: string): School | null {
    const schools: School[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOLS) || '[]');
    return schools.find(s => s.id === schoolId) || null;
  }

  async getTeachersBySchool(schoolId: string): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(u => u.schoolId === schoolId && u.role === UserRole.TEACHER);
  }

  async getStudentsBySchool(schoolId: string): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(u => u.schoolId === schoolId && u.role === UserRole.STUDENT);
  }

  async getStudentsByClass(classId: string): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(u => u.classId === classId && u.role === UserRole.STUDENT);
  }

  // --- Class Management ---

  async getClassesBySchool(schoolId: string): Promise<SchoolClass[]> {
    const all: SchoolClass[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
    return all.filter(c => c.schoolId === schoolId);
  }

  async createClass(classData: Partial<SchoolClass>): Promise<SchoolClass> {
    await delay(800);
    const all: SchoolClass[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
    const newClass = {
      ...classData,
      id: `class_${Date.now()}`,
    } as SchoolClass;
    all.push(newClass);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(all));
    return newClass;
  }

  async deleteClass(classId: string): Promise<void> {
    await delay();
    const all: SchoolClass[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
    const filtered = all.filter(c => c.id !== classId);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(filtered));
  }

  // --- Redirection & Login Simulation ---

  isSubscribed(user: User | null): boolean {
    if (!user) return false;
    if (user.role === UserRole.ADMIN) return true;
    if (user.accountType === 'SCHOOL_MEMBER' && user.schoolId) {
      const school = this.getSchool(user.schoolId);
      if (!school || !school.subscriptionExpiry) return false;
      return new Date(school.subscriptionExpiry) > new Date();
    }
    if (!user.subscriptionExpiry) return false;
    return new Date(user.subscriptionExpiry) > new Date();
  }

  async getMyClass(teacherId: string): Promise<SchoolClass | null> {
    const all: SchoolClass[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
    return all.find(c => c.teacherId === teacherId) || null;
  }

  async login(role: string): Promise<User> {
    await delay(500);
    const allUsers = await this.getAllUsers();
    let user;
    if (role === 'admin') user = allUsers.find(u => u.role === UserRole.ADMIN);
    else if (role === 'school_admin') user = allUsers.find(u => u.role === UserRole.SCHOOL_ADMIN);
    else if (role === 'teacher') user = allUsers.find(u => u.role === UserRole.TEACHER);
    else if (role === 'school_student') user = allUsers.find(u => u.id === 'u3');
    else user = allUsers.find(u => u.id === 'u1');
    
    if (!user) throw new Error("Chai! We no find this kind account o. Check your portal side again.");
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  async getCurrentUser(): Promise<User | null> {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  async getExamsForClass(classId: string): Promise<Exam[]> {
    const all: Exam[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
    return all.filter(ex => ex.classId === classId);
  }

  async getResultsForStudent(studentId: string): Promise<ExamResult[]> {
    const all: ExamResult[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
    return all.filter(r => r.studentId === studentId);
  }

  async getGlobalStats() {
    await delay();
    const users = await this.getAllUsers();
    const schools: School[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOLS) || '[]');
    return {
      totalStudents: users.filter(u => u.role === UserRole.STUDENT).length,
      totalSchools: schools.length,
      totalRevenue: 2500000,
      courseCount: JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]').length
    };
  }

  async getEnrollments(userId: string): Promise<Enrollment[]> {
    const all: Enrollment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || '[]');
    return all.filter(e => e.userId === userId);
  }
}

export const api = new ApiService();
