import os
from llama_cpp import Llama # Assuming llama_cpp-python is installed with server or full

# Path to your GGUF model file
# IMPORTANT: Replace this with the actual path to your downloaded .gguf model file.
LLM_MODEL_PATH = os.getenv('LLM_MODEL_PATH', '/path/to/your/llm/model/llama-2-7b-chat.Q4_K_M.gguf')

_llm_model = None

def load_llm_model():
    """Loads the Llama-cpp-python LLM model."""
    global _llm_model
    if _llm_model is None:
        print(f"Loading LLM model from: {LLM_MODEL_PATH}...")
        try:
            _llm_model = Llama(model_path=LLM_MODEL_PATH, n_ctx=2048, n_gpu_layers=-1, verbose=False) # n_gpu_layers=-1 to offload all to GPU if available
            print("LLM model loaded.")
        except Exception as e:
            print(f"Error loading LLM model: {e}")
            print("Please ensure the LLM_MODEL_PATH is correct and the .gguf file exists.")
            _llm_model = None # Ensure it's None if loading fails for subsequent checks
    return _llm_model

def generate_text_from_llm(prompt: str, max_tokens: int = 500) -> str:
    """
    Generates text using the loaded Llama-cpp-python LLM.
    """
    llm = load_llm_model()
    if llm is None:
        return "Error: LLM model not loaded. Cannot generate text."

    print(f"Generating text for prompt (first 100 chars): {prompt[:100]}...")
    try:
        output = llm(
            prompt,
            max_tokens=max_tokens,
            stop=["\nUser:", "###", "Human:", "Question:"], # Common stop sequences
            echo=False, # Don't echo the prompt back
            temperature=0.7,
            top_p=0.9,
            repeat_penalty=1.1
        )
        return output['choices'][0]['text'].strip()
    except Exception as e:
        print(f"Error during LLM text generation: {e}")
        return f"Error: Could not generate answer. {e}"