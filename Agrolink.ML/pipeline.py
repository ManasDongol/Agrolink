import pickle
import faiss
import numpy as np
import ollama
from sentence_transformers import SentenceTransformer

MODEL_DIR = "agrolink_model"
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load everything on import — happens once when FastAPI starts
print("Loading RAG model ...")
router_index = faiss.read_index(f"{MODEL_DIR}/router.index")

with open(f"{MODEL_DIR}/metadata.pkl", "rb") as f:
    meta = pickle.load(f)

router_texts  = meta["router_texts"]
router_labels = meta["router_labels"]

domain_indexes = {}
for name, (texts, metadatas) in meta["domain_texts_metas"].items():
    index = faiss.read_index(f"{MODEL_DIR}/{name}.index")
    domain_indexes[name] = (index, texts, metadatas)

print(f"  ✓ {len(domain_indexes)} domain indexes loaded")
print(f"  ✓ Router ready")


def search_index(index, texts, metadatas, query, k=3):
    query_vec = model.encode([query]).astype("float32")
    distances, indices = index.search(query_vec, k)
    return [
        {"text": texts[i], "metadata": metadatas[i], "distance": float(distances[0][j])}
        for j, i in enumerate(indices[0])
        if i < len(texts)
    ]


def route_query(query, top_k=5, distance_threshold=1.2):
    query_vec = model.encode([query]).astype("float32")
    distances, indices = router_index.search(query_vec, top_k)
    activated, seen = [], set()
    for dist, idx in zip(distances[0], indices[0]):
        if dist <= distance_threshold:
            label = router_labels[idx]
            if label not in seen and label in domain_indexes:
                activated.append(label)
                seen.add(label)
    if not activated:
        activated = list(domain_indexes.keys())
    return activated


def run_pipeline(query: str) -> str:
    domains_to_search = route_query(query)

    all_results = []
    for domain in domains_to_search:
        index, texts, metadatas = domain_indexes[domain]
        results = search_index(index, texts, metadatas, query, k=3)
        for r in results:
            r["domain"] = domain
        all_results.extend(results)

    if not all_results:
        return "No relevant information found."

    all_results.sort(key=lambda x: x["distance"])
    seen_texts, unique_results = set(), []
    for r in all_results:
        if r["text"] not in seen_texts:
            unique_results.append(r)
            seen_texts.add(r["text"])

    options_block = ""
    for i, r in enumerate(unique_results, 1):
        options_block += f"[Option {i} — source: {r['domain']}]\n{r['text']}\n\n"

    prompt = f"""You are a concise, expert agriculture assistant. Answer the user's question directly and factually.
FIRST: Check if the user's question is gibberish, random characters, or heavily misspelled with no clear meaning.
- If yes → reply only: "Could not understand, please try again."
- If no → answer the question directly and factually.

User question: "{query}"

If user's question is giberish or has many spelling mistakes reply -> "could not understand, please try again"

Context (use only if relevant to the exact crop/topic asked, OR ELSE DONT MENTION IT):
{options_block}

Instructions:
-  Start your answer immediately — no preamble, no "based on...", no "it appears that..."
- If the context matches the query, extract the exact facts and state them plainly
- If the context does NOT match the crop or topic, ignore it entirely and answer from your own knowledge
- Never say "I think", "it might be", "educated guess", or express uncertainty about well-known agricultural facts
- Never mention the context, options, or sources
- Never mention crop prediction outputs
- Be specific: give numbers, ranges, and actionable advice
- Keep the answer under 80 words unless detail is truly necessaru
"""
    response = ollama.chat(
        model="sike_aditya/AgriLlama",
        messages=[{"role": "user", "content": prompt}]
    )
    return response["message"]["content"]