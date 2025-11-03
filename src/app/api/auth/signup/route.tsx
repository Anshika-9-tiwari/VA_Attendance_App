import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email,  password } = await req.json();

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const user = await prisma.user.create({
      data: { name, email,  password: hashedPassword },
    });

    // generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ message: "Signup successful", token }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error in signup" }, { status: 500 });
  }
}
