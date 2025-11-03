import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET Leave by ID 
// ================================
export async function GET(req: Request, context: any) {
  try {
    const id = context?.params?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Leave ID is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ success: true, data: leave });
  } catch (err: any) {
    console.error("Error fetching leave:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch leave", error: err.message },
      { status: 500 }
    );
  }
}

// ================================
// PUT: Update Leave
// ================================
export async function PUT(req: Request, context: any) {
  try {
    const id = context?.params?.id;
    if (!id) {
      return NextResponse.json(
        { message: "Leave ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { userName, leaveType, startDate, endDate, status, reason } = body;

    if (!userName || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { name: userName },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Auto-calculate number of leave days
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

    // Update leave record
    const updated = await prisma.leave.update({
      where: { id: Number(id) },
      data: {
        userId: user.id,
        leaveType,
        startDate: start,
        endDate: end,
        numberOfDays,
        status,
        reason,
      },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Leave updated successfully",
      data: updated,
    });
  } catch (err: any) {
    console.error("Error updating leave:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update leave", error: err.message },
      { status: 500 }
    );
  }
}
