const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

/**
 * Converts Gemini API errors into clean, user-facing error messages.
 * Throws a plain Error with a friendly message so controllers can catch it.
 */
function handleGeminiError(error, context = "AI request") {
    const status = error?.status || error?.response?.status
    const message = error?.message || ""

    console.error(`[Gemini Error] ${context}:`, error)

    if (status === 429 || message.includes("429") || message.toLowerCase().includes("quota")) {
        const err = new Error("AI service quota exceeded. Please try again after some time.")
        err.statusCode = 429
        throw err
    }

    if (status === 503 || message.includes("503") || message.toLowerCase().includes("overloaded")) {
        const err = new Error("AI service is temporarily unavailable. Please try again later.")
        err.statusCode = 503
        throw err
    }

    const err = new Error("AI service failed to process your request. Please try again.")
    err.statusCode = 500
    throw err
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `You are a STRICT and CRITICAL technical interview evaluator. Your job is to honestly assess how well a candidate matches a job description. Do NOT inflate scores. Be realistic and discriminative.

CANDIDATE DATA:
Resume: ${resume}
Self Description: ${selfDescription}

TARGET JOB DESCRIPTION:
${jobDescription}

================================================================
MATCH SCORE RUBRIC (MUST FOLLOW EXACTLY)
================================================================

Calculate matchScore (0-100) using this WEIGHTED RUBRIC:

1. SKILLS MATCH (40% weight):
   - List every required/preferred skill from the JD
   - Check which ones the candidate has vs missing
   - Score = (matched skills / total required skills) * 40
   - Missing "required" skills penalize MORE than missing "preferred" skills

2. EXPERIENCE RELEVANCE (30% weight):
   - Does the candidate's experience level match? (junior vs senior)
   - Is their domain experience relevant? (e.g., fintech JD vs retail experience)
   - Score 0-30 based on how directly relevant their past roles are

3. PROJECT ALIGNMENT (20% weight):
   - Do the candidate's projects demonstrate the required competencies?
   - Have they built systems similar to what the job requires?
   - Score 0-20 based on project relevance

4. KEYWORDS / ATS MATCH (10% weight):
   - How many JD-specific keywords, tools, and certifications appear in the resume?
   - Score 0-10 based on keyword coverage

FINAL matchScore = sum of all 4 category scores (0-100)

================================================================
SCORE DISTRIBUTION (ENFORCE STRICTLY)
================================================================

90-100  Exceptional: Near-perfect alignment. Candidate meets almost ALL requirements. RARE.
75-89   Strong: Good match with minor gaps. Candidate meets most requirements.
50-74   Moderate: Noticeable skill/experience gaps. Candidate meets some requirements.
30-49   Weak: Major requirements missing. Significant upskilling needed.
0-29    Poor: Candidate is not suitable for this role.

CRITICAL RULES:
- Most candidates should score between 40-80. Scores above 85 should be RARE.
- Do NOT default to high scores. Start from 0 and ADD points based on evidence.
- If 3+ required skills are missing, score CANNOT exceed 70.
- If experience level is mismatched (e.g., 1yr exp for senior role), cap at 60.
- The matchScore MUST be CONSISTENT with the skillGaps you identify.
  (Many high-severity skill gaps = low score. Few low-severity gaps = higher score.)
- If the resume is vague or lacks detail, penalize — do not assume competence.

================================================================
OUTPUT FORMAT
================================================================

The response MUST be a valid JSON object strictly following this structure:
{
    "matchScore": number (0-100, calculated using rubric above),
    "title": "string (the job title from the JD)",
    "technicalQuestions": [ { "question": "string", "intention": "string", "answer": "string" } ],
    "behavioralQuestions": [ { "question": "string", "intention": "string", "answer": "string" } ],
    "skillGaps": [ { "skill": "string", "severity": "low|medium|high" } ],
    "preparationPlan": [ { "day": number, "focus": "string", "tasks": ["string", "string"] } ]
}

Generate 5-8 technical questions, 3-5 behavioral questions, and a 7-day preparation plan.
`
 
    let response
    try {
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        })
    } catch (error) {
        handleGeminiError(error, "generateInterviewReport")
    }

    try {
        return JSON.parse(response.text)
    } catch {
        const err = new Error("AI returned an unexpected response. Please try again.")
        err.statusCode = 500
        throw err
    }
}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `
You are an EXPERT RESUME OPTIMIZER, ATS SPECIALIST, and SENIOR TECHNICAL RECRUITER with 15+ years of experience rewriting resumes to maximize interview callback rates.

═══════════════════════════════════════════════════════════════════
CANDIDATE INPUT DATA
═══════════════════════════════════════════════════════════════════

ORIGINAL RESUME / PROFILE:
${resume || 'Not provided.'}

SELF DESCRIPTION:
${selfDescription || 'Not provided.'}

TARGET JOB DESCRIPTION:
${jobDescription}

═══════════════════════════════════════════════════════════════════
YOUR MISSION
═══════════════════════════════════════════════════════════════════

Create a FULLY REWRITTEN, JOB-TAILORED, ATS-OPTIMIZED resume that
maximizes the candidate's chances of passing ATS filters and getting
an interview for the TARGET JOB above.

═══════════════════════════════════════════════════════════════════
CRITICAL RULES (MUST FOLLOW)
═══════════════════════════════════════════════════════════════════

🚫 STRICTLY FORBIDDEN:
   • DO NOT copy-paste bullet points from the original resume
   • DO NOT keep the original wording — every bullet MUST be rewritten
   • DO NOT include skills/experience irrelevant to the target job
   • DO NOT use generic filler phrases like "responsible for", "worked on"
   • DO NOT use AI-sounding language ("leveraged", "spearheaded synergies")
   • DO NOT use backticks anywhere in the output — no markdown formatting,
     no code-style quoting. All text must be clean, plain, professional prose

✅ MANDATORY TRANSFORMATIONS:
   1. EXTRACT all key skills, tools, technologies, and qualifications
      from the JOB DESCRIPTION. These are your target keywords.
   2. REWRITE every experience bullet using the STAR format:
      → "[Action verb] + [what you did] + [technology/method] + [measurable result]"
      → Example: "Built real-time notification system using WebSockets and Redis, reducing delivery latency by 40% for 50K+ daily active users"
   3. INJECT job-description keywords naturally into:
      → Professional summary, skills section, experience bullets, project descriptions
   4. REFRAME existing projects/experience to emphasize relevance to the target role
   5. ADD logically inferable skills the candidate likely has based on their
      background but didn't explicitly mention (e.g., if they use React,
      they likely know JSX, component lifecycle, hooks)
   6. REMOVE or DE-EMPHASIZE experience/skills not relevant to the target job
   7. QUANTIFY results wherever possible (%, numbers, scale, time saved)

📏 LENGTH & DENSITY (STRICTLY ENFORCE):
   • The ENTIRE resume MUST fit within 1-2 A4 pages — never exceed 2 pages
   • Professional summary: MAX 3-4 concise lines, no long paragraphs
   • Each bullet point: MAX 1-2 lines (under 25 words ideally)
   • Experience: MAX 3-4 bullets per role (pick only the most impactful)
   • Projects: MAX 2-3 projects, each with 2-3 bullet points
   • Skills: single-line comma-separated lists per category, no descriptions
   • Education / Certifications: 1 line each, no elaboration
   • ELIMINATE all filler, repetition, and redundant information
   • Prefer dense, high-impact content over lengthy explanations
   • Use compact CSS: tight line-height (1.35-1.45), small margins between sections

═══════════════════════════════════════════════════════════════════
REQUIRED RESUME SECTIONS (in this order)
═══════════════════════════════════════════════════════════════════

1. **HEADER**: Full name, email, phone, LinkedIn, GitHub/portfolio (if available)
2. **PROFESSIONAL SUMMARY** (3-4 lines):
   → Written specifically for the target role
   → Must contain 4-6 keywords from the job description
   → Highlight years of experience + core expertise matching the JD
3. **TECHNICAL SKILLS**:
   → Group by category (Languages, Frameworks, Tools, Databases, Cloud, etc.)
   → Prioritize skills mentioned in the job description FIRST
   → Remove skills irrelevant to the target role
4. **PROFESSIONAL EXPERIENCE**:
   → Each role: Title, Company, Date range
   → 3-5 bullets per role, ALL rewritten with STAR format
   → Each bullet must connect to a JD requirement where possible
5. **PROJECTS** (if applicable):
   → Select 2-3 projects most relevant to the target job
   → Rewrite descriptions to highlight technologies/patterns from the JD
6. **EDUCATION**: Degree, institution, graduation year
7. **CERTIFICATIONS / ACHIEVEMENTS** (if applicable, keep brief)

═══════════════════════════════════════════════════════════════════
SELF-CHECK BEFORE RESPONDING
═══════════════════════════════════════════════════════════════════

Before generating output, verify:
☑ At least 70% of JD keywords appear naturally in the resume
☑ Every bullet is rewritten (not copied from original)
☑ Professional summary is specific to the target role
☑ Skills section prioritizes JD-relevant skills
☑ Resume fits within 1-2 pages when rendered as A4 PDF
☑ Content sounds human-written and natural

═══════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════

Return a JSON object with a single field "html" containing the
complete HTML resume with embedded CSS.

HTML/CSS REQUIREMENTS:
• Use a clean, professional single-column layout
• Font: system-ui or Arial, size 10-11pt for body, 14pt for name
• Colors: #1a1a1a for text, #2d2d2d for headings, #0066cc for links
• Section dividers: thin 1px #ddd horizontal rules
• Margins suitable for A4 printing (already handled by puppeteer)
• NO images, NO tables for layout, NO JavaScript
• Use semantic HTML: h1, h2, h3, p, ul, li
• Ensure text is selectable (critical for ATS parsing)
• Keep styling minimal and inline-friendly for maximum ATS compatibility
• Use compact spacing: line-height 1.4, margin-bottom 4-6px on bullets,
  section gaps of 10-14px — keep everything tight to fit 1-2 pages

LINKS (IMPORTANT):
• ALL URLs (GitHub, LinkedIn, Portfolio, email) must appear as PLAIN TEXT
  — do NOT wrap them in <a> tags, do NOT make them clickable
• Render links as simple readable text, e.g.:
  → github.com/username
  → linkedin.com/in/username
  → email@example.com
• Use <span> if styling is needed, never <a href>
• If the original resume contains links, keep the URLs but display as plain text
`

    let response
    try {
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        })
    } catch (error) {
        handleGeminiError(error, "generateResumePdf")
    }

    let jsonContent
    try {
        jsonContent = JSON.parse(response.text)
    } catch {
        const err = new Error("AI returned an unexpected response. Please try again.")
        err.statusCode = 500
        throw err
    }

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }