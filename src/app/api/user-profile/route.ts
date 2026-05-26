import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return Response.json(
      { success: false, message: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const user = await UserModel.findOne({
      username,
      isVerified: true,
    }).select("username isAcceptingMessages");

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        username: user.username,
        isAcceptingMessages: user.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return Response.json(
      { success: false, message: "Error fetching user profile" },
      { status: 500 }
    );
  }
}
