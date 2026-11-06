import styles from './styles.module.css'

const colors = ['#e0a526', '#2f7a4b', '#c0562f', '#3f78b5', '#b04f8f']

// Fixed layout (golden-angle spread) so renders are deterministic.
const pieces = Array.from({ length: 36 }, (_, id) => {
  const angle = (id * 137.5 * Math.PI) / 180
  const distance = 70 + ((id * 53) % 110)
  return {
    id,
    dx: Math.round(Math.cos(angle) * distance * 1.4),
    dy: Math.round(Math.sin(angle) * distance - 60),
    spin: ((id * 97) % 720) - 360,
    delay: (id % 6) * 25,
    color: colors[id % colors.length],
  }
})

const Confetti = () => (
  <div className={styles.confetti} aria-hidden="true">
    {pieces.map((piece) => (
      <i
        className={styles.piece}
        key={piece.id}
        style={{
          backgroundColor: piece.color,
          animationDelay: `${piece.delay}ms`,
          ['--dx' as string]: `${piece.dx}px`,
          ['--dy' as string]: `${piece.dy}px`,
          ['--spin' as string]: `${piece.spin}deg`,
        }}
      />
    ))}
  </div>
)

export default Confetti
