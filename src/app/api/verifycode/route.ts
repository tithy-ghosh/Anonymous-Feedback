import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

const verifyCodeSchema = z.object({
    username: usernameValidation,
    code: z.string().length(6).regex(/^\d{6}$/)
})

export async function POST(request: Request) {
    try {
        await dbConnect()
        const body = await request.json()
        const result = verifyCodeSchema.safeParse(body)
        
        if (!result.success) {
            return Response.json({ success: false, message: 'Invalid input' }, { status: 400 })
        }

        const { username, code } = result.data
        const user = await UserModel.findOne({ username })
        
        if (!user) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        if (user.verifyCode !== code) {
            return Response.json({ success: false, message: 'Incorrect code' }, { status: 400 })
        }

        if (new Date(user.verifyCodeExpiry) < new Date()) {
            return Response.json({ success: false, message: 'Code expired' }, { status: 400 })
        }

        user.isVerified = true
        await user.save()

        return Response.json({ success: true, message: 'Verified' }, { status: 200 })

    } catch (error) {
        return Response.json({ success: false, message: 'Error' }, { status: 500 })
    }
}