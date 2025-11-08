const cron=require('node-cron')
const {subDays, startOfDay, endOfDay}=require('date-fns')
const ConnectionRequest = require('../models/connectionRequest')

// this job to send emails to the users to whom connection request is sent will run at 8 a.m in the morning everyday
cron.schedule("0 8 * * *",async ()=>{
    try {
        const yesterday=subDays(new Date(),1)
        const yesterdayStart=startOfDay(yesterday)
        const yesterdayEnd=endOfDay(yesterday)

        const pendingRequests=await ConnectionRequest.find({
            status:"interested",
            createdAt:{
                $gte:yesterdayStart,
                $lt:yesterdayEnd
            }
        }).populate("fromUserId toUserId")

        const listOfEmails=[...new Set(pendingRequests.map(req=>req.toUserId.emailId))]
        for(const email of listOfEmails)
        {
            // send email
        }
    } catch (error) {
        console.log("error at cronjob ",error)
    }
})