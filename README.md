# TUF Calendar Challenge

This repository contains my frontend submission for the TUF Calendar Challenge. The primary goal of this project was to build a highly interactive, performant, and visually appealing calendar interface from the ground up, intentionally avoiding heavyweight third-party calendar libraries to demonstrate core engineering fundamentals.

By leveraging modern React patterns and the latest Next.js architecture, the result is a robust, modular application that mimics the slick, responsive feel of premium productivity tools.

## Key Features

- **Advanced "Pivot-Point" Selection Engine**: Implemented a sophisticated date selection logic that allows users to establish "pivot points" for intuitive range selection. The UI provides real-time hover feedback, highlighting the anticipated selection path based on the relationship between fixed pivots and the current cursor position.
- **Dynamic Holiday Integration**: Integrated with the Google Calendar API to provide real-time Indian public holiday data. This is supplemented with a dedicated logic layer for regional observances, ensuring users are always aware of upcoming cultural events.
- **Ultra-Realistic Industrial Design**: The interface features high-fidelity physical metaphors, including:
    - **Metallic Hardware**: A detailed wall-mount nail with custom radial gradients, noise textures, and directional highlights for a premium tactile feel.
    - **Physical Binding**: An accurately modeled twin-loop Wire-O binding that features progressive tilting—simulating the way a physical calendar's loops behave as they move away from the center.
    - **Directional Lighting**: A unified shadow system that casts consistent shadows from the binding loops and hardware, reinforcing the 3D "wall-mounted" appearance.
- **Seasonal Immersion**: The calendar defaults to the current date and automatically cycles through a curated gallery of high-resolution nature photography. Each month features a unique theme color and aesthetic that updates dynamically.
- **Synchronized Page-Flip Animation**: Month transitions feature a realistic 3D page-flip effect. The animation is precisely synchronized so that the theme color, hero image, and grid state transition seamlessly at the peak of the fold—powered entirely by CSS 3D transforms.
- **Integrated Notes System**: Users can attach contextual notes to specific dates or ranges. The UI seamlessly adapts to present an active note-taking section with a "lined paper" aesthetic that scales perfectly across devices.
- **Centralized State Management**: Complex logic—including holiday fetching, pivot selection, and animation orchestration—is cleanly encapsulated within custom React hooks (`useCalendarState` and `useCalendarTheme`).

## Technical Architecture & Design Choices

When architecting this solution, I prioritized maintainability, performance, and keeping the dependency graph as minimal as possible:

- **Next.js 16 (App Router)**: I chose Next.js for its optimized build process and modern routing. The app leverages the App Router for clean structure while maintaining high client-side interactivity.
- **React 19**: Utilizes the latest React patterns, managing complex state via isolated hooks. This ensures that visual transitions (like theme coloring and image swaps) are synchronized with the 3D flip animation state.
- **Tailwind CSS v4 & Native CSS**: While Tailwind handles the primary utility styling, we utilize native CSS for high-performance 3D transforms and custom filter-based noise textures to achieve the metallic hardware aesthetics.
- **Google Calendar API integration**: A dedicated holiday handling layer fetches and sanitizes public holiday data, merging it with local supplementary data for a comprehensive regional experience.
- **Date-fns**: Acts as the reliable engine for all date calculations, pivot logic, and locale-based formatting.
- **3D Orchestration**: Month transitions use pure CSS `rotateX` transforms with `perspective` and `backface-visibility`. The `useCalendarState` hook manages a "look-ahead" state, pre-calculating the next month's theme and visuals to ensure zero "flicker" during the 500ms flip duration.

## Directory Structure

To ensure the codebase naturally scales, it is structured into clear modular domains:

- `app/components/` - Houses the presentational pieces of the UI, including the `CalendarGrid`, `CalendarHero`, `WireBinding`, and the `NotesSection`.
- `app/hooks/` - Contains our core business logic (`useCalendarState` for data, date selection rules, and page-flip animation orchestration; `useCalendarTheme` for visual/UI state).
- `app/page.tsx` - The primary entry point that imports and composes the various domain components and hooks together into a cohesive view.

## Local Setup & Development

To explore and run the application locally, follow these steps.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 20 or higher is recommended) alongside `npm`, `yarn`, or `pnpm`.

### Installation

1. Navigate to the project directory:
   ```bash
   cd tuf
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start up the local development environment:

```bash
npm run dev
```

You can now open [http://localhost:3000](http://localhost:3000) in your browser. The application supports Hot Module Replacement, meaning any edits you make will reflect instantly on the screen.

### Building for Production

To create a highly optimized production build, run:

```bash
npm run build
```

Once the build process is complete, you can start the production server to test the fully optimized application:

```bash
npm start
```
