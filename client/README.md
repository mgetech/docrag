# DocRAG Frontend Client

This directory contains the frontend client for the DocRAG application. It is a modern, production-ready web application built with **Next.js** and **TypeScript**.

## 🚀 Core Philosophy

The client is built with a focus on **maintainability, type safety, and a clean separation of concerns**. It follows a component-based architecture where the UI is composed of small, reusable pieces. All data fetching and state management logic is kept separate from the presentational components.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React Framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via PostCSS)
- **API Communication**: [Axios](https://axios-http.com/) (configured for robust error handling)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Package Manager**: [npm](https://www.npmjs.com/)

## 📂 Project Structure

The frontend code is organized into the following key directories:

```
client/
├── app/                # Core Next.js routing. `page.tsx` is the main entry point.
├── components/         # Reusable React components (e.g., DocumentList, QnA).
├── lib/                # Application logic, services, and API communication.
│   └── api.ts          # Centralized API layer using Axios for backend communication.
├── types/              # TypeScript type definitions and interfaces.
│   └── index.ts        # Defines the shape of data used throughout the app.
├── public/             # Static assets like images and fonts.
├── .env.local          # Environment variables (NEVER commit this file).
├── jest.config.js      # Configuration for the Jest testing framework.
└── jest.setup.js       # Setup file to load environment variables for tests.
```

## ⚙️ Setup and Installation

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env.local` in this directory and add the following line. This tells the client where to find the backend API.
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

## 📜 Available Scripts

In the `client` directory, you can run the following commands:

- **`npm run dev`**: Starts the development server with hot-reloading.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts a production server (requires a build first).
- **`npm test`**: Runs the Jest test suite.
- **`npm run lint`**: Lints the code for style and error checking.

## 🧪 Testing Strategy

Our testing strategy is two-fold:

1.  **Component Tests**: We use **React Testing Library** to test individual components in isolation. These tests verify that components render correctly and respond to user interaction as expected. API calls are mocked to ensure tests are fast and reliable.

2.  **API Layer Tests**: The functions in `lib/api.ts` are unit-tested to ensure they correctly handle both successful responses and network/server errors from the backend. We use a manual mock for `axios` to simulate different API scenarios.

## 🎨 Styling

Styling is handled by **Tailwind CSS**. Utility classes are used directly in the components for rapid and consistent styling. Global styles can be configured in `app/globals.css`.

## 🤝 Contribution

When adding new features, please adhere to the established patterns:

-   Create new UI elements as components in the `components` directory.
-   Add any new API communication to the `lib/api.ts` file.
-   Define any new data structures in `types/index.ts`.
-   Write a corresponding `.test.ts` file for any new component or utility function.
-   Document all new functions and components using **JSDoc comments**.
