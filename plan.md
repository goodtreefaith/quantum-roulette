# Stabilize Quantum Roulette and Improve Usability

## Summary
- Create `plan.md` as the first execution step and copy this plan into it so implementation stays traceable.
- Prioritize real blockers first: TypeScript/global typing failures, build reliability, unreachable or nonfunctional controls, and settings/UI flows that look enabled but are not wired to game behavior.
- Keep the current futuristic visual direction, but treat usability as a product bugfix pass: clearer input validation, reliable winner flow, keyboard-accessible controls, and predictable settings persistence.

## Implementation Changes
- Extract the large inline app script from `index.html` into a typed UI bootstrap module under `src/`, leaving markup in HTML but moving behavior into TypeScript.
- Replace ad hoc `document.querySelector(...)` calls with cached typed element refs plus guard clauses so missing elements fail safely instead of crashing at runtime.
- Stop overriding native `window.performance`; expose the custom monitor as `window.performanceMonitor` and update the window typings accordingly.
- Fix the current type integration so `tsc --noEmit` passes: ensure window augmentations are included by TypeScript, export/import `translateElement` correctly, and remove unsafe `Record<string, unknown>` casting in the `Options` proxy/setter path.
- Make Parcel build reliably from a workspace path containing spaces. If the existing `yarn build` wrapper is the problem, switch scripts to a direct local binary invocation or otherwise adjust the command so build works in this repo location.
- Turn settings into a real source of truth instead of a mostly cosmetic layer:
  - Add validation/sanitization on load for enums and numeric ranges.
  - Add `resetToDefaults()` on `Options` and use the same defaults everywhere.
  - Apply settings immediately to engine/UI where promised, not just localStorage.
- Wire currently disconnected gameplay settings to actual behavior:
  - `performanceMode` updates roulette update cadence.
  - `particleCount` scales `ParticleManager` output.
  - `cameraSmoothing` and `zoomSensitivity` affect `Camera`.
  - `enableAnimations` disables optional UI animation effects.
- Fix the shake flow end to end:
  - Track when marbles are actually stalled.
  - Make `Roulette.shake()` apply impulses to active marbles.
  - Show the shake CTA only when it is actionable.
- Fix winner handling and round continuation:
  - Centralize modal open/close/remove/keep/continue logic in one controller.
  - Restore the settings panel consistently after a round.
  - Clamp custom winner rank to valid bounds when participant count changes.
  - Preserve weighted/count syntax when removing a winner only if the remaining entry is still valid.
- Improve participant input usability:
  - Validate empty/invalid names before start.
  - Show parsed participant count and rank constraints near the input.
  - Normalize duplicate entries consistently on blur without silently losing intent.
- Improve accessibility and control clarity:
  - Replace clickable `div` toggles with native checkbox/button controls styled as toggles.
  - Add keyboard/focus support, visible disabled states, and ARIA labels for modal and settings actions.
  - Respect `prefers-reduced-motion` by defaulting optional animations off for those users.
- Trim debug-only console noise and leave only meaningful error logging.

## Public Interfaces / Types
- Change the browser global from `window.performance` to `window.performanceMonitor`.
- Add a typed UI/state module interface for DOM refs and UI actions instead of relying on globals plus inline functions.
- Extend `Options` with explicit validation/default-reset helpers and keep localStorage schema backward-compatible.

## Test Plan
- Static checks: `tsc --noEmit`, `eslint`, and `yarn build` all pass in the current workspace path.
- App load: page initializes without console errors, saved names/settings load, and missing localStorage access fails gracefully.
- Input flow: empty input keeps start disabled; duplicate and weighted inputs normalize correctly; winner rank never exceeds participant count.
- Gameplay flow: start round, stall-triggered shake becomes available, shake changes marble motion, winner is announced, and remove/keep/continue each return the UI to a valid next-round state.
- Settings flow: advanced settings open/close, reset restores defaults, persisted settings survive reload, and each visible setting changes actual app behavior.
- Usability/accessibility: toggles and modals are keyboard-operable, focus is visible, reduced-motion behavior is honored, and mobile-size view keeps controls reachable.

## Assumptions and Defaults
- Preserve the existing theme and core gameplay; this is a stabilization/usability pass, not a redesign or framework migration.
- Stay on Parcel + TypeScript and avoid introducing a frontend framework.
- Keep existing localStorage keys where possible; if validation rejects old values, fall back to defaults without breaking app startup.
- Because we are still in planning mode, `plan.md` is not written yet; it should be created as the first implementation action when we switch to execution.
