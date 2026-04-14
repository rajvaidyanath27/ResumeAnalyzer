import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useState } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReports
    }

    const [downloadingPdf, setDownloadingPdf] = useState(false)

    const getResumePdf = async (interviewReportId) => {
        setDownloadingPdf(true)
        try {
            const response = await generateResumePdf({ interviewReportId })

            // Validate that we got an actual PDF blob, not an error JSON
            if (response && response.size > 0) {
                // Check if it's actually a PDF and not an error response
                if (response.type && response.type.includes('json')) {
                    const text = await response.text()
                    const errorData = JSON.parse(text)
                    alert(errorData.message || "Failed to generate resume PDF")
                    return
                }

                // Force the correct MIME type so browser treats it as PDF
                const pdfBlob = new Blob([response], { type: "application/pdf" })
                const url = window.URL.createObjectURL(pdfBlob)
                const link = document.createElement("a")
                link.href = url
                link.download = `resume_${interviewReportId}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } else {
                alert("Failed to generate resume. Please try again.")
            }
        }
        catch (error) {
            console.error("Resume PDF error:", error)
            alert(error?.message || "Failed to generate resume PDF. Please try again.")
        } finally {
            setDownloadingPdf(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return; // ✅ Don't fetch if not logged in

        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, downloadingPdf }

}