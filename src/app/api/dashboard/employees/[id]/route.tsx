import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE Employee
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting employee:", err);
    return NextResponse.json(
      { message: "Failed to delete employee", error: err.message },
      { status: 500 }
    );
  }
}

// UPDATE Employee
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        department: body.department,
        position: body.position,
        status: body.status,
        dateOfJoining: body.dateOfJoining
          ? new Date(body.dateOfJoining)
          : null,
      },
    });

    return NextResponse.json({
      message: "Employee updated successfully",
      user: updated,
    });
  } catch (err: any) {
    console.error("Error updating employee:", err);
    return NextResponse.json(
      { message: "Failed to update employee", error: err.message },
      { status: 500 }
    );
  }
}
