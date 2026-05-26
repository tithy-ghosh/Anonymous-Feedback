import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { usernameValidation } from "@/schemas/signUpSchema";

export async function POST(request: Request) {
    try {
        await dbConnect()

        let body: { username?: unknown }
        try {
            body = await request.json()
        } catch {
            return Response.json({ success: false, message: 'Invalid request body' }, { status: 400 })
        }

        const parsed = usernameValidation.safeParse(body.username)
        if (!parsed.success) {
            return Response.json({ success: false, message: 'Invalid username' }, { status: 400 })
        }

        const username = parsed.data
        const user = await UserModel.findOne({ username, isVerified: false })

        if (!user) {
            return Response.json({ success: false, message: 'User not found or already verified' }, { status: 404 })
        }

        const verifyCode = String(
            crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000
        )
        user.verifyCode = verifyCode
        user.verifyCodeExpiry = new Date(Date.now() + 3600000)
        await user.save()

        const emailResponse = await sendVerificationEmail(user.email, user.username, verifyCode)
        if (!emailResponse.success) {
            return Response.json({ success: false, message: emailResponse.message }, { status: 500 })
        }

        return Response.json({ success: true, message: 'Verification code resent successfully' }, { status: 200 })

    } catch (error) {
        console.error('Error resending code:', error)
        return Response.json({ success: false, message: 'Error resending verification code' }, { status: 500 })
    }
}
