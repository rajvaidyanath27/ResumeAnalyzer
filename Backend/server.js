require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

// Start server
async function startServer() {
    try {
        // Wait for database connection before starting server
        await connectToDB()

        // Root route (IMPORTANT)
        app.get("/", (req,res)=>{
            res.send("API Working")
        })

        // Production port fix
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error.message)
        process.exit(1)
    }
}

startServer()