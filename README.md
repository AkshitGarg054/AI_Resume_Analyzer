# AI Resume Builder / Interview AI 🚀

A comprehensive MERN stack platform that empowers users to crack their dream jobs. By simply uploading their resume and providing a target job description, users get an AI-generated interview preparation report—including technical and behavioral questions, skill gap analysis, an optimized resume tailored to the job, and a structured preparation plan.

## 🌟 Key Features

* **Real-time Resume Parsing:** Securely upload and parse PDF resumes to extract user skills and experiences.
* **AI-Powered Interview Reports:** Uses Google's Gemini API to analyze the resume against the job description and output customized interview questions and feedback.
* **AI-Generated Optimized Resume:** Seamlessly rewrites the user's resume content to better align with the target job's Applicant Tracking System (ATS) requirements.
* **Dashboard & Analytics:** A personalized dashboard to track past interviews and revisit detailed analytics and preparation reports.
* **Library/History UI:** Easy access to all previously generated reports.
* **Robust Authentication:** Secure JWT-based user login and registration.

---

## 🛠️ Tech Stack

### Frontend
* **React 19 & Vite:** Lightning-fast rendering and build times.
* **React Router v7:** Modern and efficient client-side routing.
* **Axios:** Streamlined API requests.
* **Sass:** Modular, scalable styling architecture.

### Backend
* **Node.js & Express.js:** Scalable and robust API architecture.
* **MongoDB & Mongoose:** Flexible schema-based NoSQL database.
* **Google Gemini API (`@google/genai`):** State-of-the-art AI generation capabilities.
* **Multer & PDF-Parse:** Handling file uploads and extracting text from resumes.
* **Zod:** Strict runtime schema validation.
* **JWT & Bcryptjs:** Hardened authentication and password hashing.
* **Puppeteer:** Headless browser capabilities for advanced web scraping or document generation tasks.

---

## 📁 Folder Structure

### 🌐 Frontend (React + Vite)
```text
Frontend/
├── src/
│   ├── features/
│   │   ├── auth/            # Login, Register, Protected routes
│   │   └── interview/       # Dashboard, Library, Analytics, Interview API calls
│   ├── style/               # Global Sass styling
│   ├── App.jsx              # Main Component wrapper
│   ├── app.routes.jsx       # Routing Definitions
│   └── main.jsx             # Entry point
├── package.json
└── vite.config.js
```

### ⚙️ Backend (Node.js + Express)
```text
Backend/
├── src/
│   ├── config/              # DB & Environment configurations
│   ├── controllers/         # Request handling logic (Auth, Interview)
│   ├── middlewares/         # Global Error Handler, Auth verification
│   ├── models/              # Mongoose Schemas (User, InterviewReport)
│   ├── routes/              # API endpoints registration
│   ├── services/            # Core business logic (Gemini API logic)
│   └── app.js               # Express app configuration
├── server.js                # Server entry point
├── package.json
└── .env
```

---

## ⚡ Setup Instructions

Follow these step-by-step instructions to get the application running locally.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd AI_RESUME_BUILDER
```

### 2. Install Dependencies
Open two terminal windows.

**Backend Terminal:**
```bash
cd Backend
npm install
```

**Frontend Terminal:**
```bash
cd Frontend
npm install
```

### 3. Add Environment Variables
In the `Backend/` directory, create a `.env` file and add the following keys. 

```env
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secure_jwt_secret_key>
GOOGLE_GENAI_API_KEY=<your_google_gemini_api_key>
FRONTEND_URL=http://localhost:5173
```

### 4. Run Locally
**Backend Terminal:**
```bash
npm run dev
# Starts the Node server (typically on http://localhost:3000)
```

**Frontend Terminal:**
```bash
npm run dev
# Starts the Vite development server on http://localhost:5173
```

### 5. Build for Production

**Frontend:**
```bash
cd Frontend
npm run build
```

---

## 🔌 API Endpoints (Core)

Here is a brief overview of the main API functionality. Detailed architecture is in the Documentation.

* **`POST /api/interview`** - Upload resume (multipart/form-data) and Job Description to generate a report.
* **`GET /api/interview`** - Fetches all historically generated reports for the authenticated user.
* **`GET /api/interview/:id`** - Fetches details of a specific interview report.
* **`POST /api/auth/register`** - Registers a new user account.
* **`POST /api/auth/login`** - Authenticates user and assigns a JWT cookie.

---

## 🖼️ Screenshots

_[Add Screenshot 1: The Dashboard overview]_
_[Add Screenshot 2: The Interview AI Report showing technical questions and skill gaps]_
_[Add Screenshot 3: The Optimized ATS Resume View]_

---

## 🚀 Future Improvements

* **Stricter AI Output Formatting:** Enhanced prompt engineering to reliably guarantee JSON structures without Markdown artifacts.
* **Rate Limiting:** Implement API request limits using `express-rate-limit` to prevent Gemini API quota abuse.
* **Caching:** Cache generated AI reports in Redis to improve load time and save on API credits if exactly similar queries happen.
* **Improved Auth:** Integration with OAuth 2.0 (Google/GitHub login).
* **Export Options:** Allow users to export the optimized resumes directly to PDF or Word formats.

---
_Developed to simplify and superpower your interview prep process!_
