//sirf interview ka kaam

//jb interviewer "GENERATE MY STRATEGY"  saara kaam yahi se hot hai


const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

//Report banao
async function generateInterViewReportController(req, res) {

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()//pdf file ko pdhke uska text nikalna
    const { selfDescription, jobDescription } = req.body

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

//Ek report lao
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


//saari reports lao
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


//Resume pdf banao
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const resumeHtml = await generateResumePdf({ resume, jobDescription, selfDescription })

        if (!resumeHtml) {
            return res.status(500).json({
                message: "Failed to generate resume. Please try again."
            })
        }

        res.status(200).json({
            message: "Resume generated successfully.",
            html: resumeHtml
        })
    } catch (error) {
        console.error("Resume generation error:", error.message)
        res.status(500).json({
            message: "Failed to generate resume: " + (error.message || "Unknown error")
        })
    }
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }

// User clicks Generate
//       ↓
// generateInterViewReportController
//   → PDF text nikalo (pdf-parse)
//   → AI ko bhejo (ai.service.js)
//   → Result DB mein save karo
//   → Response bhejo
//       ↓
// Dashboard pe report dikhti hai
// (getAllInterviewReports — sirf title, score, date)
//       ↓
// User report click karta hai
// (getInterviewReportById — poora data)
//       ↓
// User PDF download karta hai
// (generateResumePdf → HTML → frontend PDF banata hai) 
