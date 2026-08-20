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
  about: string | null
  targetAudience: string | null
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
  studyPriority: number
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

export type StudySessionStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface StudySession {
  id: string
  userId: string
  courseId: string
  moduleId: string
  status: StudySessionStatus
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
}

export interface ActiveStudySession {
  id: string
  moduleId: string
  moduleTitle: string
  moduleType: ModuleType
  courseId: string
  courseTitle: string
  startedAt: string
}

export interface StudyDaySession {
  id: string
  moduleId: string
  moduleTitle: string
  moduleType: ModuleType
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
}

export interface StudyDayGroup {
  date: string
  totalSeconds: number
  sessions: StudyDaySession[]
}

export interface StudyScheduleSummary {
  totalSecondsLast14Days: number
  sessionsCountLast14Days: number
  modulesStudiedLast14Days: number
  totalSecondsToday: number
}

export type StudyRecommendationReason =
  | 'NEVER_STUDIED'
  | 'LOW_QUIZ_SCORE'
  | 'LONG_TIME_NO_STUDY'
  | 'HIGH_PRIORITY'
  | 'LOW_COVERAGE'

export interface StudyRecommendation {
  moduleId: string
  title: string
  type: ModuleType
  reason: StudyRecommendationReason
  daysSinceLastStudy: number | null
  quizPercentage: number | null
  studyPriority: number
}

export interface StudySchedule {
  activeSession: ActiveStudySession | null
  summary: StudyScheduleSummary
  history: StudyDayGroup[]
  recommendations: StudyRecommendation[]
}

export interface TemplateLibraryFile {
  id: string
  name: string
  description: string | null
  originalName: string
  storageKey: string
  mimeType: string
  fileSize: number
  uploadedById: string
  uploadedBy: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface ApiErrorBody {
  success: false
  statusCode: number
  path: string
  timestamp: string
  message: string | string[]
}
