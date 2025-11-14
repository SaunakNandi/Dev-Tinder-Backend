const express=require("express")
const {userAuth}=require("../middleware/auth");
const razorpay_instance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { membershipAmount } = require("../utils/constants");
const {validateWebhookSignature}=require("/razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");
const paymentRouter=express.Router();

paymentRouter.post("/payment/create",userAuth,async(req,res)=>{
    try {
        const {membershipType}=req.body;
        const {firstName,lastName,emailId}=req.user
        const order=await razorpay_instance.orders.create({
            amount : membershipAmount[membershipType]*100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType
            }
        });
        const payment=new Payment({
            userId:req.user._id,
            orderId:order.id,
            status:order.status,
            amount:order.amount,
            currency:order.currency,
            receipt:order.receipt,
            notes:order.notes
        })

        const savePayment=await payment.save();

        // Return bacck my payment details to frontend
        res.json({payment:savePayment.toJSON(),order,keyId:process.env.RAZORPAY_KEY_ID})
    } catch (error) {
        return res.status(500).json({msg:error.message})
    }
})

paymentRouter.post('/payment/webhook',async(req,res)=>{
    try {
        const webhookSignature=req.get["X-Razorpay-Signature"]
        const isWebhookValid= await validateWebhookSignature(JSON.stringify(req.body),webhookSignature,process.env.RAZORPAY_WEBHOOK_SECRET)
        if(!isWebhookValid)
            return res.status(400).json({message:"Webhook signature is invalid"});
        
        // from the documentation
        const paymentDetails=req.body.payload.payment.entity
        const payment=await Payment.findOne({orderId:paymentDetails.order_id})
        payment.status=paymentDetails.status;
        await payment.save()

        const user=await User.findOne({_id:payment.userId})
        user.isPremium=true;
        user.membershipType=payment.notes.membershipType;

        await user.save()
        // if(req.body.event==='payment.captured')
        // {

        // }
        // if(req.body.event==="payment.failed")
        // {

        // }
    } catch (error) {
        console.log("error at payent/webhook ",error)
    }
})

module.exports=paymentRouter;