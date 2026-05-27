import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";

export async function POST(request: Request) {
    try {
        console.log("🔄 Sign-up request received");
        
        await dbConnect()
        console.log("✅ Database connected");

        const body = await request.json()
        console.log("📝 Body received:", { username: body.username, email: body.email });
        
        const result = signUpSchema.safeParse(body)

        if (!result.success) {
            const errors = result.error.format()
            console.log("❌ Validation failed:", errors);
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
        console.log("✅ Validation passed for:", username);

        const existingVerifiedUsername = await UserModel.findOne({ username, isVerified: true })
        if (existingVerifiedUsername) {
            console.log("❌ Username already taken:", username);
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

        console.log("🔑 Generated verification code:", verifyCode);

        const existingUserByEmail = await UserModel.findOne({ email })
        
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                console.log("❌ Email already verified:", email);
                return Response.json({
                    success: false,
                    message: 'An account with this email already exists'
                }, { status: 400 })
            } else {
                console.log("🔄 Updating existing unverified user:", email);
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry
                await existingUserByEmail.save()
                console.log("✅ Existing user updated");
            }
        } else {
            console.log("➕ Creating new user:", username);
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
            
            console.log("💾 Saving new user to database...");
            await newUser.save()
            console.log("✅ User saved successfully:", username);
        }

        console.log("📧 Sending verification email to:", email);
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        
        if (!emailResponse.success) {
            console.log("❌ Email sending failed:", emailResponse.message);
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }

        console.log("✅ Verification email sent successfully");
        return Response.json({
            success: true,
            message: 'User registered successfully. Please verify your email'
        }, { status: 201 })

    } catch (error) {
        console.error('❌ Error registering user:', error)
        return Response.json({
            success: false,
            message: 'Error registering user'
        }, { status: 500 })
    }
}