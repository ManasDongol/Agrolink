import pickle
import faiss
import numpy as np
import ollama
import re
from sentence_transformers import SentenceTransformer
from functools import lru_cache

MODEL_DIR = "agrolink_model"
model = SentenceTransformer('all-MiniLM-L6-v2')

print("Loading RAG model ...")


router_index = faiss.read_index(f"{MODEL_DIR}/router.index")

with open(f"{MODEL_DIR}/metadata.pkl", "rb") as f:
    meta = pickle.load(f)

router_labels = meta["router_labels"]

domain_indexes = {}
for name, (texts, metadatas) in meta["domain_texts_metas"].items():
    index = faiss.read_index(f"{MODEL_DIR}/{name}.index")
    domain_indexes[name] = (index, texts, metadatas)

print(f"  ✓ {len(domain_indexes)} domain indexes loaded")
print(f"  ✓ Router ready")




session_state = {}

CROP_KEYWORDS = {
    "citrus": ["orange", "lemon", "mandarin", "lime"],
    "maize": ["corn", "maize"],
    "tomato": ["tomato"],
    "potato": ["potato"],
    "rice": ["rice"],
    "wheat": ["wheat"]
}


def detect_crop(query: str):
    q = query.lower()
    for crop, keywords in CROP_KEYWORDS.items():
        for k in keywords:
            if k in q:
                return crop
    return None


def is_gibberish(text: str) -> bool:
    text = text.strip()

    if len(text) < 3:
        return True

    if sum(c.isalpha() for c in text) / max(len(text), 1) < 0.4:
        return True

    if len(re.findall(r"[aeiouAEIOU]", text)) < 2:
        return True

    return False




@lru_cache(maxsize=1000)
def embed_query(query: str):
    return model.encode([query]).astype("float32")




def search_index(index, texts, metadatas, query, k=2):
    query_vec = embed_query(query)
    distances, indices = index.search(query_vec, k)

    return [
        {
            "text": texts[i],
            "metadata": metadatas[i],
            "distance": float(distances[0][j])
        }
        for j, i in enumerate(indices[0])
        if i < len(texts)
    ]




def route_query(query, top_k=3, distance_threshold=0.9):
    query_vec = embed_query(query)
    distances, indices = router_index.search(query_vec, top_k)

    activated, seen = [], set()

    for dist, idx in zip(distances[0], indices[0]):
        if dist <= distance_threshold:
            label = router_labels[idx]
            if label not in seen and label in domain_indexes:
                activated.append(label)
                seen.add(label)

    # fallback
    if not activated:
        activated = list(domain_indexes.keys())[:1]

    return activated[:1]



def run_pipeline(query: str, session_id: str = "default") -> str:
    print("Query:", query)

    # ─── 1. GIBBERISH CHECK ───
    if is_gibberish(query):
        return "Could not understand, please try again."

    # ─── 2. SESSION INIT ───
    if session_id not in session_state:
        session_state[session_id] = {"crop": None}

    state = session_state[session_id]

    # ─── 3. CROP DETECTION + LOCK ───
    detected_crop = detect_crop(query)
    if detected_crop:
        state["crop"] = detected_crop

    # ─── 4. DOMAIN SELECTION ───
    if state["crop"] and state["crop"] in domain_indexes:
        domains_to_search = [state["crop"]]
    else:
        domains_to_search = route_query(query)

    # ─── 5. RETRIEVAL ───
    all_results = []

    for domain in domains_to_search:
        index, texts, metadatas = domain_indexes[domain]
        results = search_index(index, texts, metadatas, query, k=2)

        for r in results:
            r["domain"] = domain

        all_results.extend(results)

    if not all_results:
        return "No relevant information found."

    # ─── 6. CLEAN + SORT ───
    all_results.sort(key=lambda x: x["distance"])

    seen_texts = set()
    unique_results = []

    for r in all_results:
        if r["text"] not in seen_texts:
            unique_results.append(r)
            seen_texts.add(r["text"])

    unique_results = unique_results[:2]

    options_block = "\n".join([
        r["text"][:150]
        for r in unique_results
    ])

    # ─── 7. PROMPT ───
    crop_context = state["crop"] if state["crop"] else "general agriculture"

    prompt = f"""
You are a helpful agriculture expert speaking to a farmer.

Current crop context: {crop_context}

Question: {query}

Context (use only if relevant):
{options_block}

Rules:
- Do NOT copy the format of the context
- Do NOT mention "Predicted", "Detailed information"
- Be natural and conversational
- Give practical farming advice
- Keep under 80 words
"""

    # ─── 8. LLM CALL ───
    response = ollama.chat(
        model="sike_aditya/AgriLlama",
        messages=[{"role": "user", "content": prompt}],
        options={
            "num_predict": 100,
            "temperature": 0.3,
        }
    )

    return response["message"]["content"]