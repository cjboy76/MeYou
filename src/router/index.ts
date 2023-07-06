import { createRouter, createWebHistory } from 'vue-router'
import ChatRoom from '@/views/ChatRoom.vue'
import HomePage from '@/views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/room/:roomid',
      name: 'chatroom',
      component: ChatRoom
    },
  ]
})

router.beforeEach((to, from) => {
  if (from.name === undefined && to.name === 'chatroom') return '/'
  return true
})

export default router
