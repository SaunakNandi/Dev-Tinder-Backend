const express=require('express')
const connectDB=require('./config/database')
const cookieParser=require('cookie-parser')
const cors=require('cors')
const http=require("http")
const initializeSocket=require('./utils/socket')
require("dotenv").config()
require("./utils/cronjob")

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
const chatRouter = require('./routes/chat.route')

app.use('/',authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)
app.use("/",chatRouter)

const server=http.createServer(app)
initializeSocket(server)
connectDB().then(()=>{
    console.log("Database is connected XD")
    server.listen(process.env.PORT,()=>{
        console.log("Server is successfully listening on port 4000...")
    })
}).catch((err)=>{
    console.error("Database can't be connected ",err.message)
})

connectDB()