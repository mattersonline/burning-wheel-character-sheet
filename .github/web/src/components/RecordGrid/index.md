# web/src/components/RecordGrid/

`RecordGrid` is the shared spreadsheet-style list editor. Inventory, relationships (including Circles), and all three trait types use it rather than separate card layouts.

- Every cell starts at 52px high with 16px text for tablet editing. Text and description fields wrap and automatically grow the entire row to fit its tallest text field; numeric/select fields match that height. Rows shrink again when text is shortened and resize when the grid width changes.
- Columns supply typed value/update callbacks. The grid updates records by stable ID and appends through the caller's row factory. Grid removal uses `InlineRemoveButton`: the first tap changes Remove to Confirm; only the second tap deletes. There is no Cancel button. Interacting elsewhere, moving focus, scrolling, pressing another key or leaving the window clears confirmation.
- Numeric fields accept nonnegative whole numbers; invalid values show native validation and are not saved.
- Tables have column headers and row-numbered accessible input labels. Normal Tab navigation moves between controls; the component does not implement Excel formulas or spreadsheet keyboard shortcuts.
