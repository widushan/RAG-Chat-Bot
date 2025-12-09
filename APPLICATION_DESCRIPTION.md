# F1GPT - RAG Chat Bot: Complete Application Description

## 1. Project Overview

**F1GPT** is a Retrieval-Augmented Generation (RAG) chatbot specifically designed for Formula One enthusiasts. It combines the power of OpenAI's language models with a vector database to provide accurate, up-to-date answers about Formula One racing by augmenting AI generation with real document retrieval.

### Key Purpose
The application answers F1-related questions by:
1. Retrieving relevant documents from a vector database
2. Using those documents to augment AI responses
3. Delivering informed, accurate answers based on the latest information

---

## 2. Technology Stack

### Frontend
- **Next.js 15.5.6** - React framework for production-grade web apps
- **React 19.1.0** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling (referenced in components)

### Backend/AI
- **OpenAI API** - GPT-4 model for chat completions and text embeddings
- **LangChain.js** - Framework for building LLM applications
  - `@langchain/core` - Core abstractions
  - `@langchain/community` - Community integrations
  - `@langchain/textsplitters` - Text chunking utilities

### Database
- **Astra DB (DataStax)** - Vector database for storing document embeddings
- **Puppeteer** - Web scraping library for gathering F1 data

### Development Tools
- **ts-node** - TypeScript execution
- **ESLint** - Code linting
- **dotenv** - Environment variable management

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface (Frontend)              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  page.tsx (Chat Interface)                          │   │
│  │  - Input form for questions                         │   │
│  │  - Message history display                          │   │
│  │  - Streaming response handling                      │   │
│  │  - Loading states                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                     │
│         ┌───────────────┼───────────────┐                    │
│         │               │               │                    │
│    ┌────▼────┐   ┌─────▼──────┐  ┌────▼──────────┐          │
│    │  Bubble │   │LoadingBubble│  │PromptSuggestions         
│    │Component│   │  Component  │  │  Components  │          │
│    └─────────┘   └─────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
                         │
                    HTTP POST
                         │
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Layer                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/chat/route.ts (Chat API Endpoint)             │   │
│  │                                                      │   │
│  │  1. Receive user message                            │   │
│  │  2. Generate embedding for the message              │   │
│  │  3. Query Astra DB for similar documents            │   │
│  │  4. Build augmented prompt with context             │   │
│  │  5. Call OpenAI GPT-4 with context                  │   │
│  │  6. Stream response back to client                  │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                      │                             │
│         │                      │                             │
└─────────┼──────────────────────┼──────────────────────────────┘
          │                      │
          │                      │
    ┌─────▼──────┐          ┌────▼────────────────┐
    │ OpenAI API │          │  Astra DB Vector    │
    │            │          │  Database           │
    │ - GPT-4    │          │                     │
    │ - Embeddings
    └────────────┘          └─────────────────────┘
                                    │
                        ┌───────────┘
                        │
                   ┌────▼─────────┐
                   │  Populated by │
                   │  loadDb.ts    │
                   └───────────────┘
```

---

## 4. Data Flow - Detailed Process

### 4.1 Initial Data Population (Setup Phase)

**File:** `scripts/loadDb.ts`

**Process Flow:**

1. **Data Sources Identification**
   - Scrapes 11 Wikipedia pages and F1 official sources
   - URLs include:
     - Formula One main page
     - F1 official website
     - F1 Grand Prix winners history
     - F1 statistics and fandom wikis

2. **Web Scraping (Puppeteer)**
   ```
   URL → Puppeteer opens browser → Load page → Extract HTML
   → Strip HTML tags → Get plain text content
   ```
   - Uses headless browser for dynamic content
   - Extracts and cleans text

3. **Text Chunking (LangChain)**
   ```
   Full Document Text
         ↓
   RecursiveCharacterTextSplitter
   (512 chars per chunk, 100 char overlap)
         ↓
   Multiple Chunks for semantic coherence
   ```
   - Chunk size: 512 characters
   - Overlap: 100 characters (maintains context between chunks)
   - Prevents semantic information loss

4. **Embedding Generation (OpenAI)**
   ```
   Each Chunk
         ↓
   OpenAI text-embedding-3-small model
         ↓
   1536-dimensional vector
   ```
   - Model: `text-embedding-3-small`
   - Dimension: 1536
   - Creates semantic representation of text

5. **Vector Storage (Astra DB)**
   ```
   {
     $vector: [1536-dim embedding vector],
     text: "Original chunk text"
   }
         ↓
   Insert into Astra DB collection
   ```
   - Similarity metric: Dot Product
   - Supports semantic search

**Execution:**
```bash
npm run seed
# Runs: ts-node --transpile-only ./scripts/loadDb.ts
```

---

### 4.2 Runtime Chat Flow (User Interaction Phase)

**File:** `app/api/chat/route.ts`

**Step-by-Step Process:**

#### Step 1: Receive User Message
```typescript
POST /api/chat
{
  "messages": [
    { role: "user", content: "Who won the 2024 F1 Championship?" },
    ...previous messages
  ]
}
```

#### Step 2: Extract Latest Message
```typescript
const latestMessage = messages[messages.length - 1].content
// Result: "Who won the 2024 F1 Championship?"
```

#### Step 3: Generate Embedding for User Query
```
User Question
      ↓
OpenAI text-embedding-3-small
      ↓
1536-dimensional embedding vector
```

#### Step 4: Vector Similarity Search
```
Query Vector
      ↓
Astra DB: Find 10 most similar documents
(using dot product similarity metric)
      ↓
Return top 10 chunks of text
```
- Retrieves 10 most semantically similar documents
- Higher dot product = better match

#### Step 5: Build Augmented Prompt
```typescript
const template = {
  role: "system",
  content: `You are an AI assistant who knows everything about Formula One.
  Use the below context to augment what you know about Formula One racing.
  [Retrieved Documents Inserted Here]
  QUESTION: [User's original question]`
}
```

**Prompt Components:**
- System instructions defining the AI's role
- Retrieved context from vector database
- User's original question
- Instruction to format with markdown and not mention sources

#### Step 6: Call GPT-4 with Streaming
```
Augmented Prompt + Chat History
      ↓
OpenAI GPT-4 API (stream: true)
      ↓
Stream tokens in real-time
```

**Model:** GPT-4
**Streaming:** Enabled for responsive UX

#### Step 7: Stream Response to Client
```
OpenAI Stream
      ↓
ai/react library converts to browser stream
      ↓
StreamingTextResponse (HTTP streaming)
      ↓
Browser renders tokens as they arrive
```

---

## 5. Component Structure

### Frontend Components

#### `page.tsx` (Main Page)
- **Role:** Main chat interface
- **Key Features:**
  - Manages chat state using `useChat()` hook from ai/react
  - Displays welcome message and prompt suggestions when no messages
  - Shows message history once chat begins
  - Renders loading state during API calls
  - Handles form submission and input changes

#### `Bubble.tsx`
- **Role:** Individual message display
- **Props:** `{ message: Message }`
- **Feature:** Styles messages differently based on role (user vs assistant)

#### `LoadingBubble.tsx`
- **Role:** Loading animation indicator
- **Feature:** Simple loader element displayed while waiting for response

#### `PromptSuggestionsRow.tsx` & `PromptSuggestionButton.tsx`
- **Role:** Pre-built question suggestions
- **Feature:** Users can click suggestions instead of typing
- **Function:** Improves UX by providing example questions

#### `layout.tsx`
- **Role:** Root layout wrapper
- **Feature:** Sets metadata and applies global CSS

### Backend API

#### `route.ts` (/api/chat/)
- **Method:** POST
- **Responsibility:** 
  - Message processing
  - Embedding generation
  - Database querying
  - Prompt augmentation
  - OpenAI API call
  - Response streaming

---

## 6. Key Technical Concepts

### 6.1 Retrieval-Augmented Generation (RAG)

**Traditional LLM:** Uses only trained knowledge
```
Query → GPT-4 → Response (potentially outdated)
```

**RAG Approach:** Combines retrieval with generation
```
Query
   ├→ Generate embedding
   ├→ Retrieve relevant docs from DB
   └→ Augment prompt with retrieved context
      └→ GPT-4 (now has latest information)
         └→ More accurate, up-to-date response
```

**Advantages:**
- Reduces hallucination
- Uses real, current data
- More trustworthy responses
- Transparent information sources

### 6.2 Vector Embeddings

**What are embeddings?**
- Numerical representations of text meaning
- 1536-dimensional vector (in this case)
- Similar meanings = similar vectors
- Enables semantic search (not keyword-based)

**Example:**
```
"Verstappen wins championship" → [0.234, -0.156, 0.890, ...]
"Max becomes F1 champion"      → [0.235, -0.158, 0.891, ...]
(Similar vectors → semantically similar)
```

### 6.3 Streaming Responses

**Why streaming?**
- User sees response building in real-time
- Better perceived performance
- Reduces waiting feeling
- Professional chat experience

**Flow:**
```
GPT-4 generates: "Max Verstappen won the..."
                    ↓
Token 1 → Stream to client → Render "Max"
Token 2 → Stream to client → Render " Verstappen"
Token 3 → Stream to client → Render " won"
... continues until complete
```

---

## 7. Environment Variables Required

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Astra DB Configuration
ASTRA_DB_NAMESPACE=default_namespace
ASTRA_DB_COLLECTION=f1_documents
ASTRA_DB_API_ENDPOINT=https://{UUID}-{REGION}.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
```

---

## 8. Data Processing Pipeline Summary

