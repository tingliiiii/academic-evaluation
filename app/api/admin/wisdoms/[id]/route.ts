import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. 將 params 的型別改為 Promise<{ id: string }>
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 2. 使用 await 解開 params 取得 id
    const { id } = await params;
    const body = await request.json();
    const actualContent = body.content;

    if (!actualContent || typeof actualContent !== 'string') {
      return NextResponse.json({ success: false, error: '內容不能為空' }, { status: 400 });
    }

    const existing = await prisma.wisdom.findUnique({
      where: { content: actualContent.trim() },
    });
    
    if (existing && existing.id !== id) {
      return NextResponse.json({ success: false, error: '此形容詞已經存在囉！' }, { status: 400 });
    }

    const wisdom = await prisma.wisdom.update({
      where: { id },
      data: {
        content: actualContent.trim(),
      },
    });

    return NextResponse.json({ success: true, data: wisdom });
  } catch (error) {
    console.error('Error updating wisdom:', error);
    return NextResponse.json({ success: false, error: '更新形容詞失敗' }, { status: 500 });
  }
}

// 1. 同樣將 DELETE 的 params 型別改為 Promise<{ id: string }>
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 2. 使用 await 解開 params 取得 id
    const { id } = await params;
    await prisma.wisdom.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wisdom:', error);
    return NextResponse.json({ success: false, error: '刪除形容詞失敗' }, { status: 500 });
  }
}