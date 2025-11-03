import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// =============================
// POST: Apply new leave
// =============================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userName, leaveType, startDate, endDate, status, reason } = body;

    if (!userName || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { message: "All fields are required, including reason." },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Find user
    const user = await prisma.user.findFirst({
      where: { name: userName },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found. Please check the name." },
        { status: 404 }
      );
    }

    // Create leave record
    const leave = await prisma.leave.create({
      data: {
        leaveType,
        startDate: start,
        endDate: end,
        numberOfDays,
        reason,
        status: status || "PENDING",
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Leave applied successfully", leave },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error applying leave:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// =============================
// GET: Fetch with filters
// =============================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const employee = searchParams.get("employee");
    const status = searchParams.get("status");

    // Build dynamic filters
    const where: any = {};

    if (from && to) {
      where.AND = [
        { startDate: { gte: new Date(from) } },
        { endDate: { lte: new Date(to) } },
      ];
    }

    if (employee && employee !== "all") {
      where.user = { name: employee };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        user: { select: { name: true, department: true, position: true } },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(leaves, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json(
      { message: "Failed to fetch leaves", error: error.message },
      { status: 500 }
    );
  }
}

// =============================
// DELETE: a leave record
// =============================
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.leave.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Leave deleted" });
  } catch (error: any) {
    console.error("Error deleting leave:", error);
    return NextResponse.json(
      { message: "Error deleting leave", error: error.message },
      { status: 500 }
    );
  }
}
