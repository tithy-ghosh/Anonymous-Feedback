import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

const verifyCodeSchema = z.object({
    username: usernameValidation,
    code: z.string().length(6, 'Verification code must be exactly 6 digits').regex(/^\d{6}$/, 'Code must be 6 digits')
})

export async function POST(request: Request) {
    try {
        await dbConnect()

        let body: unknown
        try {
            body = await request.json()
        } catch {
            return Response.json({ success: false, message: 'Invalid request body' }, { status: 400 })
        }

        const result = verifyCodeSchema.safeParse(body)
        if (!result.success) {
            const errors = result.error.format()
            return Response.json({
                success: false,
                message:
                    errors.username?._errors?.[0] ||
                    errors.code?._errors?.[0] ||
                    'Invalid input parameters'
            }, { status: 400 })
        }

        const { username, code } = result.data

        const user = await UserModel.findOne({ username })
        if (!user) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            }, { status: 400 })
        }

        if (!isCodeValid) {
            return Response.json({ success: false, message: 'Incorrect verification code' }, { status: 400 })
        }

        user.isVerified = true
        await user.save()

        return Response.json({ success: true, message: 'Account verified successfully' }, { status: 200 })

    } catch (error) {
        console.error('Error verifying user', error)
        return Response.json({ success: false, message: 'Error verifying user' }, { status: 500 })
    }
}
