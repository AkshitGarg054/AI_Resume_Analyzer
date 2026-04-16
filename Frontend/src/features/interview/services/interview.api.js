import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

/**
 * Extracts a clean, user-facing error message from an Axios error.
 */
function extractErrorMessage(err, fallback = "Something went wrong. Please try again.") {
    return err?.response?.data?.message || err?.message || fallback
}


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    if (resumeFile) formData.append("resume", resumeFile)

    try {
        const response = await api.post("/api/interview/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to generate interview report. Please try again."))
    }
}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to load interview report."))
    }
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview/")
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to load your interview history."))
    }
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
            responseType: "blob"
        })
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to generate resume PDF. Please try again."))
    }
}