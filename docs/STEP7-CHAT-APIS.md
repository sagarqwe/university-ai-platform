# STEP 7 — Chat APIs Guide

## Chat Request Flow

```
React StudentDashboard
  │
  │  POST /api/chat/query
  │  Authorization: Bearer <JWT>
  │  { "query": "What are exam dates?",
  │    "language": "auto",
  │    "sessionId": "a1b2c3d4-..." }
  │
  ▼
ChatController.query()
  │
  ▼
ChatService.processQuery()
  ├── 1. getOrCreateSession()   → reuses existing or creates new UUID session
  ├── 2. Save USER message      → chat_messages table
  ├── 3. AiClientService.askQuestion()  → HTTP POST to FastAPI :8000/ask
  │         │
  │         ▼
  │       Python FastAPI
  │         ├── Detect language (langdetect)
  │         ├── Embed query (sentence-transformers)
  │         ├── FAISS search → top-5 chunks
  │         ├── Compute confidence score
  │         └── Call Gemini/OpenAI LLM
  │         ▲
  │         │  returns: { answer, confidence, detected_language, fallback }
  │
  ├── 4. Save ASSISTANT message → chat_messages table
  ├── 5. Update session lastActivity
  └── 6. Return QueryResponse

Response:
{
  "answer": "The end-semester examinations are scheduled...",
  "confidence": 0.87,
  "detectedLanguage": "en",
  "languageName": "English",
  "fallback": false,
  "sessionId": "a1b2c3d4-...",
  "timestamp": "2024-06-15T14:30:00"
}
```

## All Chat Endpoints

### POST /api/chat/session
Create a new chat session. Returns UUID session ID.
```json
Response: { "sessionId": "uuid-string", "createdAt": "2024-06-15T14:00:00" }
```

### POST /api/chat/query
Send a question to the AI.
```json
Request:  { "query": "...", "language": "auto|en|hi|or", "sessionId": "..." }
Response: { "answer": "...", "confidence": 0.87, "detectedLanguage": "en",
            "fallback": false, "sessionId": "...", "timestamp": "..." }
```

### GET /api/chat/sessions
List all sessions for the logged-in user, ordered by most recent.
```json
Response: [ { "sessionId": "...", "messageCount": 12, "lastActivity": "..." } ]
```

### GET /api/chat/history/{sessionId}
Get all messages in a session.
```json
Response: [
  { "id": 1, "role": "USER",      "content": "...", "timestamp": "..." },
  { "id": 2, "role": "ASSISTANT", "content": "...", "confidence": 0.87,
    "detectedLanguage": "en", "fallback": false }
]
```

## Confidence Score Meaning

| Range     | Meaning                     | UI Color | Fallback? |
|-----------|-----------------------------|----------|-----------|
| 0.75–1.0  | High — strong document match| Green    | No        |
| 0.45–0.75 | Medium — partial match      | Amber    | No        |
| 0.0–0.45  | Low — no reliable match     | Red      | Yes ← returns "I don't know" message |

## Fallback Messages (per language)

When confidence < 0.45:
- **English**: "I'm sorry, I don't have reliable information about this. Please contact the university office directly."
- **Hindi**: "मुझे खेद है, मेरे पास इस विषय में विश्वसनीय जानकारी नहीं है।"
- **Odia**: "ମୁଁ ଦୁଃଖିତ, ଏই ବିଷୟରେ ମୋ ପାଖରେ ନିର୍ଭରଯୋଗ୍ୟ ତଥ୍ୟ ନାହିଁ।"

## Database Storage

Every query saves exactly 2 rows:
```
chat_messages:
  id=101  session_id=5  role=USER       content="What are exam dates?"
  id=102  session_id=5  role=ASSISTANT  content="The exams are..."
                                        confidence_score=0.8700
                                        detected_language=en
                                        is_fallback=false
```
