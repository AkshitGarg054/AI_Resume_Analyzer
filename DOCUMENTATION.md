# 📘 Detailed Project Documentation

This document serves as an in-depth companion to the README, intended for developers aiming to maintain, scale, or understand the underlying mechanics of the AI Resume Builder platform.

## 🏗️ Architecture Overview

The system operates on a decoupled client-server architecture.
* **Frontend (React SPA):** Handled independently via Vite. It strictly acts as the presentation layer, holding client-side state, form data, and rendering complex AI feedback using client-side routing.
* **Backend (Express API):** A strictly stateless (session-less, cookie JWT based) JSON API. It is the gatekeeper of all heavy operations—specifically validating data, communicating with MongoDB, parsing uploaded PDFs, and making long-polling requests to the Google Gemini API.
* **Database (MongoDB):** Stores User credentials securely (via Bcrypt) and keeps a historical record of all generated Interview Reports.

---

## 🔄 Data Flow: The Interview Generation Process

The core functionality of the platform operates in the following pipeline:

1. **User Input:** User fills out the Job Description and uploads their Resume (PDF) on the Frontend UI.
2. **Multipart Request:** The frontend packages this as `multipart/form-data` and sends it to `POST /api/interview`.
3. **Parsing & Validation:** 
    * The backend `multer` middleware receives the PDF in memory or disk.
    * Error handling middleware verifies file size limits under 3MB and rejects unexpected fields.
    * `pdf-parse` extracts raw text from the Resume buffer.
4. **AI Processing:** 
    * The backend `interviewService` formulates structured prompts combining the Resume text and Job Description.
    * Requests are dispatched to the `Google Gemini API`.
5. **Data Structuring:** Gemini returns a stringified JSON schema containing arrays of behavioral/technical questions, skill gaps, preparation plans, and heavily optimized resume content.
6. **Persistence:** The parsed AI data is attached to the user's ID and stored as a document in the MongoDB `InterviewReport` collection.
7. **Client Delivery:** The backend responds with the completed Document metadata. The Frontend React router seamlessly redirects the user to the `/analytics/:id` route to comfortably read their results.

---

## 🧠 AI Integration

### How Prompts Are Structured
The core business logic involves heavy prompt-engineering to ensure Gemini acts reliably.
The system forces structural constraints by dictating instructions directly in the prompt such as:
> _"Analyze the candidate's resume against the Job Description. You must return your response strictly as a serialized JSON object without wrapping backticks."_

### What Responses Are Generated
The Gemini integration outputs specialized domains of information:
1. **`technicalQuestions`**: High-level capability checks specific to the JD's tech stack.
2. **`behavioralQuestions`**: Standard HR screening responses based on previous experience.
3. **`skillGaps`**: Identifying missing keywords to help ATS bypassing.
4. **`preparationPlan`**: A sequential timeline checklist to master the absent skills.
5. **`optimizedResume`**: A rewritten, more impactful summary and bullet-point section imitating high-performing ATS rules, ensuring action verbs and metrics are prioritized.

### Key Challenges
* **Formatting Instability:** LLMs occasionally wrap JSON in markdown blocks (e.g., ` ```json `). The backend strictly sanitizes the response string with `.replace(/```json/g, "")` before running `JSON.parse()`.
* **Latency:** Generative processes may take 5-15 seconds. The frontend implements thorough loading states, preventing duplicate clicks.

---

## 🧩 Key Components

### 1. Authentication System
* **Implementation:** `JWT` (JSON Web Tokens) stored securely inside `HttpOnly` browser cookies.
* **Benefit:** Prevents Cross-Site Scripting (XSS) from hijacking tokens since JavaScript cannot read `HttpOnly` cookies.
* **Flow:** `POST /login` verifies credentials, signs token -> Sets `res.cookie` -> Frontend `Protected` route wrapper verifies existence of current session before mounting components.

### 2. Interview Generation
* Managed in the frontend by React Context/State and `axios` handling multipart boundaries. 
* Managed in backend by `multer` -> `pdf-parse` -> `Google GenAI SDK` workflow.

### 3. Interview Dashboard / Analytics
* Utilizing `react-router` nested routing (`/dashboard`, `/analytics`, `/library`).
* A clean separation of concerns. `Analytics` reads a unified report model containing tabs of different generated information sections, ensuring deep-diving capability for users.

---

## 🛡️ Error Handling Strategy

### Backend Try-Catch Architecture
All asynchronous controllers wrap logic in `try-catch` blocks and pass the error to a centralized error middleware using `next(error)`.

```javascript
/* Global error middleware — app.js */
app.use((err, req, res, next) => {
    // Catch multer file sizes
    if (err.code === "LIMIT_FILE_SIZE") { ... }
    
    // Fallback standard errors
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, message: err.message });
})
```

### Frontend Error Display
* Global API Axios instance interceptors can catch 401 Unauthorized errors and force redirect users to `/login`.
* Specific API responses surface cleanly as toast notifications or inline red-text alerts informing the user of what went exactly wrong (e.g., "File is too large" or "Invalid Job Description").

---

## 🚀 Deployment Guide 

If deploying using an environment like Render, Heroku, or Vercel:

### 1. Backend (Node.js API)
* Create a Web Service instance.
* Set build command to `npm install`.
* Set start command to `npm start` (which hooks to `node server.js`).
* **Critical:** Input all Environment Variables from local `.env` securely into the cloud provider's Secret Management dashboard. 
* Provide the frontend deployment URL to the `FRONTEND_URL` environment variable for secure CORS communication.

### 2. Frontend (Vite App)
* Can be deployed to services like **Vercel** or **Netlify**.
* Set the build command to `npm run build`.
* Set the publish directory to `dist/`.
* You must configure rewrite rules inside your hosting provider so that all navigation requests redirect to `/index.html` (since this is a Single Page Application). 
* Any endpoints must utilize a configured `VITE_API_URL` to point to the live Backend Render URL instead of `localhost`.
