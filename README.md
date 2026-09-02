# RegexLab – Regular Expression Engine Visualizer

A full MERN-stack interactive tool that lets you type a regex pattern and watch it get compiled into an NFA/DFA state machine in real time — with step-by-step simulation.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Graph | React Flow 11 |
| State | Zustand |
| Backend | Node.js + Express 4 |
| Algorithms | Thompson's Construction, Subset Construction |

---

## Project Structure

```
regexlab/
├── client/         # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── editor/        RegexInput, TestStringInput
│       │   ├── layout/        Header
│       │   ├── panels/        TransitionTable
│       │   ├── simulation/    SimulationControls
│       │   └── visualizer/    AutomataGraph, StateNode, TransitionEdge
│       ├── hooks/             useRegexEngine
│       ├── store/             useRegexStore, useSimulationStore
│       └── utils/             graphTransform
│
└── server/         # Express API
    └── src/
        ├── controllers/       regex.controller
        ├── engine/            parser, thompson, nfaToDfa, simulator
        ├── middleware/        errorHandler, validator
        └── routes/            regex.routes, health.routes
```

---

## Getting Started

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the backend (port 4000)
```bash
cd server && npm run dev
```

### 3. Start the frontend (port 5173)
```bash
cd client && npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/api/regex/nfa` | `{pattern, flags}` | NFA states + transitions |
| POST | `/api/regex/dfa` | `{pattern, flags}` | DFA states + transitions |
| POST | `/api/regex/simulate` | `{pattern, testString, flags}` | Matches + step trace |
| GET  | `/api/health` | — | Server status |

---

## Supported Regex Syntax

| Feature | Example |
|---|---|
| Literals | `abc` |
| Any character | `.` |
| Alternation | `cat\|dog` |
| Concatenation | `ab` |
| Kleene star | `a*` |
| One or more | `a+` |
| Zero or one | `a?` |
| Counted repeat | `a{2,4}` |
| Character class | `[a-z]`, `[^0-9]` |
| Escape classes | `\d`, `\w`, `\s` |
| Groups | `(ab)+`, `(?:non-capture)` |
| Anchors | `^`, `$` |
