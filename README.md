# 🥁 3D Drum Kit Viewer - Interactive Music Band Website

A stunning, scroll-driven interactive website featuring a 3D drum kit model with smooth animations and a parallax image gallery. Built with React, Three.js, and Vite.

---

## ✨ Features

- **Interactive 3D Drum Kit** - A detailed, high-fidelity 3D drum kit model rendered using Three.js
- **Scroll-Driven Animations** - Smooth zoom and rotation effects triggered by scrolling
- **Parallax Image Gallery** - Horizontal image track with scroll-based parallax effects
- **Full-Screen Video Expansion** - Last gallery item expands to fullscreen with clip-path animation
- **Modern Dark Theme** - Professional dark UI with glassmorphism and smooth transitions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type-safe development |
| **Vite 7** | Build tool & dev server |
| **Three.js** | 3D graphics engine |
| **@react-three/fiber** | React renderer for Three.js |
| **@react-three/drei** | Useful helpers for R3F |
| **Leva** | GUI controls for development |

---

## 📁 Project Structure

```
hb_website/
├── public/
│   ├── drum.glb          # 3D drum kit model (27MB)
│   ├── bpgc.mov          # Video asset for gallery
│   └── vite.svg          # Vite logo
├── src/
│   ├── App.tsx           # Main app component with scroll logic
│   ├── main.tsx          # React entry point
│   ├── style.css         # Global styles & CSS variables
│   ├── components/
│   │   └── SlidingSection.tsx  # Parallax gallery component
│   └── styles/
│       └── SlidingSection.module.css
├── Scene.tsx             # 3D scene setup with lighting
├── drum.tsx              # Drum kit 3D model components
├── index.html            # HTML entry point
├── package.json          # Dependencies & scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or equivalent package manager)

### Installation

```bash
# Clone or navigate to the project directory
cd hb_website

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port).

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 🎨 Architecture Overview

### Scroll Animation Timeline

The website uses a **scroll-driven animation system** with three main phases:

| Phase | Scroll Range | Effect |
|-------|-------------|--------|
| **Hero Section** | 0 - 70vh | 3D drum kit zooms in and rotates; opacity fades |
| **Gallery Scroll** | 70vh - 200vh | Horizontal parallax image track scrolls |
| **Expansion** | 200vh - 250vh | Last image/video expands to fullscreen |

### Component Breakdown

#### `App.tsx`
- Manages scroll state with smooth lerp interpolation
- Calculates animation progress for each phase
- Renders Hero (3D scene) and Gallery sections

#### `Scene.tsx`
- Sets up Three.js scene with lighting (ambient + directional + point lights)
- Applies scroll-based zoom and rotation to the 3D model
- Uses `useFrame` hook for 60fps animation updates

#### `drum.tsx`
- Contains the complete 3D drum kit component
- Exports refs for individual drum parts (snare, toms, cymbals, hi-hat)
- Uses `useGLTF` to load `/public/drum.glb` model

#### `SlidingSection.tsx`
- Horizontal image gallery with 8 media items
- Parallax effect via `object-position` animation
- Last item uses `clip-path` for smooth fullscreen expansion

---

## 🎭 CSS Design System

### CSS Variables (defined in `style.css`)

```css
:root {
    --bg-color: #121212;
    --surface-color: #1E1E1E;
    --primary-text-color: #EAEAEA;
    --secondary-text-color: #B3B3B3;
    --accent-color: #007BFF;
    --font-heading: 'Montserrat', sans-serif;
    --font-body: 'Lato', sans-serif;
}
```

### Typography

- **Headings**: Montserrat (700 weight)
- **Body**: Lato (400/700 weight)

---

## 🔧 Development Notes

### 3D Model

The drum kit model (`drum.glb`) is a detailed GLTF file containing:
- Bass drum with tom holder
- 2 x Rack toms
- Floor tom
- Snare drum
- Crash cymbal
- Ride cymbal
- Hi-hat with pedal
- Drummer's stool

### Performance Considerations

- Uses `requestAnimationFrame` for smooth 60fps animations
- Implements lerp (linear interpolation) for scroll smoothing
- `will-change` hints applied to animated elements
- Suspense fallback for 3D model loading

### Known Peer Dependency Warnings

The `leva` package has peer dependency conflicts with React 19. These are non-breaking warnings and the app functions correctly.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |

---

## 📝 License

This project is private. All rights reserved.

---

## 🤝 Contributing

This is a private project for HeartBeats - The Official Music Fusion Band of NIT Rourkela.

---

## 📧 Contact

For questions or collaborations, reach out to the HeartBeats team.
