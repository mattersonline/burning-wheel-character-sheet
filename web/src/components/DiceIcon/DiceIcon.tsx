const DiceIcon = ({ size = 26 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" />
    <circle cx="15.5" cy="8.5" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="8.5" cy="15.5" r="1.6" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.6" fill="currentColor" />
  </svg>
)

export default DiceIcon
