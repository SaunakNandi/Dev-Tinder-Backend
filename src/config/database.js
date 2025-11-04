const mongoose=require('mongoose')
const connectDB=async()=>{
    await mongoose.connect(
        "mongodb+srv://saunak:saunak@cluster0.wbc5e9p.mongodb.net/"
    )
}

module.exports=connectDB;