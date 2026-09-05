import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function testSupabase() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          step: "environment",
          message:
            "ไม่พบ NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    const testData = {
      evaluator_id: "TEST-EVALUATOR",
      evaluator_name: "ทดสอบระบบ",
      evaluator_role: "test",
      target_id: `TEST-${Date.now()}`,
      target_name: "ผู้ถูกประเมินทดสอบ",
      target_role: "test",
      form_type: "test",
      answers: {
        "1.1": 5,
        "1.2": 4,
      },
      total_score: 9,
      max_score: 10,
      suggestion: "ทดสอบ Supabase",
      submitted_at: new Date().toISOString(),
    };

    console.log("📤 TEST INSERT:", testData);

    const { data, error } = await supabase
      .from("assessment_results")
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error(
        "❌ SUPABASE WRITE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          step: "supabase-write",
          message: "เขียนข้อมูลไม่สำเร็จ",
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ TEST INSERT SUCCESS:",
      data
    );

    return NextResponse.json({
      success: true,
      step: "supabase-write",
      message: "เขียนข้อมูลเข้า Supabase สำเร็จ",
      data,
    });
  } catch (error) {
    console.error(
      "❌ SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        step: "server",
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

/*
 * เปิด URL นี้ใน Browser ได้เลย
 */
export async function GET() {
  return testSupabase();
}

/*
 * รองรับการเรียกจาก fetch POST ด้วย
 */
export async function POST() {
  return testSupabase();
}