import User from '../models/user.js'
import jwt from "jsonwebtoken"
 export const userAuth=async(req,res,next)=>{
    // read the token from the req. cookies

    try {
        const {token}=req.cookies
        if(!token){
            throw new Error("Token not there")
        }
        const decodedObj= jwt.verify(token,"MY_SECRET_KEY")
        const {_id}=decodedObj
        const user=await User.findById(_id)
        console.log(user)
        if(!user)
            throw new Error("User not found")
        req.user=user
        next()
    } catch (error) {
        res.status(401).send("error at auth ",error.message)
    }
}