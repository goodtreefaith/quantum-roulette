# Contributing to Quantum Roulette

Thank you for your interest in contributing to Quantum Roulette.

Quantum Roulette is an open-source browser-based roulette/simulation game built with TypeScript, Canvas, and modern frontend tooling. The goal is to keep the project lightweight, easy to run locally, and useful as a practical example of interactive browser simulation, animation, UI state management, and performance-aware rendering.

## Ways to Contribute

You can help by:

- Reporting bugs or browser compatibility issues
- Improving accessibility, keyboard support, and reduced-motion behavior
- Improving performance on lower-powered devices
- Adding or refining tests for game logic and participant parsing
- Improving documentation, setup instructions, and release notes
- Refactoring TypeScript code for maintainability
- Reviewing dependencies and build configuration

## Development Setup

### Prerequisites

- Node.js 16 or newer
- Yarn is recommended

### Install

```bash
yarn install
```

### Run locally

```bash
yarn dev
```

### Build

```bash
yarn build
```

### Lint

```bash
yarn lint
```

## Before Opening a Pull Request

Please make sure that:

1. The project installs successfully.
2. The development server runs without errors.
3. yarn lint passes or any remaining warnings are clearly explained.
4. yarn build completes successfully.
5. The change is documented when it affects user-facing behavior.

## Issue Guidelines

When opening an issue, please include:

- A clear title
- Steps to reproduce, if it is a bug
- Expected behavior
- Actual behavior
- Browser and device information
- Screenshots or recordings, if useful

## Pull Request Guidelines

When opening a pull request, please include:

- What changed
- Why the change is needed
- How you tested it
- Any known limitations or follow-up work

Small, focused pull requests are preferred. Large rewrites should usually start with an issue first so the direction can be discussed.

## Code Style

- Use TypeScript consistently.
- Prefer readable, explicit logic over clever shortcuts.
- Keep rendering and game logic separated where practical.
- Avoid adding heavy dependencies unless there is a clear benefit.
- Preserve accessibility and performance considerations when changing UI behavior.

## Maintainer Notes

This project is maintained with a focus on:

- Browser compatibility
- Performance-aware animation
- Clear contribution workflow
- Safe dependency usage
- Practical documentation for new contributors

Thank you for helping improve Quantum Roulette.
