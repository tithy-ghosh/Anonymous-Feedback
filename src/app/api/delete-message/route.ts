import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
    try {
        await dbConnect()
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 })
        }

        const user = session.user as User

        let body: { messageId?: unknown }
        try {
            body = await request.json()
        } catch {
            return Response.json({ success: false, message: 'Invalid request body' }, { status: 400 })
        }

        const { messageId } = body

        if (!messageId || typeof messageId !== 'string') {
            return Response.json({ success: false, message: 'Message ID is required' }, { status: 400 })
        }

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return Response.json({ success: false, message: 'Invalid message ID' }, { status: 400 })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageId) } } },
            { new: true }
        )

        if (!updatedUser) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        return Response.json({ success: true, message: 'Message deleted' }, { status: 200 })

    } catch (error) {
        console.error('Error deleting message:', error)
        return Response.json({ success: false, message: 'Error deleting message' }, { status: 500 })
    }
}
