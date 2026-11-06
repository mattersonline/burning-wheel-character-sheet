import type { KeyboardEvent } from 'react'
import ArthaTab from '@/pages/CharacterSheet/ArthaTab'
import AttributesTab from '@/pages/CharacterSheet/AttributesTab'
import CombatTab from '@/pages/CharacterSheet/CombatTab'
import InformationTab from '@/pages/CharacterSheet/InformationTab'
import InventoryTab from '@/pages/CharacterSheet/InventoryTab'
import NotesTab from '@/pages/CharacterSheet/NotesTab'
import RelationshipsTab from '@/pages/CharacterSheet/RelationshipsTab'
import SkillsTab from '@/pages/CharacterSheet/SkillsTab'
import { type TabId, tabs } from '@/pages/CharacterSheet/tabs'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'
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
        {activeTab === 'relationships' && <RelationshipsTab {...tabProps} />}
        {activeTab === 'inventory' && <InventoryTab {...tabProps} />}
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
