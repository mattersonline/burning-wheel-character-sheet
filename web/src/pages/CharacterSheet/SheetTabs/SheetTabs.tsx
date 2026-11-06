import type { KeyboardEvent } from 'react'
import ArthaTab from '../ArthaTab/ArthaTab'
import AttributesTab from '../AttributesTab/AttributesTab'
import CombatTab from '../CombatTab/CombatTab'
import InformationTab from '../InformationTab/InformationTab'
import NotesTab from '../NotesTab/NotesTab'
import SkillsTab from '../SkillsTab/SkillsTab'
import { type TabId, tabs } from '../tabs'
import type { SheetTabProps } from '../types'
import styles from './styles.module.css'

type SheetTabsProps = SheetTabProps & {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  // A stat or attribute whose check should open on the attributes tab.
  checkId: string | null
  onCheckOpened: () => void
}

const SheetTabs = ({
  activeTab,
  onTabChange,
  checkId,
  onCheckOpened,
  ...tabProps
}: SheetTabsProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    let nextIndex = currentIndex
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabs.length - 1
    else return
    event.preventDefault()
    onTabChange(tabs[nextIndex].id)
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus()
  }

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="Character sheet sections">
        {tabs.map((tab) => (
          <button
            className={`${styles.tab}${activeTab === tab.id ? ` ${styles.active}` : ''}`}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={handleKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className={styles.panel}
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'information' && <InformationTab {...tabProps} />}
        {activeTab === 'combat' && <CombatTab {...tabProps} />}
        {activeTab === 'attributes' && (
          <AttributesTab {...tabProps} checkId={checkId} onCheckOpened={onCheckOpened} />
        )}
        {activeTab === 'skills' && <SkillsTab {...tabProps} />}
        {activeTab === 'artha' && <ArthaTab {...tabProps} />}
        {activeTab === 'notes' && <NotesTab {...tabProps} />}
      </div>
    </>
  )
}

export default SheetTabs
