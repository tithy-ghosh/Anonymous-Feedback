import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
    try {
        await dbConnect()
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 })
        }

        const user = session.user as User

        let body: { acceptMessages?: unknown }
        try {
            body = await request.json()
        } catch {
            return Response.json({ success: false, message: 'Invalid request body' }, { status: 400 })
        }

        if (typeof body.acceptMessages !== 'boolean') {
            return Response.json({ success: false, message: 'acceptMessages must be a boolean' }, { status: 400 })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { isAcceptingMessages: body.acceptMessages },
            { returnDocument: 'after' }
        )

        if (!updatedUser) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        return Response.json({
            success: true,
            message: 'Message acceptance status updated successfully',
            isAcceptingMessages: updatedUser.isAcceptingMessages
        }, { status: 200 })

    } catch (error) {
        console.error('Failed to update accept messages status', error)
        return Response.json({ success: false, message: 'Failed to update message acceptance status' }, { status: 500 })
    }
}

export async function GET() {
    try {
        await dbConnect()
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 })
        }

        const user = session.user as User
        const foundUser = await UserModel.findById(user._id)

        if (!foundUser) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages
        }, { status: 200 })

    } catch (error) {
        console.error('Failed to get accept messages status', error)
        return Response.json({ success: false, message: 'Error getting acceptance status' }, { status: 500 })
    }
}
