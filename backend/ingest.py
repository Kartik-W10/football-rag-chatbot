# scrape + chunk + embed + store
from llama_index.core import VectorStoreIndex, Document, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import chromadb, requests
from bs4 import BeautifulSoup

URLS = [
    "https://en.wikipedia.org/wiki/Indian_Super_League",
    "https://en.wikipedia.org/wiki/I-League",
    "https://en.wikipedia.org/wiki/Association_football",
    "https://en.wikipedia.org/wiki/FIFA_World_Cup",
    "https://en.wikipedia.org/wiki/UEFA_Champions_League",
    "https://en.wikipedia.org/wiki/Premier_League",
]

def scrape(url):
    res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(res.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)

def build_index():
    print("Scraping football data...")
    docs = [Document(text=scrape(url), metadata={"source": url}) for url in URLS]

    import os
    CHROMA_PATH = os.getenv("CHROMA_PATH", "../chroma_db")

    embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = chroma_client.get_or_create_collection("football")
    vector_store = ChromaVectorStore(chroma_collection=collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    print("Embedding and indexing...")
    VectorStoreIndex.from_documents(docs, storage_context=storage_context, embed_model=embed_model)
    print("Done. Knowledge base ready.")

if __name__ == "__main__":
    build_index()