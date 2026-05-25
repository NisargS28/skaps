I have an existing Node.js/Express backend and React frontend AI chat app.

My app already supports multiple chat models from models.json. I have updated models.json into categorized format with:
- chatModels
- ocrModels
- embeddingModels
- defaults

My embedding model is:
text-embedding-nomic-embed-text-v1.5

I want to implement RAG step by step using Qdrant as the vector database.

Please implement the RAG system with this architecture:

1. User uploads document
2. Backend extracts text from document
3. Backend chunks the extracted text
4. Backend generates embeddings using text-embedding-nomic-embed-text-v1.5
5. Backend stores chunk text, embedding vector, and metadata in Qdrant
6. User asks a question
7. Backend embeds the question
8. Backend searches Qdrant for top relevant chunks
9. Backend builds a grounded RAG prompt using retrieved chunks
10. Backend sends prompt to selected chat model
11. Backend returns answer + sources to frontend

Important requirements:

- Use Qdrant vector database.
- Use @qdrant/js-client-rest for Qdrant integration.
- Use multer for file upload.
- Support PDF, TXT, and DOCX initially.
- Use pdf-parse for PDF text extraction.
- Use mammoth for DOCX text extraction.
- Use uuid for documentId and chunk IDs.
- Use dotenv for environment variables.
- Store userId in Qdrant payload if authentication exists.
- If no auth exists, still design functions to accept optional userId.
- Use selected chat model from frontend for final RAG answer.
- Do not use chat model for embeddings.
- Use embedding model from models.json defaults.embeddingModel.
- Add source citations in response, including fileName, documentId, chunkIndex, and score.
- Add backend validation so only enabled chat models can be used.
- Add error handling for unsupported file types, empty documents, embedding failure, Qdrant failure, and model failure.

Create this folder structure:

server/
  config/
    models.json
  utils/
    modelRegistry.js
  services/
    ai.service.js
    rag/
      document.service.js
      chunk.service.js
      embedding.service.js
      vector.service.js
      rag.service.js
  routes/
    rag.routes.js

Implement these files:

1. modelRegistry.js
- Load models.json
- Export getChatModel(modelId)
- Export getDefaultChatModel()
- Export getEmbeddingModel()
- Export getEnabledChatModels()

2. document.service.js
- extractTextFromFile(file)
- Support PDF, DOCX, TXT
- Throw error for unsupported file type

3. chunk.service.js
- chunkText(text, { chunkSize, overlap })
- Default chunkSize = 1000 characters
- Default overlap = 200 characters
- Clean whitespace
- Ignore tiny chunks under 50 characters

4. embedding.service.js
- createEmbedding(text)
- Use getEmbeddingModel()
- Call my existing embedding API function or create callEmbeddingAPI()
- Return embedding vector as number[]

5. vector.service.js
- Initialize QdrantClient
- ensureRagCollection()
- create collection if not exists
- collection name should come from env QDRANT_COLLECTION
- vector size should come from env EMBEDDING_DIMENSIONS or model config
- distance should be Cosine
- storeDocumentChunks({ documentId, chunks, fileName, userId })
- searchSimilarChunks({ embedding, userId, topK })
- deleteDocument({ documentId, userId })

6. rag.service.js
- ingestDocument({ file, userId })
- answerWithRag({ question, selectedModel, userId, topK })
- Retrieve topK chunks from Qdrant
- Build strict prompt:
  "Use only the provided context. If answer is not in context, say you don't know based on uploaded documents."
- Return:
  {
    answer,
    model,
    sources
  }

7. rag.routes.js
- POST /api/rag/upload
- POST /api/rag/chat
- DELETE /api/rag/documents/:documentId
- Use multer for upload
- Return clear JSON responses

8. Frontend
- Add document upload UI
- Add "Ask from documents" chat mode
- Send selectedModel with RAG question
- Display answer
- Display sources below answer

Also create .env example:

QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=rag_documents
EMBEDDING_DIMENSIONS=768
DEFAULT_CHAT_MODEL=qwen/qwen3.5-9b

Before writing final code, inspect existing project structure and integrate with existing chat/model functions instead of duplicating logic.