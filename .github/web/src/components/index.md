# web/src/components/

Components used in multiple locations. Single-use components stay beside their page (see [pages](../pages/index.md)).

| Folder | Contents |
| --- | --- |
| [AbilityRecord/](AbilityRecord/index.md) | The ability card, its dice roller (`CheckModal/`), bubble track, shade button and stepper. |
| [RecordGrid/](RecordGrid/index.md) | Shared tablet-friendly spreadsheet-style editor for inventory, relationships and traits. |

Other shared components (`Button`, `Field`, `TextField`, `AddButton`, `RemoveButton`, `SectionHeading`, `TabIntro`, `Eyebrow`) have no extra documentation.

## DiceButton and DiceIcon

`DiceButton/` is the shared dice button, used by ability cards, learning-skill cards and the derived-stat roll buttons (`small`). It owns the incapacitated shake: when `incapacitated` is set, tapping it shakes instead of calling `onOpen`. `DiceIcon/` is the shared icon (prop `size`).

## ThemeToggle

`ThemeToggle/` is the sun/moon button in the top bar. `useTheme` resolves the theme as the stored choice (`localStorage` key `bw-theme`) or else the OS `prefers-color-scheme` setting, which it follows live until the user picks one. It sets `data-theme` on `<html>` (and the `theme-color` meta); `index.html` runs the same lookup inline to avoid a flash on load. Colors come from `web/src/theme.css`.

## FateRoller

`FateRoller/` is a crystal-ball button at the bottom of the header's identity column (far right of the identity row once the stat blocks wrap below it, decided by the header's own width via a container query). Each tap rolls one straight d6 (`rollDie` from `CheckModal/rules`) and shows the number next to the button; a six adds a gold glow, a ring burst and a sparkle on the number. Animations restart on every roll (keyed by roll count) and are disabled under `prefers-reduced-motion`. The result is in an `aria-live` `<output>`. Nothing is stored.

`ConfirmDialog` is a modal confirmation (native `<dialog>`, mounted only while pending). `RemoveButton` confirms through it automatically. The mandate that all deletions confirm lives in the root [copilot-instructions.md](../../../copilot-instructions.md).

Grid records use the two-tap inline confirmation documented in [RecordGrid](RecordGrid/index.md) instead of the modal. The modal remains for other deletions, with a centered theme-aware panel, clear warning heading and 48px Cancel/confirmation actions.
