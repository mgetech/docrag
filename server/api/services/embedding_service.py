import os
from transformers import AutoTokenizer, AutoModel
import torch

# This model is lightweight and good for general-purpose embeddings
EMBEDDING_MODEL_NAME = os.getenv('HF_EMBEDDING_MODEL_NAME', 'sentence-transformers/all-MiniLM-L6-v2')

# Global variables to store the loaded model and tokenizer
_tokenizer = None
_model = None

def load_embedding_model():
    """Loads the Hugging Face embedding model and tokenizer."""
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        print(f"Loading embedding model: {EMBEDDING_MODEL_NAME}...")
        _tokenizer = AutoTokenizer.from_pretrained(EMBEDDING_MODEL_NAME)
        _model = AutoModel.from_pretrained(EMBEDDING_MODEL_NAME)
        print("Embedding model loaded.")
    return _tokenizer, _model

def generate_embedding(text: str) -> list[float]:
    """
    Generates an embedding for a given text using the loaded model.
    """
    tokenizer, model = load_embedding_model()

    # Tokenize the input text
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)

    # Get the embeddings
    with torch.no_grad():
        model_output = model(**inputs)

    # Pool outputs to get a single vector per sentence (mean pooling)
    # This is a common pooling strategy for sentence-transformers
    embeddings = model_output.last_hidden_state.mean(dim=1).squeeze()

    # Normalize embeddings (important for cosine similarity)
    embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=0)

    return embeddings.tolist()
