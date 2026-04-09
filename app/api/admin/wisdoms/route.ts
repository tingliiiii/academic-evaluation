import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const wisdoms = await prisma.wisdom.findMany({
      orderBy: { createdAt: 'desc' }, // 依照建立時間排序
    });
    return NextResponse.json({ success: true, data: wisdoms });
  } catch (error) {
    console.error('Error fetching wisdoms:', error);
    return NextResponse.json({ success: false, error: '讀取失敗' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actualContent = body.content;

    if (!actualContent || typeof actualContent !== 'string') {
      return NextResponse.json({ success: false, error: '形容詞內容為必填項目' }, { status: 400 });
    }

    // 檢查 content 是否重複 (因為 Schema 中 content 是 @unique)
    const existing = await prisma.wisdom.findUnique({
      where: { content: actualContent.trim() },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: '此形容詞已經存在囉！' }, { status: 400 });
    }

    // 新增形容詞，id 讓資料庫透過 cuid() 自動產生
    const wisdom = await prisma.wisdom.create({
      data: {
        content: actualContent.trim(),
      },
    });

    return NextResponse.json({ success: true, data: wisdom }, { status: 201 });
  } catch (error) {
    console.error('Error creating wisdom:', error);
    return NextResponse.json({ success: false, error: '新增形容詞失敗' }, { status: 500 });
  }
}