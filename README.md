# TUF Calendar Challenge

This repository contains my frontend submission for the TUF Calendar Challenge. The primary goal of this project was to build a highly interactive, performant, and visually appealing calendar interface from the ground up, intentionally avoiding heavyweight third-party calendar libraries to demonstrate core engineering fundamentals.

By leveraging modern React patterns and the latest Next.js architecture, the result is a robust, modular application that mimics the slick, responsive feel of premium productivity tools.

## Key Features

- **Custom Date Selection Engine**: Implemented purpose-built logic to handle intricate calendar interactions—such as single-date selections, start and end date ranges, and dynamic hover states that highlight the user's anticipated selection path.
- **Integrated Notes System**: Users can attach contextual notes to specific dates or entire date ranges. The UI seamlessly adapts to present an active note-taking section when interacting with targeted dates.
- **Responsive & Tactile UI**: The calendar grid and its accompanying layouts naturally adapt to different screen sizes. I also included subtle visual cues (like a custom "wire binding" aesthetic) to give the application a more tactile, realistic feel.
- **Centralized State Management**: Complex calendar states (month traversing, active selections, overlapping ranges) are cleanly encapsulated within custom React hooks, completely separating the complex business logic from the presentational UI components.

## Technical Architecture & Design Choices

When architecting this solution, I prioritized maintainability, performance, and keeping the dependency graph as minimal as possible:

- **Next.js 16 (App Router)**: I chose Next.js for its optimized build process, developer experience, and modern routing capabilities. Even though the calendar requires significant client-side interactivity, Next.js provides a robust, enterprise-ready baseline.
- **React 19**: Benefiting from the latest features in React, state is managed via isolated, purpose-built hooks (`useCalendarState` and `useCalendarTheme`). This approach keeps the component files lightweight and highly readable.
- **Tailwind CSS v4**: Tailwind handles all of our styling needs. Adopting a utility-first approach avoided the need for bloated, tangled CSS files and made implementing the responsive grid and interactive hover states incredibly fast.
- **Lucide React & Date-fns**: `lucide-react` supplies the clean, unified iconography, while `date-fns` acts as the engine for all date math and string formatting—bringing absolute reliability without the massive payload footprint of older libraries like Moment.js.

## Directory Structure

To ensure the codebase naturally scales, it is structured into clear modular domains:

- `app/components/` - Houses the presentational pieces of the UI, including the `CalendarGrid`, `CalendarHero`, `WireBinding`, and the `NotesSection`.
- `app/hooks/` - Contains our core business logic (`useCalendarState` for data and date selection rules, and `useCalendarTheme` for visual/UI state).
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
