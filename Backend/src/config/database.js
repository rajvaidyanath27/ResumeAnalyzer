//mongodb se directly baat nahi kr skte isilye we use mongoose which defines our structure
const mongoose = require("mongoose")



async function connectToDB() {
    //Networks kabhi bhi reliable nahi ho skte
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,  //5 sec mai mongodb server nhi mila to error
            socketTimeoutMS: 45000,  // connected hai but 45 sec se koi response nahi aya hai to disconnect krdo
            connectTimeoutMS: 10000,  // initial connection 10 sec mai nahi hua to fail
            retryWrites: true, //write fail ho to automatically retry
            retryReads: true  //read fail ho to automatically retry
        })

        console.log("Connected to Database")
    }
    catch (err) {
        console.error("Database connection error:", err.message)
        process.exit(1)  //kuch galat hua hai band kro, socho db connect nahi hua server phir bhi start hua to CRASH !!
    }
}

module.exports = connectToDB