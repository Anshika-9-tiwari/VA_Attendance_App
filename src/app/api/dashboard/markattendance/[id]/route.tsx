import { NextResponse } from "next/server";
import { PrismaClient, AttendanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Calculate Work Hours
// =====================================
function calculateWorkHours(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return { formatted: null, hours: 0 };

  const [inHour, inMinute] = checkIn.split(":").map(Number);
  const [outHour, outMinute] = checkOut.split(":").map(Number);

  let totalMinutes = outHour * 60 + outMinute - (inHour * 60 + inMinute);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // handle overnight shifts

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { formatted: `${hours}hr ${minutes}m`, hours };
}

// Determine Attendance Status
// =====================================
function determineStatus(hoursWorked: number): AttendanceStatus {
  if (hoursWorked >= 8) return "PRESENT";
  if (hoursWorked >= 4) return "HALF_DAY";
  return "ABSENT";
}

// Utility: Format Time
// =====================================
function formatTime(date: Date | null) {
  if (!date) return null;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// POST  Update Attendance
// =====================================
export async function POST(req: Request, context: any) {
  try {
    const attendanceId = parseInt(context?.params?.id);
    if (!attendanceId) {
      return NextResponse.json(
        { success: false, message: "Attendance ID is required" },
        { status: 400 }
      );
    }

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

    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Prepare time fields
    const checkInTime = checkin
      ? new Date(`${date}T${checkin}:00`)
      : existingAttendance.checkInTime;
    const checkOutTime = checkout
      ? new Date(`${date}T${checkout}:00`)
      : existingAttendance.checkOutTime;

    // Calculate hours & status
    let { formatted: workHr, hours } = calculateWorkHours(
      formatTime(checkInTime),
      formatTime(checkOutTime)
    );

    let status: AttendanceStatus = checkInTime && checkOutTime
      ? determineStatus(hours)
      : checkInTime
      ? "PRESENT"
      : existingAttendance.status;

    // Update attendance record
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
      message: "Attendance updated successfully",
      data: {
        ...updated,
        checkInTime: formatTime(updated.checkInTime),
        checkOutTime: formatTime(updated.checkOutTime),
      },
    });
  } catch (error: any) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error updating attendance", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE → Remove Attendance
// =====================================
export async function DELETE(req: Request, context: any) {
  try {
    const attendanceId = parseInt(context?.params?.id);
    if (!attendanceId) {
      return NextResponse.json(
        { success: false, message: "Attendance ID is required" },
        { status: 400 }
      );
    }

    const deletedRecord = await prisma.attendance.delete({
      where: { id: attendanceId },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance deleted successfully",
      data: deletedRecord,
    });
  } catch (error: any) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting attendance", error: error.message },
      { status: 500 }
    );
  }
}
