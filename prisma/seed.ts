// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 清空現有資料（開發環境）
  await prisma.evaluationWisdom.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.student.deleteMany();
  await prisma.wisdom.deleteMany();
  await prisma.tone.deleteMany();

  // 新增預設的形容詞
  const wisdoms = await Promise.all([
    prisma.wisdom.create({
      data: {
        content: "勤奮好學",
        priority: 1,
        isActive: true,
      },
    }),
    prisma.wisdom.create({
      data: {
        content: "主動積極",
        priority: 2,
        isActive: true,
      },
    }),
    prisma.wisdom.create({
      data: {
        content: "團隊合作",
        priority: 3,
        isActive: true,
      },
    }),
    prisma.wisdom.create({
      data: {
        content: "誠實守信",
        priority: 4,
        isActive: true,
      },
    }),
    prisma.wisdom.create({
      data: {
        content: "持之以恆",
        priority: 5,
        isActive: true,
      },
    }),
    prisma.wisdom.create({
      data: {
        content: "創新思維",
        priority: 6,
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ 已建立 ${wisdoms.length} 個形容詞`);

  // 新增預設的語氣
  const tones = await Promise.all([
    prisma.tone.create({
      data: {
        name: "鼓勵正面",
        description: "以鼓勵和正面的語氣讚揚學生的表現",
        isActive: true,
      },
    }),
    prisma.tone.create({
      data: {
        name: "中立客觀",
        description: "使用客觀、中立的語氣描述學生表現",
        isActive: true,
      },
    }),
    prisma.tone.create({
      data: {
        name: "溫暖親切",
        description: "以溫暖、親切的語氣給予建議",
        isActive: true,
      },
    }),
    prisma.tone.create({
      data: {
        name: "專業教育",
        description: "以專業教育學角度提供評價",
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ 已建立 ${tones.length} 個語氣預設`);

  // 新增示例學生資料（可選）
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: "小明",
      },
    }),
    prisma.student.create({
      data: {
        name: "小芳",
      },
    }),
  ]);

  console.log(`✓ 已建立 ${students.length} 個示例學生`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✓ Seed 完成！");
  })
  .catch(async (e) => {
    console.error("❌ Seed 失敗:", e);
    await prisma.$disconnect();
    process.exit(1);
  });