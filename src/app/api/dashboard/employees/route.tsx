import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      address,
      department,
      position,
      status,
      dateOfJoining,
    } = body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        address,
        department,
        position,
        password: "default123",
        role: "EMPLOYEE",
        status,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
      },
    });

    return NextResponse.json(
      { message: "Employee added successfully", user },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error adding employee:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(users, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching employees:", err);
    return NextResponse.json(
      { message: "Failed to fetch employees", error: err.message },
      { status: 500 }
    );
  }
}
