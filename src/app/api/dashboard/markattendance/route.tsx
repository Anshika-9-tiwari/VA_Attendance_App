import { NextResponse } from "next/server";
import { PrismaClient, AttendanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

// calculate work hours
function calculateWorkHours(checkIn: string, checkOut: string) {
  const [inHour, inMinute] = checkIn.split(":").map(Number);
  const [outHour, outMinute] = checkOut.split(":").map(Number);

  let totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // handle next-day checkout

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { formatted: `${hours}hr ${minutes}m`, hours };
}

// format time for display
function formatTime(date: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// determine attendance status
function determineStatus(hoursWorked: number): AttendanceStatus {
  if (hoursWorked >= 8) return AttendanceStatus.PRESENT;
  if (hoursWorked >= 4) return AttendanceStatus.HALF_DAY;
  return AttendanceStatus.ABSENT;
}

// create new attendance
export async function POST(req: Request) {
  try {
    const { userName, date, checkin, checkout, location, siteName } = await req.json();

    if (!userName || !date) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    // find user
    const user = await prisma.user.findFirst({ where: { name: userName } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // prepare times
    const checkInTime: Date | null = checkin ? new Date(`${date}T${checkin}:00`) : null;
    const checkOutTime: Date | null = checkout ? new Date(`${date}T${checkout}:00`) : null;

    // calculate work hours + status
    let workHr: string | null = null;
    let status: AttendanceStatus = AttendanceStatus.ABSENT;

    if (checkin && checkout) {
      const { formatted, hours } = calculateWorkHours(checkin, checkout);
      workHr = formatted;
      status = determineStatus(hours);
    } else if (checkin && !checkout) {
      status = AttendanceStatus.PRESENT;
    }

    // always create new record
    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        date: new Date(date),
        checkInTime,
        checkOutTime,
        workHr,
        location,
        siteName: location === "office" ? "" : siteName || "",
        status,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...attendance,
        checkInTime: formatTime(attendance.checkInTime),
        checkOutTime: formatTime(attendance.checkOutTime),
      },
    });
  } catch (error) {
    console.error("Error adding attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error adding attendance" },
      { status: 500 }
    );
  }
}

// fetch attendance list (unchanged)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const employee = searchParams.get("employee");
    const status = searchParams.get("status");

    const filters: any = {};

    if (date) {
      const parsedDate = new Date(date);
      filters.date = {
        gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
        lt: new Date(parsedDate.setHours(23, 59, 59, 999)),
      };
    }

    if (employee && employee.toLowerCase() !== "all") {
      filters.user = {
        name: {
          equals: employee,
          mode: "insensitive",
        },
      };
    }

    if (status && status.toLowerCase() !== "all") {
      filters.status = status.toUpperCase();
    }

    const isFilterApplied =
      !!date || (employee && employee.toLowerCase() !== "all") || (status && status.toLowerCase() !== "all");

    const attendanceList = await prisma.attendance.findMany({
      where: isFilterApplied ? filters : {},
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { id: "asc" },
    });

    const formattedData = attendanceList.map((item) => ({
      ...item,
      checkInTime: formatTime(item.checkInTime),
      checkOutTime: formatTime(item.checkOutTime),
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching data" },
      { status: 500 }
    );
  }
}
