//ye file mera  authentication system hai , poora login/logout/register ka logic isi file mai hota hai

//this file uses 4 libraries  -->

//bcryptjs  - Password hash krna
//jwt       - Token banana or verify krna 
//userModel -  DB mai user dhundhana and create krne
//tokenBlacklistModel   - Logout pe token blacklsit krna


const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

//username, email, password lo req.body se
// Koi field missing? → 400 error
// Email/username pehle se hai? → 400 error
// Password hash karo (bcrypt)
// User DB mein save karo
// token banao
// Token cookie mein dalo
// Response bhejo
/**
 * @name registerUserController
 * @description 
 * @access 
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [ { username }, { email } ]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 
        })

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Register error:", error)
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        })
    }

}

// email, password lo req.body se
//  Email DB mein hai? → nahi toh 400 error
//  Password match karo (bcrypt.compare)
//  Match nahi? → 400 error
//  JWT token banao
//  Token cookie mein dalo
//  Response bhejo
/**
 * @name loginUserController
 * @description 
 * @access 
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 
        })
        
        res.status(200).json({
            message: "User loggedIn successfully.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({
            message: "Login failed",
            error: error.message
        })
    }
}

// Cookie se token nikalo
// Token blacklist DB mein save karo
// Cookie clear karo
// responsee bhejo

/**
 * @name logoutUserController
 * @description 
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token")

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        console.error("Logout error:", error)
        res.status(500).json({
            message: "Logout failed",
            error: error.message
        })
    }
}


// req.user.id lo (authMiddleware ne dala tha)
// DB se user dhundho
// User nahi mila? → 404 error
// User ki details bhejo
/**
 * @name getMeController
 * @description 
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Get me error:", error)
        res.status(500).json({
            message: "Failed to fetch user details",
            error: error.message
        })
    }
}



module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}