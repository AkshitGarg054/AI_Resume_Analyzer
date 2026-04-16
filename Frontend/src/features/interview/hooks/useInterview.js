import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"


export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    /**
     * Generates an interview report. Returns { data, error }.
     */
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return { data: response.interviewReport, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    /**
     * Fetches a single interview report by ID. Returns { data, error }.
     */
    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return { data: response.interviewReport, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    /**
     * Fetches all interview reports for the current user. Returns { data, error }.
     */
    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return { data: response.interviewReports, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    /**
     * Downloads the resume PDF for a given report. Returns { error } on failure.
     */
    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            return { error: null }
        } catch (error) {
            return { error: error.message }
        } finally {
            setLoading(false)
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}