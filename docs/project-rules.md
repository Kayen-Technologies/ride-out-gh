# Project Development Rules

## Read first

- Colour, type, radius and effects: docs/design-tokens.md

## Design fidelity

- Treat the supplied Figma designs as the source of truth.
- Do not invent new layouts or redesign existing components.
- Match typography, colors, spacing, dimensions, borders, shadows and radii.
- Use supplied images, SVGs, icons and fonts whenever available.
- Avoid generic dashboard templates unless they match the design.

## Architecture

- Use TypeScript and strict typing.
- Build reusable, composable components.
- Separate UI components, business logic, API services and data models.
- Follow the existing project conventions.
- Avoid unnecessary dependencies and duplicated code.

## Functionality

- Every visible interactive element must work.
- Implement loading, empty, error, success and disabled states where appropriate.
- Validate user input on the client and server where applicable.
- Enforce permissions on the server, not only in the UI.
- Never expose secrets or private credentials in client code.

## Quality assurance

- Run the available lint, type-check, test and build commands.
- Check desktop and mobile layouts.
- Compare browser screenshots against the relevant Figma frames.
- Fix existing regressions before marking a task complete.

## Scope control

- Implement one feature or page at a time.
- Do not rewrite unrelated files.
- Explain important assumptions and report any incomplete functionality.
