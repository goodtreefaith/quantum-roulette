# Quantum Roulette

Quantum Roulette is an open-source TypeScript raffle and roulette simulator for running visual drawings in a browser. It supports weighted entries, multiple winner modes, map selection, recording, saved settings, and performance-aware Canvas rendering.

Live demo: https://rafflefaith.vercel.app/

## Project Status

Quantum Roulette is actively maintained as a public MIT-licensed project. Current maintenance work focuses on:

- Safer participant parsing and input validation
- Accessibility for keyboard and reduced-motion users
- Automated typecheck, lint, test, and build checks
- Release notes and first stable public release preparation
- Dependency review through Dependabot and browser compatibility checks

## Use Cases

- Community raffles and giveaways
- Classroom or event drawings
- Stream overlays and visual random selection
- Browser-game experiments with Canvas and Box2D physics
- TypeScript examples for interactive simulation and UI state

## Features

- Weighted participant entries such as `Alice*5`
- Bias-style participant entries such as `Team A/2`
- First, last, and custom-rank winner modes
- Multiple arena maps
- Video recording
- Saved names and settings
- Performance modes for lower-powered devices
- Reduced-motion and accessibility improvements in progress

Participant names reject unsafe control characters and angle brackets. Weight and count values must be whole numbers from 1 to 1000.

## Getting Started

### Prerequisites

- Node.js 16 or newer
- Yarn 1.x

### Install

```bash
git clone https://github.com/goodtreefaith/quantum-roulette.git
cd quantum-roulette
yarn install
```

### Run Locally

```bash
yarn dev
```

The development server runs on `http://localhost:1235`.

### Build

```bash
yarn build
```

### Lint

```bash
yarn lint
```

## Usage

1. Enter participant names separated by commas or new lines.
2. Choose a map and winner condition.
3. Start the simulation.
4. Use shake controls during gameplay if marbles stall.
5. Keep or remove winners between rounds.

Participant examples:

```text
Alice, Bob, Charlie
Player1*5, Player2*10, Player3*3
Team A/2, Team B/3
```

## Repository Structure

```text
src/
  index.ts              Main entry point
  roulette.ts           Core game flow
  options.ts            Settings and persistence
  utils/participants.ts Participant parsing helpers
  utils/performance.ts  Runtime performance monitor
  data/                 Maps, labels, and constants
  styles/               SCSS styles
```

## Maintainer Workflow

This repository uses public issues to track validation, accessibility, test coverage, CI, and release-readiness work. New contributions should include a clear description, test notes, and screenshots or recordings for user-facing changes.

Before opening a pull request, run:

```bash
yarn verify
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines, [SECURITY.md](SECURITY.md) for vulnerability reporting, [SUPPORT.md](SUPPORT.md) for support scope, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for project behavior expectations.

## Roadmap

- Expand keyboard navigation and reduced-motion support
- Expand tests beyond participant parsing into UI state and winner flows
- Continue hardening validation for user-provided names
- Publish first stable release notes
- Keep dependency and build tooling current

## License

MIT
