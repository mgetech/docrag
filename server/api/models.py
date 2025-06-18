import uuid
from django.db import models
from pgvector.django import VectorField

class Document(models.Model):
    """
    Represents an uploaded document (e.g., PDF, TXT).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    filename = models.CharField(max_length=255)
    content = models.TextField() # Stores the full text content of the document
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename

class DocumentChunk(models.Model):
    """
    Represents a small, embeddable chunk of a document.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    text = models.TextField() # The text content of this specific chunk
    embedding = VectorField(dimensions=384) # Using 384 for 'all-MiniLM-L6-v2' embeddings
    chunk_index = models.IntegerField(default=0) # To maintain order or context

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.filename}"

    class Meta:
        ordering = ['document', 'chunk_index']