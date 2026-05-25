import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

// Define verification request schema
const verifyCodeSchema = z.object({
    username: usernameValidation,
    code: z.string().length(6, 'Verification code must be exactly 6 digits')
})

export async function POST(request: Request){
    await dbConnect()

    try {
        const requestBody = await request.json()
        
        // Validate request body with Zod
        const result = verifyCodeSchema.safeParse(requestBody)
        
        if(!result.success){
            const errors = result.error.format()
            return Response.json(
                {
                    success: false,
                    message: errors.username?._errors?.[0] || 
                             errors.code?._errors?.[0] || 
                             'Invalid input parameters'
                },
                { status: 400 }
            )
        }

        const {username, code} = result.data
        const decodedUsername = decodeURIComponent(username)
        
        const user = await UserModel.findOne({username: decodedUsername})
        
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: 'User not found'
                },
                { status: 404 }
            )
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json(
                {
                    success: true,
                    message: 'Account got verified'
                }, 
                { status: 200 }
            )
        } else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: false,
                    message: 'Verification code has expired. Please sign up again to get a new code'
                }, 
                { status: 400 }
            )
        } else{
            return Response.json(
                {
                    success: false,
                    message: 'Incorrect code verification'
                }, 
                { status: 400 }
            )
        }

    } catch (error) {
        console.error('Error verifying user', error)

        return Response.json(
            {
                success: false,
                message: 'Error verifying user'
            },
            {
                status: 500
            }
        )
    }
}