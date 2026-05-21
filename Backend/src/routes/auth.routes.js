const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter = Router()
     //public route
/**
 * @route
 * @description Register a new user
 * @access 
 */
authRouter.post("/register", authController.registerUserController)

      //public route     
/**
 * @route
 * @description login user with email and password
 * @access
 */
authRouter.post("/login", authController.loginUserController)

        
/**
 * @route 
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)


/**
 * @route 
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


module.exports = authRouter

//Logout public route kyu rakha hai ???

//agar logout protected hota aur token already expired hota user logout bhi nahi kr pata , public rkhne se expired token wale user bhi properly logout ho skte hai 