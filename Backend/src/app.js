const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL || "https://resume-analyzer-pi-gold.vercel.app"

app.use(express.json())
app.use(cookieParser())

// Allow localhost for development, production URL for deployment
const allowedOrigins = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
]

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app