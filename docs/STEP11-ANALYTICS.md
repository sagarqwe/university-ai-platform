# STEP 11 — Analytics Guide

## Analytics Dashboard
URL: http://localhost:3000/admin/analytics
Access: Admin only

## 4 Charts

### Chart 1: Queries Over Time (Area Chart)
- Data: `GET /api/admin/analytics/queries-per-day`
- Backend JPQL: `COUNT(messages) GROUP BY CAST(timestamp AS date) WHERE role=USER AND timestamp >= 30 days ago`
- X-axis: dates, Y-axis: count, Area fill: indigo gradient
- Falls back to demo data when DB is empty

### Chart 2: Language Distribution (Pie Chart)
- Data: `GET /api/admin/analytics/language-distribution`
- Backend JPQL: `COUNT(messages) GROUP BY detectedLanguage WHERE role=ASSISTANT`
- Returns: [{ language: "English", code: "en", count: 145 }, ...]
- Colors: English=indigo, Hindi=amber, Odia=violet
- Shows progress bars beside pie chart

### Chart 3: Most Asked Topics (Horizontal Bar Chart)
- Data: Static demo (topic classification requires NLP — future improvement)
- Categories: Admissions, Fees, Exams, Hostel, Placements, Scholarship
- Each bar a different palette color

### Chart 4: Confidence Trend (Line Chart)
- Data: `GET /api/admin/analytics/confidence-trend`
- Backend: `AVG(confidenceScore) GROUP BY date WHERE role=ASSISTANT AND 30 days ago`
- Y-axis: 0–100%, shows percentage
- Reference bands: green=high (≥75%), amber=medium (45–75%), red=low (<45%)

## Analytics Data Flow

```
AnalyticsPage mounts
  │
  ├── loadAnalytics() — parallel fetch:
  │     Promise.all([
  │       adminAPI.getQueriesPerDay(),
  │       adminAPI.getLanguageDistribution(),
  │       adminAPI.getConfidenceTrend(),
  │       adminAPI.getOverview()
  │     ])
  │
  ▼
AdminController → AdminService
  ├── getQueriesPerDay()
  │     ChatMessageRepository.countQueriesPerDay(30 days ago)
  │     Returns: [{ date: "2024-06-01", count: 12 }, ...]
  │
  ├── getLanguageDistribution()
  │     ChatMessageRepository.getLanguageDistribution()
  │     Returns: [{ language: "English", code: "en", count: 145 }, ...]
  │
  └── getConfidenceTrend()
        ChatMessageRepository.getConfidenceTrend(30 days ago)
        Returns: [{ date: "06/01", avgConfidence: 0.87 }, ...]
```

## Demo Data Fallback

When DB has no data yet (no queries sent), charts show realistic-looking demo data.
This is controlled by: `data.length > 0 ? data : DEMO_DATA`

When real queries come in, demo data is replaced automatically.

## Recharts Libraries Used

| Chart | Component |
|-------|-----------|
| Queries Over Time | `<AreaChart>` + `<Area>` with gradient fill |
| Language Distribution | `<PieChart>` + `<Pie>` with `<Cell>` colors |
| Topics | `<BarChart layout="vertical">` + `<Bar>` |
| Confidence Trend | `<LineChart>` + `<Line>` |

All charts use:
- `<ResponsiveContainer>` for responsive sizing
- `<CartesianGrid>` with dark slate stroke
- `<CustomTooltip>` styled dark card
- `tickStyle` config for slate-500 axis labels
