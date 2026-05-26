import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";

export async function POST(request: Request) {
    try {
        await dbConnect()

        const body = await request.json()
        const result = signUpSchema.safeParse(body)

        if (!result.success) {
            const errors = result.error.format()
            return Response.json({
                success: false,
                message:
                    errors.username?._errors?.[0] ||
                    errors.email?._errors?.[0] ||
                    errors.password?._errors?.[0] ||
                    'Invalid input'
            }, { status: 400 })
        }

        const { username, email, password } = result.data

        const existingVerifiedUsername = await UserModel.findOne({ username, isVerified: true })
        if (existingVerifiedUsername) {
            return Response.json({
                success: false,
                message: 'Username is already taken'
            }, { status: 400 })
        }

        // Generate OTP using crypto for security
        const verifyCode = String(
            crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000
        )
        const verifyCodeExpiry = new Date(Date.now() + 3600000)

        const existingUserByEmail = await UserModel.findOne({ email })
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: 'An account with this email already exists'
                }, { status: 400 })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry
                await existingUserByEmail.save()
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })
            await newUser.save()
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }

        return Response.json({
            success: true,
            message: 'User registered successfully. Please verify your email'
        }, { status: 201 })

    } catch (error) {
        console.error('Error registering user', error)
        return Response.json({
            success: false,
            message: 'Error registering user'
        }, { status: 500 })
    }
}
