
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { UserRole, User, Course, Enrollment, School, SchoolClass, Exam, GradeLevel, ExamResult } from './types';
import { api } from './services/api';
import { startOyaChat } from './services/ai';

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border animate-bounce-short ${
      type === 'success' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'
    }`}>
      <span className="font-bold text-sm uppercase tracking-widest">{type === 'success' ? '✔ Correct' : '✘ Eya!'}</span>
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

const OyaChatbot = ({ user }: { user: User | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSubscribed = api.isSubscribed(user);
  const [messages, setMessages] = useState([{ role: 'model', text: 'Oya! How I fit help you level up today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    const resp = await startOyaChat(msg, isSubscribed);
    setMessages(prev => [...prev, { role: 'model', text: resp || '' }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">
      {isOpen && (
        <div className="bg-white w-80 md:w-[26rem] h-[32rem] rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-fade-in-up">
          <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
            <span className="font-black text-sm uppercase tracking-widest">Oya Mentor</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${m.role === 'user' ? 'bg-orange-600 text-white' : 'bg-white text-gray-800 border shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl border animate-pulse text-xs font-bold text-gray-400">Mentor de type...</div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t flex space-x-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              placeholder={isSubscribed ? "Ask any technical quest..." : "Ask small thing or upgrade..."} 
              className="flex-1 bg-gray-50 p-4 rounded-xl text-sm outline-none font-medium focus:ring-2 focus:ring-orange-500 transition-all" 
            />
            <button onClick={handleSend} className="bg-gray-900 text-white w-12 h-12 rounded-xl hover:bg-orange-600 transition shadow-lg">➔</button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-gray-900 text-white w-16 h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition active:scale-95">
        💬
      </button>
    </div>
  );
};

// --- Modals ---

const AddUserModal = ({ isOpen, onClose, onAdd, role, title }: { isOpen: boolean, onClose: () => void, onAdd: (data: Partial<User>) => void, role: UserRole, title: string }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl animate-fade-in-up">
        <h3 className="text-3xl font-black mb-2 tracking-tight">{title}</h3>
        <p className="text-gray-400 font-medium mb-10">Fill the details to register new {role.toLowerCase()}. No dulling!</p>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-5 rounded-2xl border border-gray-100 focus:border-orange-500 outline-none transition font-medium" placeholder="Olamide Baddo" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-5 rounded-2xl border border-gray-100 focus:border-orange-500 outline-none transition font-medium" placeholder="oya@school.ng" />
          </div>
          <div className="flex gap-4 pt-6">
            <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-gray-400 uppercase text-[10px] tracking-widest">Cancel</button>
            <button onClick={() => onAdd({ name, email, role })} className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-orange-600 shadow-xl uppercase text-[10px] tracking-widest">Register</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddClassModal = ({ isOpen, onClose, onAdd, teachers }: { isOpen: boolean, onClose: () => void, onAdd: (data: Partial<SchoolClass>) => void, teachers: User[] }) => {
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Primary 1');
  const [teacherId, setTeacherId] = useState('');

  const gradeLevels: GradeLevel[] = [
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'JSS 1', 'JSS 2', 'JSS 3',
    'SS 1', 'SS 2', 'SS 3'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl animate-fade-in-up">
        <h3 className="text-3xl font-black mb-2 tracking-tight">Create New Class</h3>
        <p className="text-gray-400 font-medium mb-10">Assign grade and teacher for new class. Oya!</p>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Class Name</label>
            <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} className="w-full p-5 rounded-2xl border border-gray-100 focus:border-orange-500 outline-none transition font-medium" placeholder="e.g. SS3 Silver" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Grade Level</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value as GradeLevel)} className="w-full p-5 rounded-2xl border border-gray-100 focus:border-orange-500 outline-none transition font-medium appearance-none bg-white">
              {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Assign Teacher</label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full p-5 rounded-2xl border border-gray-100 focus:border-orange-500 outline-none transition font-medium appearance-none bg-white">
              <option value="">Select Teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex gap-4 pt-6">
            <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-gray-400 uppercase text-[10px] tracking-widest">Cancel</button>
            <button onClick={() => onAdd({ className, grade, teacherId })} className="flex-1 py-4 rounded-2xl bg-orange-600 text-white font-black hover:bg-orange-700 shadow-xl uppercase text-[10px] tracking-widest">Create Class</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Views ---

const SchoolAdminDashboard = ({ user }: { user: User }) => {
  const [view, setView] = useState<'classes' | 'teachers' | 'students'>('classes');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    if (user.schoolId) {
      const [cls, tch, stu] = await Promise.all([
        api.getClassesBySchool(user.schoolId),
        api.getTeachersBySchool(user.schoolId),
        api.getStudentsBySchool(user.schoolId)
      ]);
      setClasses(cls);
      setTeachers(tch);
      setStudents(stu);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user.schoolId]);

  const handleAddClass = async (data: Partial<SchoolClass>) => {
    if (user.schoolId) {
      await api.createClass({ ...data, schoolId: user.schoolId });
      setIsClassModalOpen(false);
      fetchData();
    }
  };

  const handleAddTeacher = async (data: Partial<User>) => {
    if (user.schoolId) {
      await api.createUser({ ...data, role: UserRole.TEACHER, schoolId: user.schoolId, schoolName: user.schoolName, accountType: 'SCHOOL_MEMBER' });
      setIsTeacherModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm("Oya! You sure say you wan delete this one? E no get undo o!")) {
      await api.deleteUser(uid);
      fetchData();
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-black">Syncing Your School Hub...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <AddClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} onAdd={handleAddClass} teachers={teachers} />
      <AddUserModal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} onAdd={handleAddTeacher} role={UserRole.TEACHER} title="Register New Teacher" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="text-5xl font-black mb-2 tracking-tight text-gray-900">{user.schoolName}</h1>
          <p className="text-orange-600 font-bold uppercase tracking-widest text-[10px]">Administrative High Command</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsTeacherModalOpen(true)} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition text-[10px] uppercase tracking-widest">Add Teacher</button>
          <button onClick={() => setIsClassModalOpen(true)} className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition text-[10px] uppercase tracking-widest">Setup Class</button>
        </div>
      </header>

      <div className="flex space-x-4 mb-10 overflow-x-auto pb-2">
        {['classes', 'teachers', 'students'].map((v) => (
          <button 
            key={v}
            onClick={() => setView(v as any)}
            className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest border transition ${view === v ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'}`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[4rem] border border-gray-100 overflow-hidden shadow-sm">
        {view === 'classes' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr><th className="p-10">Class Name</th><th className="p-10">Grade</th><th className="p-10">Teacher</th><th className="p-10">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {classes.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="p-10 font-black">{c.className}</td>
                  <td className="p-10 font-bold text-gray-500">{c.grade}</td>
                  <td className="p-10 font-bold">{teachers.find(t => t.id === c.teacherId)?.name || 'Not assigned'}</td>
                  <td className="p-10"><button className="text-red-500 font-black text-[10px] uppercase">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {view === 'teachers' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr><th className="p-10">Teacher</th><th className="p-10">Email</th><th className="p-10">Control</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="p-10 flex items-center space-x-4"><img src={t.avatar} className="w-10 h-10 rounded-xl" /><span className="font-black">{t.name}</span></td>
                  <td className="p-10 font-bold text-gray-400">{t.email}</td>
                  <td className="p-10"><button onClick={() => handleDeleteUser(t.id)} className="text-red-500 font-black text-[10px] uppercase">Deactivate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {view === 'students' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr><th className="p-10">Student</th><th className="p-10">Class</th><th className="p-10">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="p-10 font-black">{s.name}</td>
                  <td className="p-10 font-bold text-gray-400">{classes.find(c => c.id === s.classId)?.className || 'Floating'}</td>
                  <td className="p-10"><button onClick={() => handleDeleteUser(s.id)} className="text-red-500 font-black text-[10px] uppercase">Withdraw</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const TeacherDashboard = ({ user }: { user: User }) => {
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const c = await api.getMyClass(user.id);
    if (c) {
      const stu = await api.getStudentsByClass(c.id);
      setSchoolClass(c);
      setStudents(stu);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user.id]);

  const handleAddStudent = async (data: Partial<User>) => {
    if (schoolClass) {
      await api.createUser({ 
        ...data, 
        role: UserRole.STUDENT, 
        schoolId: user.schoolId, 
        schoolName: user.schoolName, 
        classId: schoolClass.id, 
        accountType: 'SCHOOL_MEMBER' 
      });
      setIsStudentModalOpen(false);
      loadData();
    }
  };

  const handleRemoveStudent = async (sid: string) => {
    if (window.confirm("You wan remove this pikin from your class?")) {
      await api.deleteUser(sid);
      loadData();
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-black">Opening Class Register...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <AddUserModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} onAdd={handleAddStudent} role={UserRole.STUDENT} title="Enroll New Student" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="text-5xl font-black mb-2 tracking-tight">{schoolClass?.className || 'No class yet'}</h1>
          <p className="text-orange-600 font-bold uppercase tracking-widest text-[10px]">Teacher Workspace • {user.name}</p>
        </div>
        <button onClick={() => setIsStudentModalOpen(true)} className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl hover:bg-orange-600 transition-all text-sm uppercase tracking-widest">Register Student</button>
      </header>

      <div className="bg-white rounded-[4rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-2xl font-black">Class Roster</h3>
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{students.length} Students active</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr><th className="p-10">Full Name</th><th className="p-10">Contact Email</th><th className="p-10">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/50 transition">
                <td className="p-10 font-black">{s.name}</td>
                <td className="p-10 font-bold text-gray-400">{s.email}</td>
                <td className="p-10"><button onClick={() => handleRemoveStudent(s.id)} className="text-red-500 font-black text-[10px] uppercase">Withdraw</button></td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={3} className="p-20 text-center text-gray-300 font-bold italic">No students registered in this class. Oya, register some!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Login & Home Components ---

const HomeView = () => (
  <div className="bg-white overflow-hidden">
    {/* Hero Section */}
    <section className="bg-adire-pattern py-32 px-6 text-center relative">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-white/95 pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-100 px-6 py-2 rounded-full mb-10 shadow-sm animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-900">Naija's #1 Tech Skill Hub</span>
        </div>
        
        <h1 className="text-6xl md:text-[9rem] font-black text-gray-900 leading-[0.85] tracking-tighter mb-8 group">
          The <span className="text-gradient">Better Way</span> <br/>
          To Blow For Tech.
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          OyaSkill na where the correct tech gist de start. No dulling—learn UI/UX, Backend, and Product Design with Nigeria's most culturally optimized LMS.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link to="/login" className="w-full md:w-auto bg-gray-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl hover:bg-orange-600 shadow-2xl transition-all inline-block hover:-translate-y-1">
            Start Your Journey
          </Link>
          <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <img key={i} className="w-12 h-12 rounded-2xl border-4 border-white shadow-sm" src={`https://picsum.photos/seed/naija${i}/100`} />
            ))}
            <div className="w-12 h-12 rounded-2xl bg-orange-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-orange-600 shadow-sm">+5k</div>
          </div>
        </div>
      </div>
    </section>

    {/* Local Context Section */}
    <section className="py-32 px-6 bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
        <div className="group">
          <div className="w-16 h-16 bg-orange-600/20 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition">📡</div>
          <h3 className="text-2xl font-black mb-4">Low Data Learning</h3>
          <p className="text-gray-400 leading-relaxed font-medium">Because data no de easy for Naija. Our tracks optimized to use 40% less data. No shaking.</p>
        </div>
        <div className="group">
          <div className="w-16 h-16 bg-green-600/20 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition">🇳🇬</div>
          <h3 className="text-2xl font-black mb-4">Lagos StartUp Skills</h3>
          <p className="text-gray-400 leading-relaxed font-medium">We de teach what Yaba, Victoria Island, and Abuja tech firms de hire. Real skills for real money.</p>
        </div>
        <div className="group">
          <div className="w-16 h-16 bg-blue-600/20 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition">🎓</div>
          <h3 className="text-2xl font-black mb-4">Certified for Success</h3>
          <p className="text-gray-400 leading-relaxed font-medium">OyaSkill certificates de show say you sabi work. Industry standard from day one.</p>
        </div>
      </div>
    </section>

    {/* Featured Categories */}
    <section className="py-32 px-6 relative bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black mb-16 tracking-tighter">Hot Tracks Right Now</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Fullstack Engineering', desc: 'Build better than Paystack.', icon: '💻', color: 'bg-orange-50' },
            { title: 'UX/UI Product Design', desc: 'Design experiences wey pikin go sabi use.', icon: '🎨', color: 'bg-green-50' },
            { title: 'Growth Marketing', desc: 'Scale your business like a local pro.', icon: '📈', color: 'bg-purple-50' },
          ].map((track, i) => (
            <div key={i} className={`${track.color} p-12 rounded-[3.5rem] border border-gray-50 hover:shadow-2xl transition-all group`}>
              <div className="text-4xl mb-8 group-hover:scale-125 transition inline-block">{track.icon}</div>
              <h4 className="text-2xl font-black mb-4">{track.title}</h4>
              <p className="text-gray-500 font-medium leading-relaxed">{track.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

const LoginView = ({ onLogin }: { onLogin: (role: string) => void }) => {
  const [pane, setPane] = useState<'main' | 'institutional'>('main');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-[4rem] shadow-2xl p-16 border border-gray-100 relative overflow-hidden">
        {/* Adire Accent Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4 text-center tracking-tight text-gradient">
            {pane === 'main' ? 'Oya! Enter' : 'Institutional Portal'}
          </h2>
          <p className="text-center text-gray-400 font-medium mb-12">
            {pane === 'main' ? 'Pick your side and start learning.' : 'Choose your school role below.'}
          </p>
          
          <div className="space-y-4 animate-fade-in-up">
            {pane === 'main' ? (
              <>
                <button onClick={() => onLogin('student')} className="w-full p-8 rounded-3xl border-2 border-gray-50 hover:border-orange-600 hover:bg-orange-50/20 transition-all text-left flex justify-between items-center group bg-white">
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest group-hover:text-orange-600">Individual Learner</p>
                    <p className="text-xs text-gray-400 mt-1">For those wey wan blow for tech alone</p>
                  </div>
                  <span className="text-3xl filter grayscale group-hover:grayscale-0 transition">👤</span>
                </button>
                
                <button onClick={() => setPane('institutional')} className="w-full p-8 rounded-3xl border-2 border-orange-500/10 bg-orange-50/30 hover:bg-orange-50/50 hover:border-orange-500 transition-all text-left flex justify-between items-center group">
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest text-orange-600">School / Academy</p>
                    <p className="text-xs text-orange-900/60 mt-1">Management and School members</p>
                  </div>
                  <span className="text-3xl">🏛️</span>
                </button>

                <div className="pt-8">
                  <button onClick={() => onLogin('admin')} className="w-full py-2 text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] hover:text-orange-600 transition">Global SuperAdmin Only</button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => onLogin('school_admin')} className="w-full p-6 rounded-3xl border-2 border-gray-50 hover:border-orange-600 transition-all text-left flex justify-between items-center group bg-white">
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest group-hover:text-orange-600">School Admin</p>
                    <p className="text-xs text-gray-400 mt-1">Management of teachers & classes</p>
                  </div>
                  <span className="text-2xl">🏫</span>
                </button>
                
                <button onClick={() => onLogin('teacher')} className="w-full p-6 rounded-3xl border-2 border-gray-50 hover:border-orange-600 transition-all text-left flex justify-between items-center group bg-white">
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest group-hover:text-orange-600">Teacher Account</p>
                    <p className="text-xs text-gray-400 mt-1">Roster and classroom management</p>
                  </div>
                  <span className="text-2xl">👔</span>
                </button>
                
                <button onClick={() => onLogin('school_student')} className="w-full p-6 rounded-3xl border-2 border-gray-50 hover:border-orange-600 transition-all text-left flex justify-between items-center group bg-white">
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest group-hover:text-orange-600">School Student</p>
                    <p className="text-xs text-gray-400 mt-1">Access my classroom content</p>
                  </div>
                  <span className="text-2xl">🎓</span>
                </button>

                <button onClick={() => setPane('main')} className="w-full mt-6 py-4 rounded-2xl bg-gray-50 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition">
                  ← Back to Main Gate
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Wrapper ---

const MainContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const navigate = useNavigate();

  useEffect(() => { api.getCurrentUser().then(setUser); }, []);

  const handleLogin = async (role: string) => {
    try {
      const u = await api.login(role);
      setUser(u);
      setNotification({ message: `Correct! Welcome back, ${u.name}!`, type: 'success' });
      
      if (u.role === UserRole.ADMIN) navigate('/admin/dashboard');
      else if (u.role === UserRole.SCHOOL_ADMIN) navigate('/school/dashboard');
      else if (u.role === UserRole.TEACHER) navigate('/teacher/dashboard');
      else if (u.role === UserRole.STUDENT) {
        if (u.accountType === 'SCHOOL_MEMBER') navigate('/student/classroom');
        else navigate('/dashboard');
      }
    } catch (e: any) { 
      // All login errors now in Pidgin
      setNotification({ message: "Eya! We no find your account o. Abeg check your role or details again.", type: 'error' }); 
    }
  };

  const handleLogout = async () => { 
    await api.logout(); 
    setUser(null); 
    navigate('/login');
  };

  return (
    <>
      <OyaChatbot user={user} />
      {notification && <Toast {...notification} onClose={() => setNotification(null)} />}
      
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black group-hover:scale-110 transition shadow-lg">O</div>
          <span className="text-2xl font-black tracking-tight text-gray-900">Oya<span className="text-orange-600">Skill</span></span>
        </Link>
        <div className="flex items-center space-x-6">
          {user ? (
            <div className="flex items-center space-x-6">
              {user.role === UserRole.SCHOOL_ADMIN && <Link to="/school/dashboard" className="text-sm font-bold text-gray-900 hover:text-orange-600">Admin</Link>}
              {user.role === UserRole.TEACHER && <Link to="/teacher/dashboard" className="text-sm font-bold text-gray-900 hover:text-orange-600">Class</Link>}
              <Link to="/account" className="w-10 h-10 rounded-2xl border-2 border-orange-500 overflow-hidden shadow-md hover:scale-110 transition"><img src={user.avatar} className="w-full h-full object-cover" /></Link>
            </div>
          ) : (
            <Link to="/login" className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl text-[10px] tracking-widest uppercase hover:bg-gray-900 transition">Sign In</Link>
          )}
        </div>
      </nav>

      <main className="min-h-[80vh]">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
          <Route path="/school/dashboard" element={user?.role === UserRole.SCHOOL_ADMIN ? <SchoolAdminDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/teacher/dashboard" element={user?.role === UserRole.TEACHER ? <TeacherDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/student/classroom" element={user?.accountType === 'SCHOOL_MEMBER' ? <div className="p-20 text-center font-black">Welcome to your Class. Track your progress here!</div> : <Navigate to="/login" />} />
          <Route path="/account" element={user ? (
            <div className="p-20 text-center">
              <h2 className="text-3xl font-black mb-10">Oshey! You de active.</h2>
              <button onClick={handleLogout} className="bg-red-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-red-600 transition">Sign Out of Hub</button>
            </div>
          ) : <Navigate to="/login" />} />
          <Route path="/dashboard" element={<div className="p-20 text-center font-black">Individual Dashboard Coming Soon. No dulling!</div>} />
        </Routes>
      </main>

      <footer className="bg-gray-900 py-16 px-6 text-center border-t-8 border-orange-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-left">
             <p className="text-orange-600 font-black text-2xl mb-2">OyaSkill Hub</p>
             <p className="text-gray-500 max-w-sm">Built with ❤️ in Lagos. Providing the correct tech gist for Africa's future giants.</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">© 2025 OYASKILL TECHNOLOGIES. PROUDLY NIGERIAN 🇳🇬</p>
        </div>
      </footer>
    </>
  );
};

const Main = () => (
  <Router>
    <MainContent />
  </Router>
);

export default Main;
