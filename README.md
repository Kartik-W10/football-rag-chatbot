# Football RAG Chatbot

An AI-powered football chatbot running on **LlamaIndex**, **Groq**, and **ChromaDB**, built to answer complex questions about the Indian Super League (ISL), I-League, Premier League (EPL), FIFA World Cup, UEFA Champions League (UCL), and general association football rules.

---

## ✨ Features

- **Local Vector Database**: Scrapes, parses, chunks, and indexes Wikipedia data completely locally inside `chroma_db` using HuggingFace's `all-MiniLM-L6-v2` embeddings.
- **FastAPI Backend Router**: High-performance API routing with custom health checking and structured retrieval.
- **Blazing Fast Responses**: Leverages Groq's lightweight and high-rate-limit **`llama-3.1-8b-instant`** model.
- **Premium Glassmorphic Next.js UI**:
  - Interactive starter prompt cards.
  - Smooth animation message transitions.
  - Active server health connectivity dot.
  - **Dynamic Citation Details Sidebar**: Clicking on any cited source highlights the similarity match distance and shows the exact document text retrieved by ChromaDB.

---

## 📁 Repository Structure

```
football-rag-chatbot/
├── backend/
│   ├── .env                 # API keys (GROQ_API_KEY)
│   ├── main.py              # FastAPI server (GET /health, POST /chat)
│   ├── ingest.py            # Local scraping & vector loading
│   ├── query.py             # LlamaIndex query engine setup
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Google Fonts & browser meta tags
│   │   ├── globals.css      # Dark mode styling tokens
│   │   └── page.tsx         # Interactive Next.js Chatboard
│   ├── package.json         # Node.js dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   └── next.config.mjs      # Next.js App Router rules
├── chroma_db/               # Saved vector store indices
├── env/                     # Python virtual environment
└── README.md
```

---

## 🚦 How to Setup and Run the Application

Follow these steps to run the full application on your local machine:

### 1. Configure Your API Key
Make sure your Groq API Key is saved in `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
```
*(No quotation marks, no spaces.)*

---

### 2. Start the FastAPI Backend
Open a **new PowerShell terminal** at the project root folder and run:

```powershell
# 1. Activate the Python virtual environment
.\env\Scripts\Activate.ps1

# 2. Navigate to the backend folder
cd backend

# 3. Start the FastAPI uvicorn server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*Leave this terminal window running. The backend will serve endpoints on `http://127.0.0.1:8000`.*

---

### 3. Start the Next.js Frontend
Open a **second terminal window** at the project root folder and run:

```powershell
# 1. Navigate to the frontend folder
cd frontend

# 2. Start the Next.js client development server
npm run dev
```
*The frontend development server will compile and start on `http://localhost:3000`.*

---

### 4. Open in Your Browser
Navigate to **`http://localhost:3000`** in your browser. The connection badge in the top right will glow green (**"AI Engine Online"**), and you can begin chatting!

---

## 🗄️ Database Ingestion (Optional)
If you ever want to expand the source URLs or force a clean database rebuild, navigate to the `backend/` folder inside your activated Python terminal and run:
```powershell
python ingest.py
```
This will automatically scrape the configured Wikipedia pages, generate local embeddings, and save the indexed vectors to the `chroma_db/` folder.
