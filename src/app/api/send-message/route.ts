import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const sendMessageSchema = z.object({
    username: usernameValidation,
    content: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(300, 'Message must be under 300 characters')
        .trim()
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

        const result = sendMessageSchema.safeParse(body)
        if (!result.success) {
            const errors = result.error.format()
            return Response.json({
                success: false,
                message:
                    errors.username?._errors?.[0] ||
                    errors.content?._errors?.[0] ||
                    'Invalid input'
            }, { status: 400 })
        }

        const { username, content } = result.data

        const user = await UserModel.findOne({ username, isVerified: true })
        if (!user) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        if (!user.isAcceptingMessages) {
            return Response.json({ success: false, message: 'This user is not accepting messages' }, { status: 403 })
        }

        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json({ success: true, message: 'Message sent successfully' }, { status: 201 })

    } catch (error) {
        console.error('Error sending message', error)
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 })
    }
}
