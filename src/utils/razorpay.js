const Razorpay=require("razorpay");

var razorpay_instance=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

module.exports=razorpay_instance