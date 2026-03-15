# AI Knowledge Assistant 🧠🤖

A powerful, full-stack Retrieval-Augmented Generation (RAG) platform that allows users to upload documents (PDF, TXT) and have intelligent, persistent conversations with an AI assistant based on those documents.

## 🌟 Key Features

- **Knowledge Base Management**: Upload documents and track their indexing progress in real-time.
- **Persistent Chat History**: ChatGPT-like interface with sidebar session management.
- **RAG Integration**: Real-time document retrieval using ChromaDB for context-aware AI responses.
- **Multi-Database Architecture**:
  - **PostgreSQL**: Metadata, User Profiles, and Chat Sessions.
  - **MongoDB**: Raw document content storage.
  - **ChromaDB**: Vector embeddings for semantic search.
  - **RabbitMQ**: Asynchronous task processing for document indexing.
- **Premium UI**: Modern, glassmorphism-inspired design built with Angular.
- **Admin Dashboard**: Real-time stats on documents, recent uploads, and AI interactions.

---

## 🏗️ Architecture Overview

The project is built using a microservices-inspired architecture:

- **Frontend**: Angular 17+ (Signals-based state management, Vanilla CSS).
- **Backend**: Node.js & Express (RESTful API, JWT Auth).
- **AI Worker**: Dedicated Node.js service for chunking, embedding, and indexing documents.
- **Databases**: PostgreSQL (Relational), MongoDB (Document), ChromaDB (Vector).
- **Message Broker**: RabbitMQ for reliable background indexing.

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Make](https://www.gnu.org/software/make/) (optional, but recommended)

### 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ai-knowledge-assistant
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory (a `.env.example` is provided for reference). Update the following variables with your actual keys:
   ```env
   GEMINI_API_KEY=your_actual_gemini_key_here
   JWT_SECRET=your_secret_identity_key
   ```
   The `docker-compose.yml` is configured to read these variables automatically. **Never commit your `.env` file to version control.**

3. **Kick off the project (Development Mode):**
   Use the provided Makefile command to build and start all services (Frontend, Backend, Worker, DBs):
   ```bash
   make up-dev
   ```
   *This command runs the containers using the variables defined in your `.env` file.*

4. **Access the Applications:**
   - **Frontend UI**: [http://localhost:4200](http://localhost:4200)
   - **Backend API**: [http://localhost:5001](http://localhost:5001)
   - **RabbitMQ Admin**: [http://localhost:15672](http://localhost:15672) (guest/guest)
   - **ChromaDB**: [http://localhost:8000](http://localhost:8000)

### 🧪 Basic Workflow

1. **Register/Login**: Create a user account to start your session.
2. **Upload Knowledge**: Go to the **Documents** page, upload a file, and watch the real-time progress bar until it's "Processed".
3. **Chat**: Head to the **Chat** section to ask questions. The AI will retrieve relevant snippets from your uploaded files to answer.
4. **Dashboard**: Monitor your knowledge base growth on the **Dashboard** page.

---

## 🛠️ Maintenance Commands

- **Stop Development**: `make down-dev`
- **Prod Deployment**: `make up-prod`
- **Check Backend Logs**: `docker logs ai_backend`
- **Check Worker Status**: `docker logs ai_worker`

---

## 🛡️ License

Built with ❤️ for AI enthusiasts. Happy Coding!
