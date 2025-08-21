import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth-store'

// Layouts
const AuthLayout = () => import('@/layouts/AuthLayout.vue')
const AdminLayout = () => import('@/layouts/AdminLayout.vue')
const TeacherLayout = () => import('@/layouts/TeacherLayout.vue')
const StudentLayout = () => import('@/layouts/StudentLayout.vue')

// Pages d'authentification
const LoginView = () => import('@/views/auth/LoginView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')

// Pages administrateur
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const StudentManagement = () => import('@/views/admin/StudentManagement.vue')
const ModuleManagement = () => import('@/views/admin/ModuleManagement.vue')
const InscriptionManagement = () => import('@/views/admin/InscriptionManagement.vue')
const GradeReport = () => import('@/views/admin/GradeReport.vue')
const UserManagement = () => import('@/views/admin/UserManagement.vue')
const SystemSettings = () => import('@/views/admin/SystemSettings.vue')

// Pages enseignant
const TeacherDashboard = () => import('@/views/teacher/TeacherDashboard.vue')
const GradeManagement = () => import('@/views/teacher/GradeManagement.vue')
const AttendanceManagement = () => import('@/views/teacher/AttendanceManagement.vue')
const StudentList = () => import('@/views/teacher/StudentList.vue')
const ModuleDetails = () => import('@/views/teacher/ModuleDetails.vue')

// Pages étudiant
const StudentDashboard = () => import('@/views/student/StudentDashboard.vue')
const MyGrades = () => import('@/views/student/MyGrades.vue')
const MyAttendance = () => import('@/views/student/MyAttendance.vue')
const MyModules = () => import('@/views/student/MyModules.vue')
const ProfileSettings = () => import('@/views/student/ProfileSettings.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  
  // Routes d'authentification
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresGuest: true }
      },
      {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: { requiresGuest: true }
      },
      {
        path: '/forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: { requiresGuest: true }
      }
    ]
  },
  
  // Routes administrateur
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'students',
        name: 'admin-students',
        component: StudentManagement
      },
      {
        path: 'modules',
        name: 'admin-modules',
        component: ModuleManagement
      },
      {
        path: 'inscriptions',
        name: 'admin-inscriptions',
        component: InscriptionManagement
      },
      {
        path: 'reports',
        name: 'admin-reports',
        component: GradeReport
      },
      {
        path: 'users',
        name: 'admin-users',
        component: UserManagement
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: SystemSettings
      }
    ]
  },
  
  // Routes enseignant
  {
    path: '/teacher',
    component: TeacherLayout,
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      {
        path: 'dashboard',
        name: 'teacher-dashboard',
        component: TeacherDashboard
      },
      {
        path: 'grades',
        name: 'teacher-grades',
        component: GradeManagement
      },
      {
        path: 'attendance',
        name: 'teacher-attendance',
        component: AttendanceManagement
      },
      {
        path: 'students',
        name: 'teacher-students',
        component: StudentList
      },
      {
        path: 'modules',
        name: 'teacher-modules',
        component: ModuleDetails
      }
    ]
  },
  
  // Routes étudiant
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresAuth: true, role: 'student' },
    children: [
      {
        path: 'dashboard',
        name: 'student-dashboard',
        component: StudentDashboard
      },
      {
        path: 'grades',
        name: 'student-grades',
        component: MyGrades
      },
      {
        path: 'attendance',
        name: 'student-attendance',
        component: MyAttendance
      },
      {
        path: 'modules',
        name: 'student-modules',
        component: MyModules
      },
      {
        path: 'profile',
        name: 'student-profile',
        component: ProfileSettings
      }
    ]
  },
  
  // Route par défaut basée sur le rôle
  {
    path: '/dashboard',
    name: 'dashboard',
    redirect: (to) => {
      const authStore = useAuthStore()
      const user = authStore.user
      
      if (!user) return '/login'
      
      switch (user.role) {
        case 'admin':
          return '/admin/dashboard'
        case 'teacher':
          return '/teacher/dashboard'
        case 'student':
          return '/student/dashboard'
        default:
          return '/login'
      }
    },
    meta: { requiresAuth: true }
  },
  
  // Route 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guards de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialiser l'authentification si nécessaire
  if (!authStore.initialized) {
    await authStore.initializeAuth()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiredRole = to.matched.find(record => record.meta.role)?.meta.role
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (requiredRole && authStore.user?.role !== requiredRole) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router