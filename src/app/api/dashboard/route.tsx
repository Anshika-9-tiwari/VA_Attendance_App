import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // count total employees
    const totalEmployees = await prisma.user.count({
      where: { status: "ACTIVE" },
    });

    // Count total PRESENT *today*
    const totalPresent = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "PRESENT",
      },
    });

    // Count total APPROVED leaves *today*
    const totalLeave = await prisma.leave.count({
      where: {
        status: "APPROVED",
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
    });

    // Compute ABSENT 
    const totalAbsent = Math.max(totalEmployees - totalPresent - totalLeave, 0);

    // Return clean JSON
    return NextResponse.json({
      totalEmployees,
      totalPresent,
      totalLeave,
      totalAbsent,
      date: new Date().toISOString().split("T")[0],
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
