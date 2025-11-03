import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); 
    const employee = searchParams.get("employee"); 

    if (!month) {
      return NextResponse.json({ success: false, message: "Month is required" }, { status: 400 });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // user filter
    const userFilter = employee && employee !== "all" ? { name: employee } : {};

    // Fetch all users
    const users = await prisma.user.findMany({
      where: {
        ...userFilter,
        status: "ACTIVE"
      },
    });

    const report = await Promise.all(
      users.map(async (user) => {
        // Fetch attendance data for that user in the selected month
        const attendance = await prisma.attendance.findMany({
          where: {
            userId: user.id,
            date: { gte: startDate, lt: endDate },
          },
        });

        // Count PRESENT, ABSENT.
        const present = attendance.filter((a) => a.status === "PRESENT").length;
        const absent = attendance.filter((a) => a.status === "ABSENT").length;

        // Fetch approved leaves in same month
        const leaves = await prisma.leave.findMany({
          where: {
            userId: user.id,
            status: "APPROVED",
            OR: [
              { startDate: { gte: startDate, lt: endDate } },
              { endDate: { gte: startDate, lt: endDate } },
            ],
          },
        });

        const totalLeaveDays = leaves.reduce(
          (sum, leave) => sum + leave.numberOfDays,
          0
        );

        const totalDays = present + absent + totalLeaveDays;
        const percentage = totalDays ? ((present / totalDays) * 100).toFixed(1) : "0";

        return {
          id: user.id,
          employee: user.name,
          present,
          absent,
          leave: totalLeaveDays,
          percentage,
        };
      })
    );

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report", error: error.message },
      { status: 500 }
    );
  }
}
