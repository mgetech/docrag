# DocRAG: Document Retrieval-Augmented Generation

DocRAG is a full-stack application that allows users to upload documents, embed them, and then ask questions using a Retrieval-Augmented Generation (RAG) system. It combines a robust Django backend with a modern Next.js frontend to provide a seamless user experience.

## 🚀 Core Philosophy

The project is built with a focus on **maintainability, type safety, and a clean separation of concerns**. The backend handles data processing, embeddings, and LLM inference, while the frontend provides an intuitive user interface. Both parts are designed to be modular and scalable.

## ✨ Key Features

### Backend Features

- **Document Ingestion**: Upload and process documents.
- **Embedding Generation**: Convert text into dense vectors using `sentence-transformers/all-MiniLM-L6-v2`.
- **Vector DB**: Store & retrieve embeddings using PostgreSQL + pgvector.
- **LLM Inference**: Generate answers using Microsoft Phi-3-Mini via `llama-cpp-python`.
- **Async Processing**: Background task handling with Celery + Redis.

### Frontend Features

- **Document Upload**: Seamlessly upload documents to the backend. The frontend correctly formats the document content for the backend API.
- **Document Listing with Pagination**: View a paginated list of all uploaded documents, with navigation controls to browse through pages.
- **Question & Answer (RAG)**: Ask questions based on the uploaded documents and receive AI-generated answers with source chunks.

## 🧠 Tech Stack

### Backend

- **Python, Django, Django Ninja**
- **Celery + Redis** (async tasks)
- **PostgreSQL + pgvector** (vector DB)
- **sentence-transformers/all-MiniLM-L6-v2** (embeddings)
- **llama-cpp-python** + **Phi-3-Mini-4K-Instruct** (local LLM)
- **CORS headers**

### Frontend

