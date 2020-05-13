import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('components/Login')
const Home = () => import('views/home/Home')
const HomeWelcome = () => import('views/home/children/HomeWelcome')
const Users = () => import('views/users/Users')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: HomeWelcome
      },
      {
        path: '/users',
        component: Users
      }
    ]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()

  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')

  // 未登陆
  if (!tokenStr) return next('/login')

  // 放行
  next()
})

export default router
