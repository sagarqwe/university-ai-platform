# university-ai-platform

An advanced AI-powered system designed to provide intelligent, context-aware, and multilingual assistance for university students and administrators.



> ⚡ This is NOT a chatbot — it is a \*\*University Intelligence System powered by RAG (Retrieval-Augmented Generation)\*\*.



\---



\## 🚀 Key Highlights



\- 🔐 Secure Authentication with Role-Based Access (Student/Admin)

\- 🧠 RAG-based AI Engine (Context-aware, No Hallucination)

\- 🌍 Multilingual Support (English, Hindi, Odia)

\- 📊 Query Intelligence Dashboard (Core Innovation)

\- 😡 Sentiment Analysis for Student Feedback

\- 🔁 Auto-Improvement System (Self-learning AI)

\- 📁 Admin Document Management System

\- 🐳 Dockerized Microservices Architecture



\---



\## 🧠 System Architecture





User → React Frontend → Spring Boot Backend → Python AI Engine → FAISS → LLM → Response





\---



\## 🔐 Authentication System



\### Features:

\- JWT Authentication

\- Role-based Access Control (RBAC)

\- Student \& Admin Roles

\- Profile Completion Check

\- Demo Login (Admin / Student)



\### Sign In:

\- Email

\- Password

\- Role Selection



\### Sign Up (Students Only):

\- Full Name

\- Email

\- Password

\- Confirm Password



\### Profile Setup:

\- Branch (CSE, ECE, etc.)

\- Year (1–4)

\- Course (B.Tech, M.Tech)

\- Hostel (Yes/No)



\---



\## 🧠 AI Core (RAG Engine)



\### Workflow:



User → Backend → Python AI → FAISS → LLM → Response





\### Features:

\- PDF-based knowledge retrieval

\- Context-restricted answers

\- No hallucination responses

\- Semantic search using embeddings



\### Hallucination Control:

```python

if similarity\_score < threshold:

&#x20;   return "Information not available in official documents."

🌍 Multilingual System

Features:

Automatic language detection (langdetect)

English ↔ Hindi ↔ Odia support

Response in same language

Flow:

Detect → Translate → Process → Translate Back

📊 Confidence Scoring System

Score Range	Status

> 0.8	✅ Verified

0.5–0.8	⚠️ Moderate

< 0.5	❌ Low Confidence

💬 Chat System

Real-time chat interface

Message bubbles UI

Timestamp display

Confidence badge

Language badge

Session history

📁 Admin Document Management

Upload PDF documents

Store metadata

Version control

Reindex trigger button

🔄 Vector Reindex System

Trigger:

After document upload

Function:

Reload documents

Generate embeddings

Update FAISS index

📊 Query Intelligence Dashboard ⭐

Features:

Most asked topics

Queries per day

Peak usage hours

Department-wise analysis

😡 Sentiment Analysis

Detects:

Positive

Neutral

Negative

Purpose:

Identify student frustration trends

Improve system quality

🔁 Auto-Improvement System

Detect low-confidence queries

Suggest missing documents

Generate FAQ recommendations

📊 Analytics Dashboard

Query trends (Line Chart)

Topic distribution (Bar Chart)

Language usage (Pie Chart)

Confidence trends

🧾 Chat Logging System



Stores:



Query

Response

Confidence Score

Language

Sentiment

Timestamp

User Info

🧠 Personalization System



Based on:



Branch

Year

Course

Example:



“CSE students frequently ask about placements”



🔍 Transparency Feature

Shows retrieved document chunks

Displays similarity scores

Builds trust in AI responses

🖥️ Dashboards

👨‍🎓 Student Dashboard

Chat interface

Language selector

Session history

Confidence display

System status panel

🛠️ Admin Dashboard

Metrics overview

Document upload

Query logs

Analytics charts

🐳 Docker Setup

Run:

docker-compose up --build

Services:

React Frontend

Spring Boot Backend

Python AI Service

PostgreSQL Database

🛠️ Tech Stack

Layer	Technology

Frontend	React.js

Backend	Spring Boot

AI Engine	Python (FAISS, NLP, langdetect)

Database	PostgreSQL

DevOps	Docker

📂 Project Structure

university-ai-platform/

│── frontend/

│── backend/

│── ai-service/

│── database/

│── docker-compose.yml

│── README.md

⚙️ Installation

git clone https://github.com/YOUR\_USERNAME/university-ai-platform.git

cd university-ai-platform

🎯 Project Vision



To build a scalable AI-powered university intelligence system that:



Eliminates misinformation

Enhances student experience

Enables data-driven decisions

