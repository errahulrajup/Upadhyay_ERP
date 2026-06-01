# Phase 8 - Route-Ready Screens

## Objective

Split the vertical-slice module cockpit into screen-level components so each business module can later become its own route, permission scope, and data boundary without rewriting the cockpit.

## Completed

- Added a shared `ModuleCard` and `StepBadge` presentation component.
- Added one screen component per first-slice module:
  - GRN approval
  - Batch planning
  - Batch execution
  - QC release
  - Dispatch
  - Invoice and payment
- Converted `VerticalSliceModules` into a composition layer that wires forms, workflow steps, and handlers into those screens.
- Added a screen export registry test so future route wiring has a single stable import surface.

## Design Rule

Screens remain UI orchestration only. They do not call RPCs directly, mutate database state, or own cross-module workflow rules. Service calls stay behind the service layer and workflow runner.

## Next Phase

Phase 9 should introduce the navigation shell for module routes and permission-aware entry points while keeping the existing first-slice runner as the regression control.
