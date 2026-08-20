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
  AdminProfilePage,
  AdminTemplateLibraryPage,
  AuditPage,
  ChangeRequiredPasswordPage,
  EmailBlocklistPage,
  InstructorCourseDetailPage,
  InstructorCoursesPage,
  InstructorModuleDetailPage,
  InstructorProfilePage,
  InstructorTemplateLibraryPage,
  InstructorUsersPage,
  LoginPage,
  MyCoursesPage,
  PdfViewerPage,
  PolicyRequiredPage,
  QuizPage,
  ReactivationRequestsPage,
  StudentCoursePage,
  StudentDetailPage,
  StudentProfilePage,
  StudentsPage,
  UserDetailPage,
  UsersPage,
  VideoViewerPage,
} from './lazyPages'
import { RequireAuditAccess } from './RequireAuditAccess'
import { RequireAuth } from './RequireAuth'
import { RequireReactivationAccess } from './RequireReactivationAccess'
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

          // reachable regardless of role, with no sidebar chrome — see
          // RequireAuth for the redirect that sends users here while
          // mustChangePassword is true
          { path: '/change-required-password', element: <ChangeRequiredPasswordPage /> },

          // reachable regardless of role while accessState is anything but
          // POLICY_ACCEPTED / ACCOUNT_INACTIVE — see RequireAuth
          { path: '/policy-required', element: <PolicyRequiredPage /> },

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
                  { path: 'users/:userId', element: <UserDetailPage /> },
                  { path: 'students', element: <StudentsPage /> },
                  { path: 'students/:userId', element: <StudentDetailPage /> },
                  { path: 'courses', element: <AdminCoursesPage /> },
                  { path: 'courses/:courseId', element: <AdminCourseDetailPage /> },
                  { path: 'courses/:courseId/modules/:moduleId', element: <AdminModuleDetailPage /> },
                  { path: 'template-library', element: <AdminTemplateLibraryPage /> },
                  {
                    element: <RequireAuditAccess />,
                    children: [{ path: 'audit', element: <AuditPage /> }],
                  },
                  {
                    element: <RequireReactivationAccess />,
                    children: [
                      { path: 'reactivation-requests', element: <ReactivationRequestsPage /> },
                    ],
                  },
                  { path: 'email-blocklist', element: <EmailBlocklistPage /> },
                  { path: 'profile', element: <AdminProfilePage /> },
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
                  { path: 'template-library', element: <InstructorTemplateLibraryPage /> },
                  { path: 'users', element: <InstructorUsersPage /> },
                  { path: 'profile', element: <InstructorProfilePage /> },
                  {
                    element: <RequireAuditAccess />,
                    children: [{ path: 'audit', element: <AuditPage /> }],
                  },
                  {
                    element: <RequireReactivationAccess />,
                    children: [
                      { path: 'reactivation-requests', element: <ReactivationRequestsPage /> },
                    ],
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
                  { path: 'profile', element: <StudentProfilePage /> },
                  {
                    element: <RequireAuditAccess />,
                    children: [{ path: 'audit', element: <AuditPage /> }],
                  },
                  {
                    element: <RequireReactivationAccess />,
                    children: [
                      { path: 'reactivation-requests', element: <ReactivationRequestsPage /> },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
