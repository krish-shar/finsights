import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { user } = session;

  try {
    const client = await clientPromise;
    const db = client.db("your_database_name"); // Replace with your actual database name

    const result = await db.collection("users").updateOne(
      { auth0Id: user.sub },
      {
        $set: {
          auth0Id: user.sub,
          email: user.email,
          name: user.name,
          lastLogin: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ message: "User data saved", result });
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json(
      { error: "Error saving user data" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { user } = session;

  try {
    const client = await clientPromise;
    const db = client.db("your_database_name"); // Replace with your actual database name

    const userData = await db
      .collection("users")
      .findOne({ auth0Id: user.sub });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Error fetching user data" },
      { status: 500 },
    );
  }
}
