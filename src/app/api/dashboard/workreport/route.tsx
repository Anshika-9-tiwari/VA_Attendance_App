
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// POST — Create  work report
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const report = await prisma.workReport.create({ data });
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating work report:", error);
    return NextResponse.json(
      { error: "Failed to create work report" },
      { status: 500 }
    );
  }
}

//  Get all work reports
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); 
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const preparedBy = url.searchParams.get("preparedBy");

    // If type=preparedBy → return distinct list
    if (type === "preparedBy") {
      const distinctPreparedBy = await prisma.workReport.findMany({
        where: {
          preparedBy: { not: null },
        },
        distinct: ["preparedBy"],
        select: { preparedBy: true },
        orderBy: { preparedBy: "asc" },
      });

      const names = distinctPreparedBy.map((r) => r.preparedBy).filter(Boolean);
      return NextResponse.json(names, { status: 200 });
    }

    // fetch reports
    const where: any = {};

    if (preparedBy) where.preparedBy = preparedBy;

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(`${from}T00:00:00Z`);
      if (to) where.date.lte = new Date(`${to}T23:59:59Z`);
    }

    const reports = await prisma.workReport.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("Error fetching work reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
