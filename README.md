# SpaceScope: Orbital Academy

![Project Banner](/public/mission-patches/patch_1.png)

SpaceScope is an immersive educational platform designed to make space exploration accessible and engaging. It combines high-fidelity 3D visualizations, real-time NASA data, and AI-powered adaptive learning to create a "mission control" experience for users.

## 🚀 How It Works

The application is structured into four main modules:

1.  **Immersive Entry (Home)**:
    *   Features a "scrollytelling" experience where users traverse from Earth to Deep Space.
    *   Uses parallex effects and scroll-triggered animations to reveal content progressively.
    *   Acts as the central "Orbital Command" hub for navigation.

2.  **Mission Control (Timeline)**:
    *   Visualizes past, present, and future space missions.
    *   Uses a Bento Grid layout for high-density information display.
    *   Interactive filtering and search capabilities.

3.  **Cosmic Weather Station**:
    *   **Real-time Data**: Connects to NASA's DONKI (Database Of Notifications, Knowledge, Information) API.
    *   **3D Visualization**: Renders a live 3D model of the Sun using Three.js, visualizing active solar flares and geomagnetic storms.
    *   **Alerts**: diverse system status indicators (R/G/B) reflecting actual space weather severity (G-Scale/Kp Index).

4.  **Orbital Academy (AI Quiz)**:
    *   **Adaptive Testing**: Generates unlimited, unique questions on-the-fly using Google's **Gemini AI**.
    *   **Personalized Feedback**: If a user fails a module (< 5/7 score), the AI analyzes their specific wrong answers and generates a custom study plan with encouraging feedback.
    *   **Gamification**: Progress tracking with unlockable levels and difficulty tiers (Easy/Medium/Hard).

---

## 🛠️ Technology Stack & Justification

### Core Framework
*   **Next.js 14 (App Router)**: Selected for its robust server-side rendering (SSR) capabilities, which are crucial for performance and SEO. The App Router allows us to easily colocate components and handle API routes securely.
*   **TypeScript**: Ensures type safety across the application, particularly critical when handling complex, deeply nested JSON responses from NASA APIs.

### Styling & UI
*   **Tailwind CSS**: Enables rapid UI development with a utility-first approach. We used it to create a custom "Futuristic HUD" design system (glassmorphism, neon glows, mono-spaced fonts) without writing thousands of lines of custom CSS.
*   **Framer Motion**: The engine behind the "premium" feel. It handles:
    *   Complex page transitions.
    *   Scroll-linked animations on the landing page.
    *   Micro-interactions (hover states, button clicks).

### 3D Visualization
*   **Three.js / React Three Fiber (R3F)**:
    *   Used for the **Interactive 3D Sun** in the Cosmic Weather widget.
    *   Allows us to render 8,000+ particle systems and dynamic "solar flare" loops performantly in the browser using WebGL.

### Backend & Data
*   **Redis**: Implemented as a server-side caching layer.
    *   **Why?** NASA's APIs have strict rate limits. Redis caches the responses for 1 hour, significantly speeding up the Dashboard load times and ensuring we don't hit API quotas during high traffic.
*   **Context API**: Used for global state management where necessary, though Next.js Server Components minimize the need for heavy client-side state.

---

## 📡 APIs & Integration

### 1. NASA DONKI API
We ingest real-time space weather data from NASA.
*   **Endpoints**:
    *   `FLR` (Solar Flares): Tracks X-ray flux and flare classification (A, B, C, M, X class).
    *   `CME` (Coronal Mass Ejections): Monitors plasma ejections speed and direction.
    *   `GST` (Geomagnetic Storms): Tracks Kp indices to predict aurora visibility and grid impact.
*   **Integration**: Wrapped in Next.js API routes (`/api/cosmic-weather/*`) which handle the Redis caching logic transparently.

### 2. Google Gemini AI (Generative AI)
We use the **`gemini-2.0-flash`** model for the Orbital Academy.
*   **Question Generation**:
    *   Prompts are dynamically constructed with `Topic` + `Difficulty` + `Context`.
    *   Returns strictly formatted JSON arrays of questions, options, and correct answers.
*   **Study Advisor**:
    *   When a user submits a failed quiz, we send their specific wrong answers to Gemini.
    *   The model acts as a "Tutor", returning a JSON object with: `encouragement`, `studyTips` (bullet points), and `recommendedResources`.

---

## 🏃‍♂️ Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env.local` file with:
    ```env
    GEMINI_API_KEY=your_key_here
    NASA_API_KEY=your_key_here  # Optional, defaults to DEMO_KEY
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    (Note: Ensure Redis is running locally for caching features)

4.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```
