from typing import List, Tuple

def split_text_into_chunks(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Splits a long text into smaller, overlapping chunks.
    This is a very basic splitter. For production, consider more advanced methods
    like Langchain's RecursiveCharacterTextSplitter.
    """
    chunks = []
    current_index = 0
    while current_index < len(text):
        end_index = min(current_index + chunk_size, len(text))
        chunk = text[current_index:end_index]
        chunks.append(chunk)
        if end_index == len(text):
            break
        current_index += chunk_size - chunk_overlap
    return chunks

def extract_text_from_file_content(filename: str, content: str) -> str:
    """
    Extracts text from various file content types.
    For a minimal project, we'll assume text or base64 encoded text.
    For PDFs, you'd need a library like PyPDF2 or pdfplumber.
    """
    # Assuming 'content' is raw text or base64 encoded text.
    # If it's base64 encoded, you'd need to decode it first:
    # import base64
    # decoded_bytes = base64.b64decode(content)
    # text = decoded_bytes.decode('utf-8') # Adjust encoding if needed

    # For this minimal example, we'll assume 'content' is already plain text.
    return content