- **Framework**: [Next.js](https://nextjs.org/) (React Framework)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via PostCSS)
- **API Communication**: [Axios](https://axios-http.com/) (configured for robust error handling)
- **Package Manager**: [npm](https://www.npmjs.com/)

## 📂 Project Structure

```
docrag/
├── client/             # Next.js frontend application
│   ├── app/            # Core Next.js routing. `page.tsx` is the main entry point.
│   ├── components/     # Reusable React components (e.g., DocumentList, QnA).
│   ├── lib/            # Application logic, services, and API communication.
│   │   └── api.ts      # Centralized API layer using Axios for backend communication.
│   ├── types/          # TypeScript type definitions and interfaces.
│   │   └── index.ts    # Defines the shape of data used throughout the app.
│   └── ...
├── server/             # Django backend application
│   ├── api/            # Django Ninja API endpoints, models, schemas, tasks, services
│   ├── docrag/         # Django project settings, URLs, ASGI/WSGI
│   ├── models/         # Directory for LLM models
│   ├── init.sql        # SQL script for database initialization
│   ├── manage.py       # Django management script
│   ├── requirements.txt# Python dependencies
│   └── ...
├── docker-compose.yml  # Docker Compose for PostgreSQL and Redis
├── .env                # Environment variables for backend (example)
├── .gitignore
└── README.md           # This file
```

## ⚙️ Setup and Installation

Follow these steps to set up and run the entire DocRAG application:

### 1. Prerequisites

- Python 3.10+
- Node.js (LTS recommended)
- Docker (for PostgreSQL and Redis)

### 2. Clone & Navigate

```bash
git clone https://github.com/mgetech/docrag.git
cd docrag
```

### 3. Backend Setup

#### 3.1. Virtual Environment

```bash
python -m venv venv
# Windows
venc\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

#### 3.2. Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
cd .. # Go back to docrag/ root
```

#### 3.3. Download LLM Model

```bash
pip install huggingface-hub
mkdir -p server/models/huggingface/download
huggingface-cli download microsoft/Phi-3-mini-4k-instruct-gguf Phi-3-mini-4k-instruct-q4.gguf --local-dir server/models/huggingface/download --local-dir-use-symlinks False
```

#### 3.4. Configure `.env`

Create a `.env` file in the `docrag/` root directory (same level as `docker-compose.yml`) with the following content:

```
DATABASE_URL=postgresql://docraguser:master@localhost:5433/docrag
REDIS_HOST=localhost
REDIS_PORT=6379
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
HF_EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL_PATH=D:/Utilities/Projects/Python/docrag/server/models/huggingface/download/Phi-3-mini-4k-instruct-q4.gguf # IMPORTANT: Use absolute path
HUGGINGFACE_API_TOKEN=your-huggingface-api-token # Optional, but recommended for rate limits
DJANGO_SECRET_KEY=your-secret-key-for-django
DJANGO_DEBUG=True
```

> **Note on `LLM_MODEL_PATH`**: Ensure this is an **absolute path** to the downloaded model file on your system.

#### 3.5. Start PostgreSQL & Redis (Docker)

```bash
docker compose up -d
```

> If PostgreSQL is already using port 5432, it's configured to use `5433:5432` in `docker-compose.yml` to avoid conflicts.

#### 3.6. Migrate Database

```bash
cd server
python manage.py makemigrations api
python manage.py migrate
cd .. # Go back to docrag/ root
```

#### 3.7. Run API Server

```bash
cd server
python manage.py runserver
cd .. # Go back to docrag/ root
```

#### 3.8. Start Celery Worker

Open a **new terminal** and run:

```bash
cd server
venv\Scripts\activate  # or source venv/bin/activate
celery -A docrag worker -l info --pool=threads
cd .. # Go back to docrag/ root
```

### 4. Frontend Setup

#### 4.1. Install Node.js Dependencies

```bash
cd client
npm install
```

#### 4.2. Configure Frontend Environment Variables

Create a file named `.env.local` inside the `client/` directory with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Run Frontend Development Server

```bash
cd client
npm run dev
```

Your frontend application should now be accessible at `http://localhost:3000`.

## 📜 Available Scripts

### Backend (in `docrag/server` directory)

- **`python manage.py runserver`**: Starts the Django API server.
- **`celery -A docrag worker -l info --pool=threads`**: Starts the Celery worker for background tasks.
- **`python manage.py makemigrations api`**: Creates new database migrations.
- **`python manage.py migrate`**: Applies database migrations.

### Frontend (in `docrag/client` directory)

- **`npm run dev`**: Starts the Next.js development server with hot-reloading.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts a production server (requires a build first).
- **`npm test`**: Runs the Jest test suite for component and API layer tests.
- **`npm run lint`**: Lints the code for style and error checking.
- **`npx playwright test`**: Runs the Playwright E2E tests.
- **`npx playwright test --headed`**: Runs the Playwright E2E tests in a browser UI.

## 🧪 Testing Strategy

Our testing strategy is multi-layered to ensure robustness and reliability:

1.  **Backend API Testing**: The Django Ninja backend provides an interactive Swagger UI at `http://localhost:8000/docs` where you can test API endpoints directly.

2.  **Frontend Component Tests**: We use **Jest** and **React Testing Library** to test individual React components in isolation. These tests verify that components render correctly and respond to user interaction as expected. API calls are mocked to ensure tests are fast and reliable.

3.  **Frontend API Layer Tests**: The functions in `client/lib/api.ts` are unit-tested to ensure they correctly handle both successful responses and network/server errors from the backend. We use a manual mock for `axios` to simulate different API scenarios.

4.  **End-to-End (E2E) Tests**: We utilize **Playwright** to simulate full user journeys, from document upload to asking questions and receiving answers. These tests ensure that all parts of the application (frontend, backend, and their integration) work together seamlessly. Specific enhancements have been made to ensure tests reliably wait for UI state changes, such as document upload completion.

## 🎨 Styling

Styling for the frontend is handled by **Tailwind CSS**. Utility classes are used directly in the components for rapid and consistent styling. Global styles can be configured in `client/app/globals.css`.

## 🤝 Contribution

When adding new features, please adhere to the established patterns:

-   Create new UI elements as components in the `client/components` directory.
-   Add any new API communication to the `client/lib/api.ts` file.
-   Define any new data structures in `client/types/index.ts`.
-   Write a corresponding `.test.ts` file for any new component or utility function.
-   Document all new functions and components using **JSDoc comments**.