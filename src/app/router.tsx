import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { InstructorLayout } from '@/layouts/InstructorLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { HomeRedirect } from './HomeRedirect'
import {
  AboutPage,
  AdminCourseDetailPage,
  AdminCoursesPage,
  AdminModuleDetailPage,
  InstructorCourseDetailPage,
  InstructorCoursesPage,
  InstructorModuleDetailPage,
  LoginPage,
  MyCoursesPage,
  PdfViewerPage,
  QuizPage,
  StudentCoursePage,
  UsersPage,
  VideoViewerPage,
} from './lazyPages'
import { RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
      { path: '/about', element: <AboutPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <HomeRedirect /> },

          // content viewers are reachable from any staff or student area,
          // so they live outside the role-gated subtrees below
          { path: '/modules/:moduleId/pdf/:pdfId', element: <PdfViewerPage /> },
          { path: '/modules/:moduleId/video/:videoId', element: <VideoViewerPage /> },
          { path: '/modules/:moduleId/quiz', element: <QuizPage /> },

          {
            path: '/admin',
            element: <RequireRole roles={['ADMIN']} />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminCoursesPage /> },
                  { path: 'users', element: <UsersPage /> },
                  { path: 'courses', element: <AdminCoursesPage /> },
                  { path: 'courses/:courseId', element: <AdminCourseDetailPage /> },
                  { path: 'courses/:courseId/modules/:moduleId', element: <AdminModuleDetailPage /> },
                ],
              },
            ],
          },
          {
            path: '/instructor',
            element: <RequireRole roles={['INSTRUCTOR']} />,
            children: [
              {
                element: <InstructorLayout />,
                children: [
                  { index: true, element: <InstructorCoursesPage /> },
                  { path: 'courses', element: <InstructorCoursesPage /> },
                  { path: 'courses/:courseId', element: <InstructorCourseDetailPage /> },
                  {
                    path: 'courses/:courseId/modules/:moduleId',
                    element: <InstructorModuleDetailPage />,
                  },
                ],
              },
            ],
          },
          {
            path: '/student',
            element: <RequireRole roles={['STUDENT']} />,
            children: [
              {
                element: <StudentLayout />,
                children: [
                  { index: true, element: <MyCoursesPage /> },
                  { path: 'courses/:courseId', element: <StudentCoursePage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
