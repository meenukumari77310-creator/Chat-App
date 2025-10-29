import User from '../models/user.js'

export const getOtpTime = async (req,res,next)=>{
    const {token} = req.body

    try {
        const findUser = await User.findOne({'otp.token': token}).select('otp')

        if(!findUser){
            const error = new Error("Something went wrong.")
            error.statusCode = 400
            throw error
        }
        res
        .status(200)
        .json({
            message: 'success', 
            status: true, 
            sendTime: findUser.otp.sendTime,
        });


    } catch (error) {
        next(error)
    }

}