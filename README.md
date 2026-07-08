# Scout - Market Intelligence and Competitor Research Platform

Scout is an AI-powered market intelligence and competitor research platform designed to monitor industry trends, analyze competitors, perform semantic research, and extract insights from unstructured news feeds and articles. It provides a full-stack solution featuring a FastAPI backend, a Streamlit frontend, an automated data ingestion pipeline, real-time natural language processing (NLP) analytics, and Retrieval-Augmented Generation (RAG).

## Architecture Overview

The system consists of five primary components:
1. Data Ingestion Pipeline: Periodically fetches news articles and RSS feeds, cleans HTML boilerplate, classifies industry context, deduplicates URLs, and indexes data.
2. Relational Database: Stores structured metadata about articles, companies, competitor mentions, keywords, topics, and sentiment scores.
3. Natural Language Processing Services: Executes sentiment analysis via FinBERT, keyword extraction via KeyBERT, and topic modeling using BERTopic.
4. RAG and Vector Search Layer: Embeds article contents using Sentence Transformers and indexes them into Qdrant for semantic search and question answering via Google Gemini.
5. User Interfaces: Streamlit application serving interactive dashboards, market explorers, competitor SWOT matrixes, live Google News product query scrapers, and an AI research analyst.

### System Architecture and Ingestion Pipeline

```mermaid
flowchart TD
    subgraph Data Sources
        news[NewsAPI]
        rss[RSS Feeds]
        scrape[Google News RSS Scraper]
    end

    subgraph Data Ingestion Pipeline
        runner[Pipeline Runner]
        cleaner[Text Cleaner]
        classifier[Industry Classifier]
        dedup[Deduplicator URL Check]
    end

    subgraph Database
        sqlite[(SQLite / PostgreSQL)]
    end

    subgraph NLP and AI Analytics
        finbert[FinBERT Sentiment Analysis]
        keybert[KeyBERT Keyword Extraction]
        bertopic[BERTopic Topic Modeling]
    end

    subgraph RAG and Embedding Layer
        sent_trans[Sentence Transformers]
        qdrant[(Qdrant Vector Database)]
        gemini[Google Gemini LLM]
    end

    subgraph API Layer
        fastapi[FastAPI Backend]
    end

    subgraph User Interface
        streamlit[Streamlit Frontend]
    end

    news --> runner
    rss --> runner
    scrape --> fastapi

    runner --> cleaner
    cleaner --> classifier
    classifier --> dedup
    dedup -->|New Articles| sqlite

    sqlite --> finbert
    sqlite --> keybert
    sqlite --> bertopic
    sqlite --> sent_trans

    finbert --> sqlite
    keybert --> sqlite
    bertopic --> sqlite
    sent_trans --> qdrant

    sqlite & qdrant --> fastapi
    fastapi --> streamlit
    fastapi <--> gemini
```

## Database Schema

The platform supports both SQLite (default for development) and PostgreSQL (for production). The database schema maps relationships between ingested articles, companies, competitor mentions, and NLP analytical models.

```mermaid
erDiagram
    articles ||--|| sentiment_scores : "has"
    articles ||--o{ keywords : "contains"
    articles ||--|| embeddings_metadata : "references"
    articles ||--o{ competitor_mentions : "tracks"
    companies ||--o{ competitor_mentions : "referenced in"
    
    articles {
        uuid id PK
        string title
        text content
        text summary
        string source
        string author
        string url
        string industry
        datetime published_date
        string topic_name
        datetime created_at
    }
    
    sentiment_scores {
        uuid id PK
        uuid article_id FK
        string sentiment
        float score
    }
    
    keywords {
        uuid id PK
        uuid article_id FK
        string keyword
        float score
    }
    
    embeddings_metadata {
        uuid id PK
        uuid article_id FK
        string vector_id
    }
    
    competitor_mentions {
        uuid id PK
        uuid article_id FK
        string company_name FK
        integer mention_count
        text context_snippet
    }
    
    companies {
        uuid id PK
        string company_name UK
        string industry
        string country
        text description
    }
    
    topics {
        uuid id PK
        string topic_name UK
        integer frequency
        datetime created_at
    }
```

