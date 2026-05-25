# retrieval + Groq LLM call
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.groq import Groq
import chromadb, os
from dotenv import load_dotenv

load_dotenv()

embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
llm = Groq(model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"))

CHROMA_PATH = os.getenv("CHROMA_PATH", "../chroma_db")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection("football")
vector_store = ChromaVectorStore(chroma_collection=collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_vector_store(vector_store, embed_model=embed_model)
query_engine = index.as_query_engine(llm=llm, similarity_top_k=3)

def ask(question: str) -> dict:
    response = query_engine.query(question)
    sources = []
    if hasattr(response, "source_nodes") and response.source_nodes:
        for node_with_score in response.source_nodes:
            node = node_with_score.node
            metadata = node.metadata if hasattr(node, "metadata") else {}
            text = node.get_content() if hasattr(node, "get_content") else ""
            score = node_with_score.score if hasattr(node_with_score, "score") else None
            sources.append({
                "source": metadata.get("source", "Unknown"),
                "score": float(score) if score is not None else None,
                "text": text[:300] + "..." if text else ""
            })
    return {
        "answer": str(response),
        "sources": sources
    }