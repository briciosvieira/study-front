export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
export type ModuleType = 'PDF' | 'VIDEO' | 'QUIZ'

export interface User {
  id: string
  name: string
  email: string
  username: string
  role: Role
  active: boolean
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  active: boolean
  createdById: string
  createdAt: string
  // present only when a staff member (admin/instructor) fetches the course
  visibilities?: { userId: string }[]
}

export interface CourseModule {
  id: string
  courseId: string
  type: ModuleType
  title: string
  coverUrl: string | null
  visible: boolean
  order: number
  createdAt: string
}

export interface PdfItem {
  id: string
  moduleId: string
  title: string
  fileUrl: string
  fileKey: string
  sizeBytes: string | null
  orderLabel: string
  orderNum: number
  createdAt: string
}

export interface VideoItem {
  id: string
  moduleId: string
  title: string
  fileUrl: string
  fileKey: string | null
  durationSec: number | null
  orderLabel: string
  orderNum: number
  createdAt: string
}

export interface QuestionOption {
  id: string
  letter: string
  text: string
  correct?: boolean
}

export interface Question {
  id: string
  moduleId: string
  statement: string
  timeLimitSec: number
  order: number
  createdAt: string
  options: QuestionOption[]
}

export interface QuizQuestionView {
  id: string
  statement: string
  timeLimitSec: number
  options: Pick<QuestionOption, 'id' | 'letter' | 'text'>[]
}

export interface QuizStartResponse {
  attemptId: string
  finished: boolean
  question?: QuizQuestionView
}

export interface QuizResultDetail {
  question: string
  chosenOption: string | null
  correctOption: string | null
  correct: boolean
}

export interface QuizResult {
  totalQuestions: number
  totalCorrect: number
  totalWrong: number
  totalTimeSec: number
  details: QuizResultDetail[]
}

export interface ImportRowError {
  line: number
  reason: string
}

export interface ImportStatusResponse {
  status: 'processing' | 'completed' | 'error'
  totalLines?: number
  imported?: number
  withError?: number
  errors?: ImportRowError[]
  reason?: string
}

export interface ApiErrorBody {
  success: false
  statusCode: number
  path: string
  timestamp: string
  message: string | string[]
}