## Features

### 1. Data Ingestion Pipeline
- Collects articles from NewsAPI and curated RSS feeds.
- Normalizes publication dates and cleans HTML tags/boilerplate text.
- Classifies articles into target industries (Logistics, Pharma, Agriculture, Defense, or General fallback) using custom keyword and context heuristics.
- Deduplicates incoming streams based on URL uniqueness.

### 2. Market Analytics and Intelligence
- Sentiment Analysis: Automatically assigns positive, neutral, or negative classifications with confidence scores.
- Keyword Extraction: Extracts critical contextual keywords for topic trends and tag clouds.
- Topic Modeling: Groups documents dynamically using BERTopic (UMAP, HDBSCAN, and TF-IDF config) and exposes weekly topic modeling batch runs.
- Trend Velocity: Analyzes keyword and topic frequency shifts over time to alert on rising market phenomena.

### 3. Competitor and Product Intelligence
- Tracks a hardcoded watchlist of major global enterprises (Tesla, Samsung, Apple, Google, Nvidia, etc.) inside text content.
- Measures mention frequency, calculates sentiment distributions specifically for competitor contexts, and extracts snippet quotes.
- Feeds live product analysis queries into RSS news feeds, runs real-time brand detection and lexical sentiment scoring, and generates automated SWOT analyses.

### 4. RAG AI Research Analyst
- Indexes processed articles into a vector database (Qdrant).
- Provides semantic search, document retrieval, and conversational query resolution.
- Generates structured research reports using Google Gemini, citing original source articles and links.

## Project Structure

```
├── .env.example          # Environment variables template
├── alembic.ini           # Alembic database migration configuration
├── docker-compose.yml    # Docker services orchestration
├── requirements.txt      # Python dependencies
├── analytics/            # NLP analytics engine
│   ├── keyword_extraction/
│   ├── sentiment/
│   ├── topic_modeling/
│   └── trends/
├── backend/              # FastAPI server
│   ├── api/              # API endpoints and route definitions
│   ├── schemas/          # Pydantic validation schemas
│   └── services/         # Business logic layer
├── data_pipeline/        # Data ingestion and scheduled jobs
│   ├── collectors/       # NewsAPI and RSS scrapers
│   ├── processors/       # Cleaning and classification modules
│   └── scheduler/        # Orchestration script
├── database/             # SQLAlchemy connection & models
│   ├── migrations/       # Alembic version control
│   └── models/           # Declarative base models
├── docker/               # Container configurations (Backend, Frontend)
├── frontend/             # Streamlit application UI pages
└── tests/                # Unit and integration test suites
```

## Tech Stack

- Backend Framework: FastAPI (Uvicorn server)
- Frontend Framework: Streamlit
- Database ORM: SQLAlchemy, Alembic (Migrations)
- Vector Search: Qdrant Client
- Large Language Model: Google Generative AI (Gemini)
- NLP and ML Libraries: PyTorch, Sentence Transformers, KeyBERT, BERTopic, HDBSCAN, UMAP-Learn, FinBERT
- Containerization: Docker, Docker Compose
- Testing: PyTest

## Installation and Setup

### Prerequisites
- Python 3.10 or higher
- Qdrant Cloud or local instance (Optional, mock active otherwise)
- NewsAPI Key and Google Gemini API Key

### Local Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/shekharsameer2308/LLM-.git
   cd LLM-
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and fill in the required keys (database URL, API keys, and endpoint configurations).

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Run the FastAPI backend:
   ```bash
   uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```

7. Run the Streamlit frontend in a separate terminal:
   ```bash
   streamlit run frontend/app.py
   ```

8. Execute the Ingestion Pipeline manually:
   ```bash
   python -m data_pipeline.scheduler.pipeline_runner --run-topics
   ```

### Docker Compose Setup

