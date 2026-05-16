# OS-Sim — Operating System Simulator

A web-based OS simulator built with **React** and **Vite** that demonstrates core operating system concepts through an interactive desktop environment inspired by Windows 11.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## What It Does

OS-Sim lets you explore how an operating system works through hands-on apps:

| App | OS Concept | What You Can Do |
|-----|-----------|-----------------|
| **CPU Scheduling** | Process Scheduling | Run FCFS, SJF, SRTF, Round Robin, and Priority algorithms with live Gantt charts |
| **Memory Manager** | Memory Allocation | Allocate/deallocate memory blocks using First Fit, Best Fit, or Worst Fit |
| **File Manager** | File Systems | Browse, create, rename, copy, and delete files and folders |
| **Print Spooler** | I/O Management | Queue print jobs with live preview and printing animation |
| **Task Manager** | Resource Monitoring | Watch real-time CPU, memory, and disk usage charts |
| **Notepad** | File I/O | Edit and save files, send them to the printer |
| **Browser** | — | Tabbed browsing with simulated websites |
| **Calculator** | — | Standard and scientific calculator |
| **VALORANT** | — | Game launcher UI demo |

## Desktop Features

- **Windowing** — Drag, resize, minimize, and maximize app windows
- **Taskbar** — Pinned apps, running indicators, system clock
- **Themes** — Light/Dark mode with 6 color schemes
- **Wallpapers** — 5 backgrounds + default gradient
- **Context Menu** — Right-click for refresh, new files, icon sizes, themes, and wallpapers

## Project Structure

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Desktop shell (icons, taskbar, windows)
├── context/
│   └── OSContext.jsx         # Shared state (file system, processes, I/O)
├── components/
│   ├── Window.jsx            # Draggable/resizable window
│   └── ContextMenu.jsx       # Right-click menu
└── apps/
    ├── TaskManager.jsx        # CPU scheduling visualizer
    ├── useSimulationEngine.js # Scheduling algorithm engine
    ├── MemoryManager.jsx      # Memory allocation visualizer
    ├── useMemoryEngine.js     # Memory algorithm engine
    ├── FileManager.jsx        # File explorer
    ├── PrinterSimulator.jsx   # Print spooler
    ├── PerformanceMonitor.jsx # System performance charts
    ├── Notepad.jsx            # Text editor
    ├── Browser.jsx            # Tabbed browser
    ├── Calculator.jsx         # Calculator
    └── Valorant.jsx           # Game launcher UI
```

## Tech Stack

- **React 19** — UI framework
- **Vite** — Build tool
- **react-rnd** — Draggable/resizable windows
- **lucide-react** — Icons
- **Google Fonts (Inter)** — Typography

## Build for Production

```bash
npm run build     # Output to dist/
npm run preview   # Preview the build
```
