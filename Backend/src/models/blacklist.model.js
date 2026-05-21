//ye file logout system ke liye blacklist token model bana rahi hai using mongoose 

//jb user logout krta hai tb uska token blacklist mai store kr dete hai , agar future mai wahi token kuch access kre to to usko invalid maana jay and user kuch acess nahi kr payga 
const mongoose = require('mongoose')


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    }
}, {
    timestamps: true
})

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema) //mongodb mai blacklist krke ek collection banata hai


module.exports = tokenBlacklistModel //exported for use in authentication