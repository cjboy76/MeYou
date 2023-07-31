import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid';

export const useUserStore = defineStore('user', () => {
  const uid = uuidv4()

  return { uid }
})
