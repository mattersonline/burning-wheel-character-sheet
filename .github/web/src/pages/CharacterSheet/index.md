# web/src/pages/CharacterSheet/

The roster (`Roster/`, with a trash button per character; a « / » toggle collapses it to a 56px rail, state kept in `CharacterSheetPage` as `rosterCollapsed`) and the tabbed sheet. `CharacterSheetPage` holds the data hooks and draft state; each tab is its own component wired together by `SheetTabs`.

| Folder | Contents |
| --- | --- |
| [CombatTab/](CombatTab/index.md) | Injury grid and wound penalties. |
| [SkillsTab/](SkillsTab/index.md) | Skills and skills being learned. |
| [AttributesTab/](AttributesTab/index.md) | Stats, attributes and calculated stats. |

Other folders (`CharacterSummary/`, `ArthaSummary/`, and the information, artha and notes tabs) have no extra documentation.

## Tabs

Character information, Combat, Stats / Attributes, Skills, Artha, and Notes / Spells / Other.

React Router's `BrowserRouter` wraps the app. `CharacterSheetPage` uses `useSearchParams`
to keep `?character=<id>&tab=<tab-id>` as the selection source, so refresh, shared links,
and browser Back/Forward restore the same character and tab. `sheetUrl.ts` validates
these parameters and preserves unrelated query parameters. Missing parameters are
filled using replace navigation; invalid characters/tabs show a notification and are
replaced with the first available character/Information tab. Character switches save
the outgoing draft, including browser history navigation. Creation selects the new
character's Information tab; deleting the selected character selects the next available
character (or removes the character parameter for an empty roster).

- The information tab has three belief slots, one special belief, three instinct slots, and separate character, die and call-on traits.
- The Artha tab edits `sheetData.arthaPool` (available fate, persona and deed points, reusing the `Artha` type). Labels live in `artha.ts`.

## Header

Header ability clicks navigate to Attributes with the pending check id in React Router
location state, so the roller request and tab change arrive together. Opening the roller
consumes that state with replace navigation. Stats and Steel checks are blocked by mortal
wounds; clicking them in the header shows an incapacitation notice instead.

The Character record header is a tinted panel on every tab (`CharacterSummary/`). It is a horizontal row of blocks: identity (name, stock, age, id), Stats and Attributes, plus the available artha pool (`ArthaSummary/`) passed in as a child block. The identity block grows, so the others sit at the right edge. `scrollbar-gutter: stable` in `index.css` keeps the header and the "Archive ready" text from shifting between tabs.

## Autosave

`CharacterSheetPage` saves the draft 600ms after the last edit, immediately when focus leaves a field, and before switching characters. There is no Save button; the top bar shows "All changes saved" or the error.
