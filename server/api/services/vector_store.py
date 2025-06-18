
from typing import List, Tuple
from django.db import connection # For raw SQL if needed, but we'll use ORM
from django.db.models.expressions import RawSQL
from api.models import DocumentChunk
from pgvector.django import L2Distance # Import pgvector distance function

def store_document_chunks(document_obj, chunks_with_embeddings: List[Tuple[str, List[float]]]):
    """
    Stores document chunks and their embeddings in the database.
    """
    chunk_objects = []
    for i, (text, embedding) in enumerate(chunks_with_embeddings):
        chunk_objects.append(DocumentChunk(
            document=document_obj,
            text=text,
            embedding=embedding,
            chunk_index=i
        ))
    DocumentChunk.objects.bulk_create(chunk_objects)
    print(f"Stored {len(chunk_objects)} chunks for document {document_obj.filename}")

def retrieve_relevant_chunks(query_embedding: List[float], num_chunks: int = 5) -> List[DocumentChunk]:
    """
    Retrieves the most relevant document chunks based on a query embedding
    using L2 distance (Euclidean distance).
    """
    # Order by L2 distance (or other pgvector distance operators)
    # The L2Distance operation is defined in pgvector.expressions
    # and takes the query embedding and the field to compare against.
    relevant_chunks = DocumentChunk.objects.annotate(
        distance=L2Distance('embedding', query_embedding)
    ).order_by('distance')[:num_chunks]

    print(f"Retrieved {len(relevant_chunks)} relevant chunks.")
    return list(relevant_chunks)

