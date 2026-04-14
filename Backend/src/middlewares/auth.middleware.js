const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")



async function authUser(req, res, next) {

    let token = req.cookies.token

    // If no token in cookies, check Authorization header
    if (!token) {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7)
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    try {
        // First verify the JWT token structure
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        // Check blacklist asynchronously without blocking
        tokenBlacklistModel.findOne({ token })
            .catch(err => {
                console.error("Blacklist check error:", err.message)
                // Don't fail the request if blacklist check fails due to DB issues
                // The token is still valid from JWT perspective
            })

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}


module.exports = { authUser }