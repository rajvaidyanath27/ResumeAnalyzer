//request aya , middleware stops and check ki sb theek hai ki nahi then sends it to Controllers
//har protected route pe ye check hota hai ki user loggedin hai ki nahi then only respond kro

//JIS ROUTE KE BICH MAI AUTH USER MIDDLEWare laga do , wahi protected routes hai 

const jwt = require("jsonwebtoken")  //jwt verify knrne ke liye 
const tokenBlacklistModel = require("../models/blacklist.model") //logout wale blacklisted tokens ko check krne ke liye

async function authUser(req, res, next) {

    let token = req.cookies.token  //pehle cookie se token lene ki try kro


    if (!token) {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7)
        }
    }

    if (!token) {
        return res.status(401).json({   //agar user logged in hi nahi hai to error throw krdo unauthorised hai 
            message: "Token not provided."
        })
    }

    try {
       //token verify krega , original hai ki nahi , secret hai ki nahi 
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        tokenBlacklistModel.findOne({ token })
            .catch(err => {
                console.error("Blacklist check error:", err.message)
            })

        next()  //authentication successfull ab controller pe jao

    } catch (err) {

        return res.status(401).json({   //agar token expired wagera ho to return kro
            message: "Invalid token."
        })
    }

}


module.exports = { authUser }