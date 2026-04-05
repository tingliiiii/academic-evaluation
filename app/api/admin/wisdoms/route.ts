// app/api/admin/wisdoms/route.ts
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
const wisdomSchema = z.object({
  content: z.string().min(2).max(20),
  priority: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET - 列出所有箴言
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const wisdoms = await prisma.wisdom.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { priority: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: wisdoms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching wisdoms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wisdoms" },
      { status: 500 }
    );
  }
}

// POST - 新增箴言
export async function POST(request: NextRequest) {
  try {
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = wisdomSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const wisdom = await prisma.wisdom.create({
      data: {
        content: validation.data.content,
        priority: validation.data.priority ?? 0,
        isActive: validation.data.isActive ?? true,
      },
    });

    return NextResponse.json(
      { success: true, data: wisdom },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating wisdom:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create wisdom" },
      { status: 500 }
    );
  }
}

// PATCH - 更新箴言
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

    const validation = wisdomSchema.partial().safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const wisdom = await prisma.wisdom.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(
      { success: true, data: wisdom },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating wisdom:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update wisdom" },
      { status: 500 }
    );
  }
}

// DELETE - 刪除箴言
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

    await prisma.wisdom.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Wisdom deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting wisdom:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete wisdom" },
      { status: 500 }
    );
  }
}