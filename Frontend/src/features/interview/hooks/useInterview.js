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

            if (response && response.html) {
                // Open a new window with the resume HTML and trigger print (Save as PDF)
                const printWindow = window.open('', '_blank', 'width=800,height=1100')
                
                const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ATS-Optimized Resume</title>
    <style>
        @media print {
            body { margin: 0; padding: 15mm; }
            .print-bar { display: none !important; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a2e; padding: 20px; background: #fff; }
        .print-bar { position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; z-index: 1000; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
        .print-bar button { background: #e1034d; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 600; }
        .print-bar button:hover { background: #c40242; }
        .print-bar span { font-size: 13px; opacity: 0.8; }
        .resume-content { margin-top: 60px; max-width: 800px; margin-left: auto; margin-right: auto; }
        h1 { font-size: 22pt; margin-bottom: 4pt; color: #16213e; }
        h2 { font-size: 13pt; margin-top: 14pt; margin-bottom: 6pt; color: #0f3460; border-bottom: 1.5px solid #0f3460; padding-bottom: 3pt; text-transform: uppercase; letter-spacing: 0.5pt; }
        h3 { font-size: 11pt; margin-bottom: 2pt; }
        p, li { font-size: 10pt; line-height: 1.6; }
        ul { padding-left: 18pt; }
        a { color: #0f3460; }
    </style>
</head>
<body>
    <div class="print-bar">
        <div>
            <strong>📄 ATS-Optimized Resume</strong>
            <span> — Click "Save as PDF" to download</span>
        </div>
        <button onclick="window.print()">⬇ Save as PDF</button>
    </div>
    <div class="resume-content">${response.html}</div>
</body>
</html>`

                printWindow.document.write(fullHtml)
                printWindow.document.close()
            } else {
                alert(response?.message || "Failed to generate resume. Please try again.")
            }
        }
        catch (error) {
            console.error("Resume PDF error:", error)
            alert(error?.response?.data?.message || error?.message || "Failed to generate resume. Please try again.")
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