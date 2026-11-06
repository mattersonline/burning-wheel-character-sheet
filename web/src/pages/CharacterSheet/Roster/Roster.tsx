import type { Character } from '../../../api/characters'
import Button from '../../../components/Button/Button'
import Eyebrow from '../../../components/Eyebrow/Eyebrow'
import styles from './styles.module.css'

type RosterProps = {
  characters: Character[]
  selectedId: string | undefined
  busy: boolean
  collapsed: boolean
  onToggle: () => void
  onSelect: (character: Character) => void
  onCreate: () => void
  onDelete: (character: Character) => void
}

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
  </svg>
)

const Roster = ({
  characters,
  selectedId,
  busy,
  collapsed,
  onToggle,
  onSelect,
  onCreate,
  onDelete,
}: RosterProps) => (
  <aside
    className={`${styles.roster}${collapsed ? ` ${styles.collapsed}` : ''}`}
    aria-label="Character roster"
  >
    <button
      className={styles.toggle}
      type="button"
      aria-expanded={!collapsed}
      aria-label={collapsed ? 'Show character list' : 'Hide character list'}
      title={collapsed ? 'Show character list' : 'Hide character list'}
      onClick={onToggle}
    >
      <span aria-hidden="true">{collapsed ? '»' : '«'}</span>
    </button>
    {!collapsed && (
      <>
        <div className={styles.heading}>
          <div>
            <Eyebrow>Campaign records</Eyebrow>
            <h1>Characters</h1>
          </div>
          <span className={styles.count}>{characters.length.toString().padStart(2, '0')}</span>
        </div>
        <Button block onClick={onCreate} disabled={busy}>
          <span aria-hidden="true">+</span> New character
        </Button>
        <div className={styles.list}>
          {characters.map((character) => (
            <div className={styles.row} key={character.id}>
              <button
                className={`${styles.item}${selectedId === character.id ? ` ${styles.selected}` : ''}`}
                type="button"
                onClick={() => onSelect(character)}
              >
                <span className={styles.avatar} aria-hidden="true">
                  {(character.name || '?').slice(0, 1).toUpperCase()}
                </span>
                <span className={styles.copy}>
                  <strong>{character.name || 'Unnamed character'}</strong>
                  <small>{character.concept || character.stock || 'Unwritten record'}</small>
                </span>
              </button>
              <button
                className={styles.delete}
                type="button"
                aria-label={`Delete ${character.name || 'unnamed character'}`}
                onClick={() => onDelete(character)}
                disabled={busy}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          {characters.length === 0 && (
            <p className={styles.empty}>Your campaign records will appear here.</p>
          )}
        </div>
        <div className={styles.footnote}>A living record of the people in your story.</div>
      </>
    )}
  </aside>
)

export default Roster
