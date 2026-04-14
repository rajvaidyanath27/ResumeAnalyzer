const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


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


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage();

    // Wrap the AI-generated HTML in a proper document with base styles
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a2e; padding: 0; }
        h1 { font-size: 22pt; margin-bottom: 4pt; color: #16213e; }
        h2 { font-size: 13pt; margin-top: 14pt; margin-bottom: 6pt; color: #0f3460; border-bottom: 1.5px solid #0f3460; padding-bottom: 3pt; text-transform: uppercase; letter-spacing: 0.5pt; }
        h3 { font-size: 11pt; margin-bottom: 2pt; }
        p, li { font-size: 10pt; line-height: 1.5; }
        ul { padding-left: 18pt; }
        a { color: #0f3460; }
    </style>
</head>
<body>${htmlContent}</body>
</html>`

    await page.setContent(fullHtml, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    console.log(`PDF generated successfully: ${pdfBuffer.length} bytes`)

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("Complete HTML content of the ATS-optimized resume. Must include inline CSS styles. No external stylesheets or links.")
    })

    const prompt = `You are an expert resume writer and ATS optimization specialist. Your job is to create a highly optimized, ATS-friendly resume that maximizes the candidate's chances of getting shortlisted.

CANDIDATE'S ORIGINAL RESUME:
${resume}

CANDIDATE'S SELF DESCRIPTION:
${selfDescription}

TARGET JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. **ATS Optimization Rules:**
   - Use standard section headings: "Professional Summary", "Work Experience", "Education", "Skills", "Projects", "Certifications" (only include sections that have data)
   - Use simple, clean formatting — NO tables, NO columns, NO images, NO icons, NO fancy layouts
   - Use standard fonts only (Arial, Helvetica, sans-serif)
   - Include relevant keywords from the job description naturally throughout the resume
   - Use bullet points (•) for listing achievements and responsibilities
   - Each bullet point should start with a strong action verb
   - Quantify achievements wherever possible (numbers, percentages, metrics)

2. **Content Tailoring Rules:**
   - Rewrite the professional summary to directly address the target job requirements
   - Reorder and prioritize skills that match the job description
   - Highlight experiences most relevant to the target role
   - Add relevant keywords from the JD into the skills section
   - Frame existing experience to align with job requirements
   - DO NOT invent fake experiences or skills — only rephrase and optimize what exists

3. **HTML Formatting Rules:**
   - Use INLINE CSS styles on each element (no <style> tag, no external CSS)
   - Use semantic HTML tags: h1, h2, p, ul, li, span, strong
   - Candidate name in <h1> with font-size:24px, color:#1a1a2e, margin-bottom:2px
   - Contact info (email, phone, linkedin) in a single line below name, font-size:10px, color:#555
   - Section headings in <h2> with font-size:14px, color:#1a1a2e, border-bottom:1.5px solid #2c3e50, padding-bottom:3px, margin-top:16px, margin-bottom:8px, text-transform:uppercase, letter-spacing:1px
   - Job titles in <strong> with company name and dates on the same line
   - Bullet points in <ul><li> with font-size:10.5px, line-height:1.6, color:#333, margin-bottom:3px
   - Skills section: list skills as comma-separated text grouped by category
   - Keep the entire resume to FIT within 1-2 A4 pages (this is critical!)
   - Body should have font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; max-width: 100%; padding: 0;

4. **Quality Standards:**
   - The resume must read naturally — NOT like AI generated
   - Use industry-specific terminology from the job description
   - Every bullet should demonstrate impact and value
   - Grammar must be perfect
   - Maintain a consistent, professional tone throughout

Generate the HTML now. It MUST be complete and ready to render as a PDF.`



    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }