# LegalSimplify ⚖

An AI-powered web app that simplifies legal documents into plain language. Upload a PDF, and get a clause-by-clause breakdown with risk highlights — in your language.

**Live Demo:** [legal-doc-simplifier-1-rwei.onrender.com](https://legal-doc-simplifier-1-rwei.onrender.com)

> ⚠️ Backend runs on Render free tier — may take 30–50 seconds to wake up on first visit.

---

## What it does

- Upload any legal PDF (rental agreement, employment contract, loan document, NDA)
- AI reads the document and extracts key clauses
- Each clause is simplified into plain language
- Clauses are tagged as **Safe**, **Warning**, or **Danger**
- Full document summary generated in your chosen language
- Supports 8 languages — English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT, Multer, Google Gemini 2.5 Flash API

**Frontend:** React, Vite, React Router, Axios

**Deployed on:** Render (backend + frontend), MongoDB Atlas (database)

---

## Folder Structure

```
legal-doc-simplifier/
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # register, login, JWT
│   │   │   ├── document/    # upload, analyse, CRUD
│   │   │   └── gemini/      # AI processing + risk tagging
│   │   ├── middleware/      # auth, error handling, rate limiting
│   │   ├── config/          # database + Gemini setup
│   │   └── utils/           # PDF parser, response helper
│   └── server.js
└── client/          # React + Vite frontend
    └── src/
        ├── pages/   # Login, Register, Dashboard, Upload, Result
        ├── components/
        ├── context/ # Auth context
        └── api/     # Axios setup
```

---

## API Routes

```
POST   /api/auth/register            Register new user
POST   /api/auth/login               Login and get JWT token
GET    /api/auth/me                  Get logged in user

POST   /api/documents                Upload PDF
POST   /api/documents/:id/analyse    Analyse document with AI
GET    /api/documents                Get all documents
GET    /api/documents/:id            Get single document
DELETE /api/documents/:id            Delete document

GET    /api/health                   Health check
```

---

## Run Locally

**1. Clone the repo**
```bash
git clone https://github.com/dhritibr/legal-doc-simplifier.git
cd legal-doc-simplifier
```

**2. Setup backend**
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

**3. Setup frontend**
```bash
cd client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open `http://localhost:5173`

---

## How the AI works

1. PDF is uploaded and text is extracted
2. Text is sent to Gemini 2.5 Flash with a structured prompt
3. Gemini returns clauses in JSON — each with a title, simplified explanation, and risk level
4. A secondary keyword tagger checks for dangerous terms like `forfeit`, `irrevocable`, `terminate without notice`
5. Final result is saved to MongoDB and returned to the frontend

---

Built by [Dhriti B R](https://github.com/dhritibr) — CS undergraduate, RNS Institute of Technology
