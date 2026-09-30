import { NextRequest, NextResponse } from "next/server";
import { checkRoleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const faqs = await prisma.fAQ.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { question, answer, category } = await req.json();
    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }

    const count = await prisma.fAQ.count();

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || "General",
        order: count,
      },
    });

    return NextResponse.json(faq);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    // Check if it is a reordering call or standard edit call
    if (Array.isArray(body)) {
      // Reordering multiple items
      const tx = body.map((item: { id: string; order: number }) =>
        prisma.fAQ.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      );
      await prisma.$transaction(tx);
      return NextResponse.json({ success: true });
    } else {
      // Standard edit
      const { id, question, answer, category, order } = body;
      const faq = await prisma.fAQ.update({
        where: { id },
        data: {
          question,
          answer,
          category,
          order,
        },
      });
      return NextResponse.json(faq);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await checkRoleApi("ADMIN");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await prisma.fAQ.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
