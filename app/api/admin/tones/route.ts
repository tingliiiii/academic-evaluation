// app/api/admin/tones/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// 認證中介
function validateAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const password = process.env.ADMIN_PASSWORD;
  return !!authHeader && !!password && authHeader === `Bearer ${password}`;
}

// 驗證 schema
const toneSchema = z.object({
  name: z.string().min(2).max(30),
  description: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});

// GET - 列出所有語氣
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const tones = await prisma.tone.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { success: true, data: tones },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tones" },
      { status: 500 }
    );
  }
}

// POST - 新增語氣
export async function POST(request: NextRequest) {
  try {
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = toneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const tone = await prisma.tone.create({
      data: {
        name: validation.data.name,
        description: validation.data.description,
        isActive: validation.data.isActive ?? true,
      },
    });

    return NextResponse.json(
      { success: true, data: tone },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tone" },
      { status: 500 }
    );
  }
}

// PATCH - 更新語氣
export async function PATCH(request: NextRequest) {
  try {
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    const validation = toneSchema.partial().safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const tone = await prisma.tone.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(
      { success: true, data: tone },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update tone" },
      { status: 500 }
    );
  }
}

// DELETE - 刪除語氣
export async function DELETE(request: NextRequest) {
  try {
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    await prisma.tone.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Tone deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete tone" },
      { status: 500 }
    );
  }
}