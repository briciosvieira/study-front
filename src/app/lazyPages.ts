import { lazy } from 'react'

// Code-split by route: keeps react-pdf, the quiz engine, and each admin
// page out of the initial bundle since most sessions never touch them all.

export const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
export const AboutPage = lazy(() =>
  import('@/pages/about/AboutPage').then((m) => ({ default: m.AboutPage })),
)

export const AdminCoursesPage = lazy(() =>
  import('@/pages/admin/CoursesPage').then((m) => ({ default: m.CoursesPage })),
)
export const AdminCourseDetailPage = lazy(() =>
  import('@/pages/admin/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })),
)
export const AdminModuleDetailPage = lazy(() =>
  import('@/pages/admin/ModuleDetailPage').then((m) => ({ default: m.ModuleDetailPage })),
)
export const UsersPage = lazy(() =>
  import('@/pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })),
)

export const InstructorCoursesPage = lazy(() =>
  import('@/pages/instructor/CoursesPage').then((m) => ({ default: m.CoursesPage })),
)
export const InstructorCourseDetailPage = lazy(() =>
  import('@/pages/instructor/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })),
)
export const InstructorModuleDetailPage = lazy(() =>
  import('@/pages/instructor/ModuleDetailPage').then((m) => ({ default: m.ModuleDetailPage })),
)

export const MyCoursesPage = lazy(() =>
  import('@/pages/student/MyCoursesPage').then((m) => ({ default: m.MyCoursesPage })),
)
export const StudentCoursePage = lazy(() =>
  import('@/pages/student/StudentCoursePage').then((m) => ({ default: m.StudentCoursePage })),
)

export const PdfViewerPage = lazy(() =>
  import('@/pages/content/PdfViewerPage').then((m) => ({ default: m.PdfViewerPage })),
)
export const VideoViewerPage = lazy(() =>
  import('@/pages/content/VideoViewerPage').then((m) => ({ default: m.VideoViewerPage })),
)
export const QuizPage = lazy(() =>
  import('@/pages/content/QuizPage').then((m) => ({ default: m.QuizPage })),
)
