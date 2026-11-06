# web/src/pages/CharacterSheet/InventoryTab/

The Inventory / Gear tab edits `sheetData.inventory`, an array of items with `id`, `name`, `description` and `quantity`. `newInventoryItem` creates a blank item with a unique ID and quantity 1.

- The list grows with Add item; all three fields stay visible in the shared [RecordGrid](../../../components/RecordGrid/index.md). Cells start at 52px high with 16px text and the whole row expands to fit wrapped text.
- Quantity is a nonnegative whole number, including zero. Invalid values trigger native input validation and are not saved.
- Removal requires two taps on the inline Remove/Confirm button; interacting elsewhere clears confirmation without deleting. Other deletions still use the modal.
- The Go API accepts the old inventory string, preserving all text in the description of one "Imported inventory" item with quantity 1. No text is split or discarded. Empty or missing inventory becomes an empty list.
- Items use the page's existing autosave, so additions, edits and confirmed removals persist through character switches and refresh.
