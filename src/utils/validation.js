import validator from 'validator' 
export const validateSignUpData=(req)=>{
    const {firstName,lastName,emailId}=req.body
    console.log(emailId,validator.isEmail(emailId))
    if(!firstName)
    {
        throw new Error("Name is not valid")
    }
    else if(!validator.isEmail(emailId))
    {
        throw new Error("Email is not valid")
    } 
    return 
}