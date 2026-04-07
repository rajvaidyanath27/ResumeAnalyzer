require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()

// Root route (IMPORTANT)
app.get("/", (req,res)=>{
    res.send("API Working")
})

// Production port fix
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})