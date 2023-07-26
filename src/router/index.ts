import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import ChatRoom from '@/views/ChatRoom.vue'
import HomePage from '@/views/HomePage.vue'
import { checkRoom } from '@/service'
import { toast } from 'vue-sonner'

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
      component: ChatRoom,
      beforeEnter: [checkRoomStatus]
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: '/'
    }
  ]
})

async function checkRoomStatus({ params, query }: RouteLocationNormalized) {
  const status = await checkRoom(params.roomid as string)
  if (query.isHost === 'true') return true
  if (!query.isHost && !status?.guestId) return true

  toast('Chatroom not available')

  return '/'
}

export default router
