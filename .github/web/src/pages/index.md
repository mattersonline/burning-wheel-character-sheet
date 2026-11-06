# web/src/pages/

One folder per page, such as `CharacterSheet/`. Keep page components thin: data hooks, draft state and layout.

- Single-use subcomponents live in files beside the page component.
- A subcomponent that needs its own extra files gets its own folder named after it (for example `CharacterSheet/SkillsTab/`).
- Only components used in multiple locations go in [components/](../components/index.md).

| Folder | Contents |
| --- | --- |
| [CharacterSheet/](CharacterSheet/index.md) | The character roster and tabbed character sheet. |
