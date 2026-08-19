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
}

export interface EnrolledStudent {
  id: string
  name: string
  email: string
  username: string
  assignedAt: string
}

export interface AvailableStudent {
  id: string
  name: string
  email: string
  username: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface UserCourse {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  active: boolean
  assignedAt: string
}

export interface StudentOverview {
  id: string
  name: string
  email: string
  username: string
  totalCourses: number
  courses: { id: string; title: string }[]
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

export type QuizAttemptStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface QuizInfo {
  moduleId: string
  totalQuestions: number
  avgTimeLimitSec: number
  latestAttemptId: string | null
  latestStatus: QuizAttemptStatus | null
}

// Never carries `correct` on an option, or a correct-option reference — the
// backend withholds that until the attempt is COMPLETED.
export interface QuizAttemptQuestion {
  id: string
  statement: string
  timeLimitSec: number
  position: number
  options: Pick<QuestionOption, 'id' | 'letter' | 'text'>[]
  selectedOptionId: string | null
  questionStartedAt: string | null
}

export interface QuizAttemptState {
  attemptId: string
  status: QuizAttemptStatus
  startedAt: string
  totalQuestions: number
  questions: QuizAttemptQuestion[]
}

export interface QuizResultQuestion {
  questionId: string
  text: string
  position: number
  selectedOption: Pick<QuestionOption, 'id' | 'letter' | 'text'> | null
  correctOption: Pick<QuestionOption, 'id' | 'letter' | 'text'> | null
  isCorrect: boolean
  elapsedSeconds: number
  overtimeSeconds: number
}

export interface QuizResult {
  attemptId: string
  status: QuizAttemptStatus
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  percentage: number
  totalTimeSec: number
  questions: QuizResultQuestion[]
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
