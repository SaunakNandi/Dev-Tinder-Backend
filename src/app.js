const express=require('express')
const connectDB=require('./config/database')
const cookieParser=require('cookie-parser')
const cors=require('cors')
require("dotenv").config()
const app=express() // instance of expressjs application

app.use(express.json());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(cookieParser())

const authRouter=require("./routes/auth.route")
const userRouter=require("./routes/user.route")
const requestRouter=require("./routes/request.route")
const profileRouter=require("./routes/profile.route")

app.use('/',authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)
connectDB().then(()=>{
    console.log("Database is connected XD")
    app.listen(process.env.PORT,()=>{
        console.log("Server is successfully listening on port 4000...")
    })
}).catch((err)=>{
    console.error("Database can't be connected ",err.message)
})

connectDB()