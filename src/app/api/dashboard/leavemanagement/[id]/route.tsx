import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ================================
// GET Leave by ID (with user name)
// ================================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const leave = await prisma.leave.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!leave) {
      return NextResponse.json({ message: "Leave not found" }, { status: 404 });
    }

    return NextResponse.json(leave);
  } catch (err: any) {
    console.error("Error fetching leave:", err);
    return NextResponse.json(
      { message: "Failed to fetch leave", error: err.message },
      { status: 500 }
    );
  }
}

// ================================
// PUT: Update Leave 
// ================================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { userName, leaveType, startDate, endDate, status, reason } = body;

    if (!userName || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { message: "All fields are required, including reason." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { name: userName },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    //  Auto calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();

    if (diffTime < 0) {
      return NextResponse.json(
        { message: "End date cannot be before start date." },
        { status: 400 }
      );
    }

    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    //  Update leave record
    const updated = await prisma.leave.update({
      where: { id: Number(id) },
      data: {
        userId: user.id,
        leaveType,
        startDate: start,
        endDate: end,
        numberOfDays, // auto calculated
        status,
        reason,
      },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({
      message: "Leave updated successfully",
      leave: updated,
    });
  } catch (err: any) {
    console.error("Error updating leave:", err);
    return NextResponse.json(
      { message: "Failed to update leave", error: err.message },
      { status: 500 }
    );
  }
}
