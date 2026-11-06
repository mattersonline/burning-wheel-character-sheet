import { useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'

type DieProps = {
  value: number
  rolling: boolean
  // How long the die spins through faces before settling on its value.
  duration: number
  onSettled: () => void
  tone?: 'hit' | 'miss'
}

const pips: Record<number, [number, number][]> = {
  1: [[5, 5]],
  2: [
    [3, 3],
    [7, 7],
  ],
  3: [
    [3, 3],
    [5, 5],
    [7, 7],
  ],
  4: [
    [3, 3],
    [7, 3],
    [3, 7],
    [7, 7],
  ],
  5: [
    [3, 3],
    [7, 3],
    [5, 5],
    [3, 7],
    [7, 7],
  ],
  6: [
    [3, 3],
    [7, 3],
    [3, 5],
    [7, 5],
    [3, 7],
    [7, 7],
  ],
}

const randomFace = () => Math.floor(Math.random() * 6) + 1

export const dieRollDuration = (animate: boolean) => (animate ? 800 : 0)

const Die = ({ value, rolling, duration, onSettled, tone }: DieProps) => {
  const [face, setFace] = useState(value)
  const settledRef = useRef(onSettled)

  useEffect(() => {
    settledRef.current = onSettled
  })

  useEffect(() => {
    if (!rolling) {
      setFace(value)
      return
    }
    const spin = setInterval(() => setFace(randomFace()), 100)
    const stop = setTimeout(() => {
      clearInterval(spin)
      setFace(value)
      settledRef.current()
    }, duration)
    return () => {
      clearInterval(spin)
      clearTimeout(stop)
    }
  }, [rolling, value, duration])

  const classes = [styles.die, rolling && styles.spinning, tone && styles[tone]]
    .filter(Boolean)
    .join(' ')

  return (
    <svg className={classes} viewBox="0 0 10 10" role="img" aria-label={`Die showing ${face}`}>
      <rect className={styles.face} x="0.75" y="0.75" width="8.5" height="8.5" rx="2" />
      {pips[face].map(([x, y]) => (
        <circle className={styles.pip} key={`${x}-${y}`} cx={x} cy={y} r="0.8" />
      ))}
    </svg>
  )
}

export default Die
