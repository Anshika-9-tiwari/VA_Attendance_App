import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  context: any
) {
  const id = context?.params?.id;
  const body = await req.json();

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  context: any
) {
  const id = context?.params?.id;

  await prisma.user.update({
    where: { id: Number(id) },
    data: { status: "INACTIVE" },
  });

  return NextResponse.json({ message: "Employee disabled" });
}

