import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
    try {
        await dbConnect()
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 })
        }

        const user = session.user as User
        const userId = new mongoose.Types.ObjectId(user._id)

        const result = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])

        if (!result || result.length === 0) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        // Filter out null entries pushed by preserveNullAndEmptyArrays when messages array is empty
        const messages = (result[0].messages || []).filter(Boolean)

        return Response.json({ success: true, message: messages }, { status: 200 })

    } catch (error) {
        console.error('An unexpected error occurred', error)
        return Response.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 })
    }
}
