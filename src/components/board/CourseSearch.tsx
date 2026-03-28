import { useState } from 'react';
import { Search, X, Plus, BookOpen } from 'lucide-react';

interface Course {
  courseReferenceNumber: string;
  subject: string;
  courseNumber: string;
  courseTitle: string;
  seatsAvailable: number;
  maximumEnrollment: number;
  faculty: { displayName: string }[];
  meetingsFaculty: { meetingTime: { beginTime: string; endTime: string; monday: boolean; tuesday: boolean; wednesday: boolean; thursday: boolean; friday: boolean } }[];
}

interface CourseSearchProps {
  onSelectCourse: (name: string) => void;
  onClose: () => void;
}

const TERM = '202630'; // Spring 2026

export default function CourseSearch({ onSelectCourse, onClose }: CourseSearchProps) {
  const [subject, setSubject] = useState('');
  const [courseNumber, setCourseNumber] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    setError('');
    setCourses([]);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        subject: subject.toUpperCase(),
        course_number: courseNumber,
        term: TERM,
      });
      const res = await fetch(`http://localhost:8000/auth/nu/courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.data) {
        setCourses(data.data);
      } else {
        setError('No courses found. Try a different subject or course number.');
      }
    } catch (err) {
      setError('Failed to reach NU Banner. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const days = (m: any) => {
    const d = m?.meetingTime;
    if (!d) return '';
    return [d.monday && 'M', d.tuesday && 'T', d.wednesday && 'W', d.thursday && 'Th', d.friday && 'F']
      .filter(Boolean).join('');
  };

  const formatTime = (t: string) => {
    if (!t) return '';
    const h = parseInt(t.slice(0, 2));
    const m = t.slice(2);
    return `${h > 12 ? h - 12 : h}:${m}${h >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Search NEU Courses</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. CS, MATH, PHYS"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="w-32">
              <label className="mb-1 block text-xs font-medium text-gray-600">Course #</label>
              <input
                value={courseNumber}
                onChange={e => setCourseNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="e.g. 2500"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={search}
                disabled={loading || !subject.trim()}
                className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <div className="max-h-80 overflow-y-auto space-y-2">
            {courses.map(course => (
              <div key={course.courseReferenceNumber}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 hover:border-gray-300 hover:bg-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {course.subject} {course.courseNumber}
                    </span>
                    <span className="text-xs text-gray-500">CRN: {course.courseReferenceNumber}</span>
                  </div>
                  <p className="truncate text-sm text-gray-700">{course.courseTitle}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    {course.faculty[0] && <span>👤 {course.faculty[0].displayName}</span>}
                    {course.meetingsFaculty[0] && (
                      <span>🕐 {days(course.meetingsFaculty[0])} {formatTime(course.meetingsFaculty[0].meetingTime?.beginTime)}</span>
                    )}
                    <span>👥 {course.seatsAvailable}/{course.maximumEnrollment} seats</span>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCourse(`${course.subject} ${course.courseNumber} - ${course.courseTitle}`)}
                  className="ml-3 flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Board
                </button>
              </div>
            ))}
          </div>

          {courses.length === 0 && !loading && !error && (
            <p className="py-6 text-center text-sm text-gray-500">
              Search for a NEU course to create a board (e.g. CS 3500)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
