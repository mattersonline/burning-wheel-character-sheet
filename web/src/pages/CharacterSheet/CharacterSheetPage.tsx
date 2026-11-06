import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import type { Character, CharacterFields, SheetData } from '@/api/characters'
import {
  useCharacters,
  useCreateCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
} from '@/api/characters'
import { getErrorMessage } from '@/api/client'
import ConfirmDialog from '@/components/ConfirmDialog'
import Eyebrow from '@/components/Eyebrow'
import ThemeToggle from '@/components/ThemeToggle'
import ArthaSummary from '@/pages/CharacterSheet/ArthaSummary'
import CharacterSummary from '@/pages/CharacterSheet/CharacterSummary'
import { calculateWoundPenalty } from '@/pages/CharacterSheet/CombatTab/injuries'
import EmptySheet from '@/pages/CharacterSheet/EmptySheet'
import Roster from '@/pages/CharacterSheet/Roster'
import SheetTabs from '@/pages/CharacterSheet/SheetTabs'
import { readSheetUrl, writeSheetUrl } from '@/pages/CharacterSheet/sheetUrl'
import type { TabId } from '@/pages/CharacterSheet/tabs'
import styles from './styles.module.css'

const autosaveDelayMs = 600

const CharacterSheetPage = () => {
  const charactersQuery = useCharacters()
  const createMutation = useCreateCharacter()
  const updateMutation = useUpdateCharacter()
  const deleteMutation = useDeleteCharacter()
  const characters = charactersQuery.data ?? []
  const [draft, setDraft] = useState<Character | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const selection = readSheetUrl(
    searchParams,
    characters.map((character) => character.id),
  )
  const activeTab = selection.tab
  const navigateSheet = (characterId: string | null, tab: TabId, checkId: string | null = null) =>
    setSearchParams((current) => writeSheetUrl(current, characterId, tab), { state: { checkId } })
  const setActiveTab = (tab: TabId) => {
    navigateSheet(draft?.id ?? selection.characterId, tab)
  }
  const [rosterCollapsed, setRosterCollapsed] = useState(false)
  // Stat or attribute id whose check should open, set from the summary.
  const navigationState: unknown = location.state
  const checkId =
    navigationState &&
    typeof navigationState === 'object' &&
    'checkId' in navigationState &&
    typeof navigationState.checkId === 'string'
      ? navigationState.checkId
      : null
  const draftRef = useRef<Character | null>(null)
  const baseline = useRef<{ id: string; json: string } | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  let status = message
  if (charactersQuery.isError) status = 'API unavailable · start the Go server on port 8081'
  else if (charactersQuery.isPending) status = 'Connecting to the character archive…'
  else if (!status)
    status = characters.length ? 'Archive ready' : 'Archive ready · no characters yet'

  const createCharacter = async () => {
    try {
      await saveNow()
      const created = await createMutation.mutateAsync()
      setDraft(created)
      navigateSheet(created.id, 'information')
      setMessage('New character created')
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not create character'))
    }
  }

  const serialize = (character: Character) => JSON.stringify({ ...character, updatedAt: undefined })

  // Changes save automatically: shortly after the last edit, and immediately when a field loses focus.
  const saveNow = async () => {
    const current = draftRef.current
    if (!current || baseline.current?.id !== current.id) return
    const json = serialize(current)
    if (json === baseline.current.json) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    baseline.current = { id: current.id, json }
    try {
      await updateMutation.mutateAsync(current)
      setMessage('All changes saved')
    } catch (error) {
      if (baseline.current?.id === current.id) baseline.current = { id: current.id, json: '' }
      setMessage(getErrorMessage(error, 'Could not save changes'))
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: saveNow reads the current draft from refs; only URL selection and query changes should trigger navigation.
  useEffect(() => {
    if (!charactersQuery.data) return
    if (draftRef.current?.id !== selection.characterId) {
      void saveNow()
      setDraft(charactersQuery.data.find((item) => item.id === selection.characterId) ?? null)
    }
    if (selection.invalidCharacter || selection.invalidTab) {
      setMessage(
        selection.invalidCharacter
          ? 'Character in the URL was not found · showing the first available character'
          : 'Tab in the URL was not found · showing Character information',
      )
    }
    const canonical = writeSheetUrl(searchParams, selection.characterId, selection.tab)
    if (canonical.toString() !== searchParams.toString()) {
      setSearchParams(canonical, { replace: true })
    }
  }, [charactersQuery.data, searchParams, selection.characterId, selection.tab, setSearchParams])

  // biome-ignore lint/correctness/useExhaustiveDependencies: saveNow reads refs and is recreated every render
  useEffect(() => {
    draftRef.current = draft
    if (!draft) {
      baseline.current = null
      return
    }
    if (baseline.current?.id !== draft.id) {
      baseline.current = { id: draft.id, json: serialize(draft) }
      return
    }
    if (serialize(draft) === baseline.current.json) return
    saveTimer.current = setTimeout(() => void saveNow(), autosaveDelayMs)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [draft])

  const selectCharacter = async (character: Character) => {
    await saveNow()
    navigateSheet(character.id, activeTab)
  }

  const [pendingDelete, setPendingDelete] = useState<Character | null>(null)

  const deleteCharacter = async (target: Character) => {
    setPendingDelete(null)
    try {
      await deleteMutation.mutateAsync(target.id)
      if (draft?.id === target.id) {
        const next = characters.find((item) => item.id !== target.id) ?? null
        setDraft(next)
        navigateSheet(next?.id ?? null, activeTab)
      }
      setMessage('Character deleted')
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not delete character'))
    }
  }

  const updateField = (field: keyof CharacterFields, value: string) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current))
  }

  const updateSheetData = <K extends keyof SheetData>(key: K, value: SheetData[K]) => {
    setDraft((current) =>
      current ? { ...current, sheetData: { ...current.sheetData, [key]: value } } : current,
    )
  }

  return (
    <main className={styles.appShell}>
      <header className={styles.topbar}>
        <Link className={styles.wordmark} to="/" aria-label="Burning Wheel character archive">
          <span className={styles.mark} aria-hidden="true">
            BW
          </span>
          <span>Character archive</span>
        </Link>
        <div className={styles.topbarEnd}>
          <div className={styles.connection}>
            <span className={styles.connectionDot} />
            {status}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className={`${styles.workspace}${rosterCollapsed ? ` ${styles.rosterCollapsed}` : ''}`}>
        <Roster
          characters={characters}
          selectedId={draft?.id}
          busy={busy}
          collapsed={rosterCollapsed}
          onToggle={() => setRosterCollapsed((value) => !value)}
          onSelect={selectCharacter}
          onCreate={createCharacter}
          onDelete={setPendingDelete}
        />

        <section className={styles.sheetArea} aria-label="Character sheet">
          {draft ? (
            <>
              <div className={styles.toolbar}>
                <div className={styles.record}>
                  <Eyebrow>Character record</Eyebrow>
                  <CharacterSummary
                    character={draft}
                    onCheck={(id) => {
                      const blocked =
                        (id === 'steel' || draft.sheetData.stats.some((stat) => stat.id === id)) &&
                        calculateWoundPenalty(draft.sheetData.stats, draft.sheetData.injuryWounds)
                          .incapacitated
                      if (blocked) {
                        setMessage(
                          'Cannot roll this check · character is incapacitated by a mortal wound',
                        )
                        return
                      }
                      navigateSheet(draft.id, 'attributes', id)
                    }}
                  >
                    <ArthaSummary pool={draft.sheetData.arthaPool} />
                  </CharacterSummary>
                </div>
              </div>

              <form
                className={styles.characterForm}
                onBlur={() => void saveNow()}
                onSubmit={(event) => event.preventDefault()}
              >
                <SheetTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  checkId={checkId}
                  onCheckOpened={() =>
                    setSearchParams(searchParams, { replace: true, state: null })
                  }
                  character={draft}
                  updateField={updateField}
                  updateSheetData={updateSheetData}
                />
              </form>
            </>
          ) : (
            <EmptySheet busy={busy} onCreate={createCharacter} />
          )}
        </section>
      </div>
      {pendingDelete && (
        <ConfirmDialog
          title={`Delete ${pendingDelete.name || 'this character'}?`}
          message="The whole character record will be removed. This can't be undone."
          onConfirm={() => void deleteCharacter(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  )
}

export default CharacterSheetPage