Run the entire platform including a PostgreSQL instance, FastAPI backend, Streamlit frontend, and pipeline runner:
```bash
docker-compose up --build
```
Access the Streamlit application at `http://localhost:8501` and the backend FastAPI docs at `http://localhost:8000/docs`.

### Render Deployment (Blueprints)

The project includes a unified `render.yaml` file that allows you to deploy the entire infrastructure stack on Render in one click using Render Blueprints.

#### Architecture on Render
When you deploy this Blueprint, Render automatically provisions and configures the following resources:
1. **PostgreSQL Database (`scout-db`):** Shared database instance storing article metadata, sentiment logs, competitor mentions, and keyword frequencies.
2. **FastAPI Backend (`scout-backend`):** High-performance API server that runs database migrations automatically on startup and serves the frontend.
3. **Streamlit Frontend (`scout-frontend`):** Web application serving the dashboard, explorer, competitor views, and research agent. It communicates with the backend privately using Render's internal private networking (`http://scout-backend:8000`).
4. **Daily Ingestion Scheduler (`scout-pipeline`):** An ephemeral Render Cron Job service that executes the article collection and weekly topic modeling pipeline daily at midnight UTC.

#### Setup Steps

1. Push this repository to your GitHub account.
2. Log in to the [Render Dashboard](https://dashboard.render.com).
3. Click **New** (top right) and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will scan `render.yaml` and list all services to be created.
6. Provide values for the required environment variables:
   - `NEWSAPI_KEY`: Your NewsAPI developer token.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `QDRANT_URL`: Your Qdrant Cloud Cluster URL.
   - `QDRANT_API_KEY`: Your Qdrant Cloud API token.
7. Click **Approve** to deploy the infrastructure. Render will automatically link the database URL to the backend and the cron job.

---

### Troubleshooting Backend Deployment Issues

If your backend web service is failing to deploy or run on Render, check the following common failure modes:

#### 1. SQLAlchemy Connection Dialect Error (`postgres://` vs `postgresql://`)
* **Problem:** Render's default database connection string uses the `postgres://` prefix. However, SQLAlchemy 1.4+ and 2.0+ have deprecated this prefix in favor of `postgresql://`. If left unmodified, the backend will crash on startup with:
  `NoSuchModuleError: Can't load plugin: sqlalchemy.dialects.postgresql.postgres`
* **Resolution:** We have added an automatic translation helper in [connection.py](file:///c:/Users/BIT/Desktop/vs%20code%20setup/llm/database/connection.py) and [env.py](file:///c:/Users/BIT/Desktop/vs%20code%20setup/llm/database/migrations/env.py) that detects the `postgres://` prefix and replaces it with `postgresql://` before initializing the database connection or running migrations.

#### 2. Out of Memory (OOM) During Docker Build
* **Problem:** Installing deep learning libraries (`torch`, `transformers`, `keybert`, `bertopic`) can consume excessive RAM, causing Render's free build container (which has 512MB RAM) to terminate with an Out of Memory error or run out of disk space.
* **Resolution:** 
  - We use the `--no-cache-dir` pip flag to prevent disk bloating.
  - If your builds still run out of memory, you can configure your Dockerfiles to pre-install CPU-only versions of PyTorch to reduce sizes, or upgrade your Render build plan to **Starter** to get more build resources.

#### 3. Database Migrations failing on Startup
* **Problem:** The backend Dockerfile is configured to run database migrations (`alembic upgrade head`) before starting the Uvicorn server. If the PostgreSQL database has not finished provisioning or accepts no connections yet, the migrations fail and the backend container exits.
* **Resolution:** Render manages startup ordering when using Blueprints, but if a crash occurs, wait for the database service to be fully healthy and trigger a manual redeploy of the `scout-backend` service.

---

## Running Tests

To run the unit and integration tests locally, set your python path and run pytest:
```bash
# On Windows (PowerShell):
$env:PYTHONPATH="."
pytest tests/

# On macOS/Linux:
PYTHONPATH=. pytest tests/
```
