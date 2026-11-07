import { useEffect, useState } from 'react'
import { isOnline, subscribeOnline } from './online.js'

export function useOnline() {
  const [online, setOnline] = useState(isOnline)

  useEffect(() => subscribeOnline(setOnline), [])

  return online
}
