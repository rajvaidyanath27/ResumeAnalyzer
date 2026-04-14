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
                const printWindow = window.open('', '_blank', 'width=850,height=1100')
                
                const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ATS-Optimized Resume</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Crimson+Pro:wght@400;600&display=swap" rel="stylesheet">
    <style>
        @page { size: A4; margin: 0; }
        @media print {
            html, body { margin: 0; padding: 0; }
            .print-toolbar { display: none !important; }
            .resume-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; padding: 42px 48px !important; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { background: #e8e8ec; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #2d2d2d; -webkit-font-smoothing: antialiased; }

        /* ── Print Toolbar ── */
        .print-toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.25); }
        .print-toolbar__left { display: flex; align-items: center; gap: 12px; }
        .print-toolbar__icon { width: 36px; height: 36px; background: linear-gradient(135deg, #e1034d, #ff4081); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .print-toolbar__title { color: #fff; font-size: 15px; font-weight: 600; }
        .print-toolbar__subtitle { color: #94a3b8; font-size: 12px; margin-top: 1px; }
        .print-toolbar__actions { display: flex; gap: 10px; }
        .print-toolbar__btn { padding: 10px 22px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .print-toolbar__btn--primary { background: linear-gradient(135deg, #e1034d, #ff4081); color: #fff; box-shadow: 0 2px 12px rgba(225,3,77,0.3); }
        .print-toolbar__btn--primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(225,3,77,0.4); }
        .print-toolbar__btn--secondary { background: rgba(255,255,255,0.1); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.15); }
        .print-toolbar__btn--secondary:hover { background: rgba(255,255,255,0.15); }

        /* ── Resume Page ── */
        .resume-page { max-width: 794px; min-height: 1123px; margin: 80px auto 40px; background: #ffffff; padding: 48px 52px; box-shadow: 0 4px 40px rgba(0,0,0,0.12); border-radius: 2px; }

        /* ── Resume Typography ── */
        h1 { font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; line-height: 1.2; }
        h2 { font-size: 11.5px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; margin-top: 22px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #0f172a; }
        h3 { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 1px; }
        h4 { font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 4px; }
        p { font-size: 10.5px; line-height: 1.65; color: #374151; margin-bottom: 4px; }
        li { font-size: 10.5px; line-height: 1.65; color: #374151; margin-bottom: 3px; }
        ul { padding-left: 16px; list-style-type: disc; }
        ul li::marker { color: #94a3b8; }
        a { color: #2563eb; text-decoration: none; }
        strong { font-weight: 600; color: #1e293b; }
        em { font-style: italic; color: #64748b; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }

        /* ── Contact Info Row ── */
        .contact-row { font-size: 10px; color: #64748b; margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
        .contact-row a { color: #2563eb; font-weight: 500; }
        .separator { color: #cbd5e1; margin: 0 2px; }

        /* ── Section Spacing ── */
        div + h2, section + h2 { margin-top: 20px; }
        h2 + p, h2 + ul, h2 + div { margin-top: 2px; }
        h3 + p { margin-top: 1px; }

        /* ── Skills Tags ── */
        .skills-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .skill-tag { background: #f1f5f9; color: #334155; font-size: 9.5px; padding: 3px 10px; border-radius: 3px; font-weight: 500; border: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="print-toolbar">
        <div class="print-toolbar__left">
            <div class="print-toolbar__icon">📄</div>
            <div>
                <div class="print-toolbar__title">ATS-Optimized Resume</div>
                <div class="print-toolbar__subtitle">Click "Save as PDF" → Select "Save as PDF" as destination</div>
            </div>
        </div>
        <div class="print-toolbar__actions">
            <button class="print-toolbar__btn print-toolbar__btn--secondary" onclick="window.close()">✕ Close</button>
            <button class="print-toolbar__btn print-toolbar__btn--primary" onclick="window.print()">⬇ Save as PDF</button>
        </div>
    </div>
    <div class="resume-page">${response.html}</div>
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