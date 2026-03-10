# iCHIS Configuration App

A DHIS2 Platform App for managing iCHIS configurations stored in the `community_redesign` datastore namespace.

## Overview

This app provides a graphical interface for managing the JSON configurations that previously had to be edited manually. It is inspired by the DHIS2 Android Settings App and Use Case Configuration App.

### Managed Configuration Keys

| Key | Description |
|-----|-------------|
| `workflow` | Auto-increment attributes, entity auto-creation, program enrollment control, TEI creatable programs |
| `tasking` | Program task definitions with trigger/completion conditions, TEI views, task program config |
| `taskProgramConfiguration` | Option sets, relationship types, tracked entity types/attributes for tasking |
| `relationship` | Program relationship definitions with access, attribute mappings, and view configuration |

## Architecture

- **Meta-Config Schema** (`src/config/configSchema.js`) — Declarative schema for all four config keys. Defines field types, labels, required flags, and which DHIS2 metadata endpoint to query for UID pickers. This is the "config for the config app."
- **Datastore Service** (`src/services/datastoreService.js`) — Custom hooks for reading/writing to the `community_redesign` namespace using `@dhis2/app-runtime`.
- **Metadata Resolver** (`src/services/metadataResolver.js`) — Fetches and caches DHIS2 metadata (programs, attributes, TETs, etc.) so UIDs display as human-readable names.
- **Generic ConfigPage** (`src/pages/ConfigPage.jsx`) — Handles load/save/import/export for any config key based on a schema.
- **ConfigFormRenderer** (`src/components/ConfigFormRenderer.jsx`) — Schema-driven form that auto-renders all field types recursively.

## Development

```bash
# Install dependencies
yarn install

# Start development server (connects to https://project.ccdev.org/chisdev)
yarn start

# Build for production
yarn build
```

The app requires login to the configured DHIS2 instance. The development proxy is set via `DHIS2_BASE_URL` in `.env`.

## Adding New Config Keys

1. Add your schema to `src/config/configSchema.js` (export it and add to `ALL_SCHEMAS` and `SCHEMA_BY_KEY`)
2. Create a page component in `src/pages/` that renders `<ConfigPage schema={yourSchema} />`
3. Add the route to `src/App.jsx`
4. Add the nav item to `src/components/Sidebar.jsx`

## Tech Stack

- [DHIS2 App Platform](https://developers.dhis2.org/docs/app-platform/about)
- [`@dhis2/ui`](https://ui.dhis2.nu/) — DHIS2 UI component library
- [`@dhis2/app-runtime`](https://runtime.dhis2.nu/) — Data query/mutation hooks
- [React Router v6](https://reactrouter.com/)