```
1. SCRAPING PHASE
   URLs (F1 Wikipedia, official sites) 
   → Puppeteer web scraping 
   → Raw HTML 
   → Text extraction (strip HTML tags)

2. CHUNKING PHASE
   Full documents 
   → RecursiveCharacterTextSplitter 
   → Smaller, meaningful chunks (512 chars with 100 char overlap)

3. EMBEDDING PHASE
   Text chunks 
   → OpenAI text-embedding-3-small 
   → 1536-dimensional vectors

4. STORAGE PHASE
   Vector + Text 
   → Astra DB collection 
   → Vector index created (dot_product metric)

5. QUERY PHASE (Runtime)
   User question 
   → Embedding 
   → Vector similarity search 
   → Top 10 documents retrieved

6. AUGMENTATION PHASE
   Retrieved context + Original prompt 
   → Enhanced system message

7. GENERATION PHASE
   Augmented prompt + GPT-4 
   → Streaming response

8. DELIVERY PHASE
   Streamed tokens 
   → Browser UI 
   → Real-time display
```

---

## 9. Error Handling

### Graceful Degradation
- If Astra DB unavailable: Falls back to GPT-4 without augmentation
- If OpenAI unavailable: Returns error message
- Database query errors: Logged, continues without context

### Code Example:
```typescript
if (openai && db && ASTRA_DB_COLLECTION) {
  try {
    // Vector search logic
  } catch (err) {
    console.log("Error querying db...")
    docContext = "" // Use empty context
  }
}
// Continues with GPT-4 call regardless
```

---

## 10. Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local with required keys

# Populate vector database
npm run seed

# Start development server
npm run dev
# Access at http://localhost:3000
```

### Production Build
```bash
npm run build  # Compile TypeScript to optimized JS
npm start      # Run production server
```

---

## 11. Performance Considerations

### Optimization Strategies

1. **Streaming:** Responses appear instantly rather than waiting for full generation
2. **Vector Search:** O(log n) complexity vs O(n) for semantic matching
3. **Text Chunking:** 512-char chunks balance semantic coherence with embedding cost
4. **Embedding Model:** `text-embedding-3-small` offers good performance vs cost ratio
5. **Similarity Metric:** Dot product is faster than cosine for this use case

### Scalability

- **Vector Database:** Astra DB handles millions of vectors
- **Concurrent Users:** Next.js API handles multiple parallel requests
- **Cost:** Embeddings and chat calls leverage API providers' infrastructure

---

## 12. Interview-Ready Talking Points

### Strengths to Highlight

1. **RAG Implementation**
   - "This app demonstrates practical RAG architecture"
   - "We retrieve real data before generation to ensure accuracy"
   - "Reduces hallucination compared to pure LLM approaches"

2. **Full-Stack Development**
   - Frontend: Modern React/Next.js with streaming support
   - Backend: API design with proper error handling
   - Database: Vector embeddings and semantic search
   - AI: LLM integration with proper prompt engineering

3. **Data Pipeline**
   - Web scraping, text processing, chunking, embedding, storage, retrieval
   - Shows understanding of NLP concepts

4. **Real-time Features**
   - Streaming responses for better UX
   - Proper state management with React hooks

5. **Best Practices**
   - Environment variable management
   - Error handling and graceful degradation
   - TypeScript for type safety
   - Clean component structure

### Potential Follow-up Questions & Answers

**Q: Why vector embeddings instead of keyword search?**
- A: Keyword search misses semantic meaning. Embeddings find conceptually similar documents even with different wording.

**Q: How do you prevent hallucinations?**
- A: By augmenting the prompt with retrieved documents, the model responds based on facts rather than pure generation.

**Q: What if the vector database goes down?**
- A: The app gracefully falls back to using GPT-4's base knowledge without the augmentation.

**Q: Why chunk the documents?**
- A: Smaller chunks are more semantically coherent. Embeddings work better on focused content. Overlap prevents losing context at chunk boundaries.

**Q: How do you choose the embedding model?**
- A: `text-embedding-3-small` provides a good balance of cost vs. quality. Larger models available for higher accuracy.

**Q: Explain the chat flow for a user question.**
- A: User submits → Generate query embedding → Search vector DB for top 10 similar docs → Build augmented prompt with retrieved context → Call GPT-4 → Stream response back to user.

---

## 13. Potential Improvements (Interview Talking Points)

1. **Caching:** Cache embeddings for repeated questions
2. **User Feedback:** Track which responses were helpful to fine-tune retrieval
3. **Multi-turn Context:** Better conversation memory across multiple exchanges
4. **Filtering:** Date-based filtering for more recent information
5. **Monitoring:** Track API costs, response times, user feedback
6. **Authentication:** Add user authentication for personalization
7. **Testing:** Unit tests for API endpoints and components
8. **Documentation:** API documentation with examples
9. **Analytics:** Track popular questions and performance metrics

---

## Summary

F1GPT is a production-ready RAG chatbot demonstrating:
- Modern full-stack development (Next.js, React, TypeScript)
- AI/ML integration (OpenAI, LangChain, embeddings)
- Database design (vector databases, semantic search)
- Real-time streaming capabilities
- Scalable architecture
- Practical problem-solving (answering F1 questions accurately)

This project showcases your ability to build complete, AI-powered applications from backend data pipeline to responsive frontend UI.
