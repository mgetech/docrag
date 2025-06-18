
# DocRAG Backend

A minimal Retrieval-Augmented Generation (RAG) backend for uploading documents, embedding them, and asking questions using semantic search and LLM-based generation.

## 🚀 Features

- **Document Ingestion**: Upload and process documents.
- **Embedding Generation**: Convert text into dense vectors.
- **Vector DB**: Store & retrieve embeddings using PostgreSQL + pgvector.
- **LLM Inference**: Generate answers using Microsoft Phi-3-Mini via `llama-cpp-python`.
- **Async Processing**: Background task handling with Celery + Redis.

## 🧠 Tech Stack

- **Python, Django, Django Ninja**
- **Celery + Redis** (async tasks)
- **PostgreSQL + pgvector** (vector DB)
- **sentence-transformers/all-MiniLM-L6-v2** (embeddings)
- **llama-cpp-python** + **Phi-3-Mini-4K-Instruct** (local LLM)
- **CORS headers**

## ⚙️ Setup

### 1. Prerequisites

- Python 3.10+
- Docker (for PostgreSQL)
- Redis (via Docker or system install)

### 2. Clone & Navigate

```bash
git clone https://github.com/mgetech/docrag.git
cd docrag
```

### 3. Virtual Environment

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 4. Install Dependencies

```bash
cd docrag/server
pip install -r requirements.txt
```

### 5. Download LLM Model

```bash
pip install huggingface-hub
mkdir models
cd models
huggingface-cli download microsoft/Phi-3-mini-4k-instruct-gguf Phi-3-mini-4k-instruct-q4.gguf --local-dir . --local-dir-use-symlinks False
```

### 6. Configure `.env`

Create a `.env` in the `docrag/` root:

```
DATABASE_URL=postgresql://docraguser:master@localhost:5433/docrag
REDIS_HOST=localhost
REDIS_PORT=6379
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
HF_EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL_PATH=/abs/path/to/models/Phi-3-mini-4k-instruct-q4.gguf
HUGGINGFACE_API_TOKEN=hf_...
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
```

### 7. Start PostgreSQL (Docker)

```bash
cd ../.. # to docrag/
docker compose up -d
```

> If PostgreSQL is already using port 5432, change to `5433:5432` in `docker-compose.yml`.

### 8. Migrate Database

```bash
cd server
python manage.py makemigrations api
python manage.py migrate
```

### 9. Run API Server

```bash
python manage.py runserver
```

### 10. Start Celery Worker

```bash
# In a new terminal
cd server
venv\Scripts\activate  # or source venv/bin/activate
celery -A docrag worker -l info --pool=threads
```

## 🧪 Test API

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Upload Doc: `POST /api/upload`
- Ask Question: `POST /api/ask`
- Check Result: `GET /api/task_status/{task_id}`


