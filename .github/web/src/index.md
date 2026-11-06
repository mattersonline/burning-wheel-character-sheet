# web/src/

| Folder | Contents |
| --- | --- |
| [api/](api/index.md) | The shared axios client and one subfolder per data object (types, requests, React Query hooks). |
| [components/](components/index.md) | Components used in multiple locations. |
| [pages/](pages/index.md) | One folder per page. |

## Conventions

- Prefer const arrow functions for React components.
- A component with any file of its own (such as its CSS module) lives in a folder named after it (`Roster/Roster.tsx` + `Roster/styles.module.css`). A component with no associated files stays a plain `.tsx` file.
- Style with CSS Modules: each component has a `styles.module.css` in its own folder, imported as `styles` and referenced with camelCase class names. Only global resets and base element styles live in `index.css`.
- Style shared pieces (`Button`, `Field`, `AddButton`, `RemoveButton`, `Eyebrow`, `SectionHeading`, `TabIntro`) inside their own component rather than overriding them with parent class names.
