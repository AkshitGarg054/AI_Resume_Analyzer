require("dotenv").config();
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL
    ],
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)


/* 404 handler — unknown routes */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found.`
    })
})

/* Global error middleware — catches errors passed via next(err) */
app.use((err, req, res, next) => {
    console.error("[Global Error]", err)

    // Multer file size limit exceeded
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File is too large. Maximum allowed size is 3MB."
        })
    }

    // Multer unexpected field
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            success: false,
            message: "Unexpected file field in request."
        })
    }

    // JSON parse errors
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body."
        })
    }

    const statusCode = err.statusCode || err.status || 500
    const message = err.message || "An unexpected error occurred. Please try again."

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    })
})

/* Prevent crashes from unhandled promise rejections */
process.on("unhandledRejection", (reason) => {
    console.error("[Unhandled Rejection]", reason)
})

/* Prevent crashes from uncaught exceptions */
process.on("uncaughtException", (err) => {
    console.error("[Uncaught Exception]", err)
})

module.exports = app