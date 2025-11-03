import { NextResponse } from "next/server";
import { PrismaClient, AttendanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Calculate work hours (and total numeric hours)
function calculateWorkHours(checkIn: string | null, checkOut: string | null) {
  // If either time is missing, return a nullable formatted string and zero hours
  if (!checkIn || !checkOut) {
    return { formatted: null, hours: 0 };
  }

  const [inHour, inMinute] = checkIn.split(":").map(Number);
  const [outHour, outMinute] = checkOut.split(":").map(Number);

  let totalMinutes = outHour * 60 + outMinute - (inHour * 60 + inMinute);
  if (totalMinutes < 0) totalMinutes += 24 * 60; 

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { formatted: `${hours}hr ${minutes}m`, hours };
}

// Determine status from hours worked
function determineStatus(hoursWorked: number): AttendanceStatus {
  if (hoursWorked >= 8) return "PRESENT";
  if (hoursWorked >= 4) return "HALF_DAY";
  return "ABSENT";
}

// Helper to format time safely
function formatTime(date: Date | null) {
  if (!date) return null;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// POST: Update or Create Attendance
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userName, date, checkin, checkout, location, siteName } =
      await req.json();

    if (!userName || !date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({ where: { name: userName } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find existing attendance
    const attendanceId = parseInt(params.id);
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Prepare updated data
    let checkInTime: Date | null = checkin
      ? new Date(`${date}T${checkin}:00`)
      : existingAttendance.checkInTime;
    let checkOutTime: Date | null = checkout
      ? new Date(`${date}T${checkout}:00`)
      : existingAttendance.checkOutTime;

    let workHr: string | null = existingAttendance.workHr;
    let status: AttendanceStatus = existingAttendance.status;

    // Recalculate work hours & status
    if (checkInTime && checkOutTime) {
      const inStr = formatTime(checkInTime);
      const outStr = formatTime(checkOutTime);
      const { formatted, hours } = calculateWorkHours(inStr, outStr);
      workHr = formatted;
      status = determineStatus(hours);
    } else if (checkInTime && !checkOutTime) {
      status = "PRESENT"; 
    }

    // Update record
    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkInTime,
        checkOutTime,
        workHr,
        location: location || existingAttendance.location,
        siteName: location === "site" ? siteName : "",
        status,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        checkInTime: formatTime(updated.checkInTime),
        checkOutTime: formatTime(updated.checkOutTime),
      },
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error updating attendance" },
      { status: 500 }
    );
  }
}

//  DELETE Attendance
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendanceId = parseInt(params.id);
    const deletedRecord = await prisma.attendance.delete({
      where: { id: attendanceId },
    });

    return NextResponse.json({ success: true, data: deletedRecord });
  } catch (error: any) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
