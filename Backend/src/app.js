const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL || "https://resume-analyzer-pi-gold.vercel.app"

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin:[
        FRONTEND_URL
    ],
    credentials:true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app