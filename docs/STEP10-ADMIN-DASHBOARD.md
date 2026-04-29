# STEP 10 — Admin Dashboard Guide

## Admin Dashboard Features

### Access
URL: http://localhost:3000/admin
Login: admin@university.edu / admin123

### 4 Metric Cards (top row)
| Card | Source | API |
|------|--------|-----|
| Total Documents | documents table | GET /api/admin/analytics/overview |
| Total Queries | chat_messages WHERE role=USER | same |
| Avg Confidence | AVG(confidence_score) WHERE role=ASSISTANT | same |
| Active Sessions | chat_sessions WHERE is_active=true | same |

### Document Management Panel (left)
- **Upload PDF** → `POST /api/admin/documents/upload` (multipart/form-data)
  - Saves file to `./uploads/pdfs/<uuid>_filename.pdf`
  - AiFileSyncConfig copies to `ai-service/data/pdfs/` on next startup
  - Creates Document row in DB with `is_indexed=false`
- **Reindex** → `POST /api/admin/documents/reindex`
  - Calls AiClientService → POST http://localhost:8000/reindex
  - FastAPI runs full reindex → returns chunks_indexed count
  - Updates all Document rows: `is_indexed=true`, `indexed_at=now()`
- **Delete** → `DELETE /api/admin/documents/{id}`
  - Removes from DB + deletes file from disk

### Query Logs Table (bottom)
- Shows last 20 USER messages with paired AI confidence + language
- Data from `GET /api/admin/analytics/query-logs?limit=20`
- Each row: user email, query text, confidence badge, language badge, timestamp

### Quick Stats Panel (right)
- Total Users, Indexed Docs, Avg Confidence, Pending Index
- All computed from DB — no external calls

### Full Analytics Link
- "Full analytics →" button in Quick Stats header navigates to `/admin/analytics`

## Document Upload Flow (complete)

```
Admin clicks Upload PDF
  │
  ├── File input (hidden) triggers onChange
  ├── Validates .pdf extension
  ├── FormData.append('file', selectedFile)
  │
  ▼
POST /api/admin/documents/upload
Authorization: Bearer <admin-JWT>
Content-Type: multipart/form-data
  │
  ▼
AdminController.uploadDocument()
  │
  ▼
AdminService.uploadDocument()
  ├── Check PDF mime type
  ├── Generate UUID filename: {uuid}_{originalName}
  ├── Files.copy → ./uploads/pdfs/{storedFilename}
  ├── Save Document to DB (is_indexed=false)
  └── Return DocumentDTO
  │
  ▼
AiFileSyncConfig (background on next startup)
  └── Copies ./uploads/pdfs/*.pdf → ../ai-service/data/pdfs/

Admin clicks Reindex
  │
  ▼
POST /api/admin/documents/reindex
  │
  ▼
AiClientService.triggerReindex()
  └── POST http://localhost:8000/reindex
  │
  ▼
FastAPI RAGPipeline.reindex()
  ├── Reads all PDFs from ai-service/data/pdfs/
  ├── Extract → Clean → Chunk → Embed → FAISS
  └── Returns { chunks_indexed: 847, documents: 3 }
  │
  ▼
AdminService updates DB:
  UPDATE documents SET is_indexed=true, indexed_at=NOW()
```
