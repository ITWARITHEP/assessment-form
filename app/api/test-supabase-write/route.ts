import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function testSupabase() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบ Supabase Environment Variables",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key);

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
      suggestion: "ทดสอบการเขียนข้อมูล",
      submitted_at: new Date().toISOString(),
    };

    console.log("TEST INSERT:", testData);

    const { data, error } = await supabase
      .from("assessment_results")
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error("SUPABASE WRITE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "เขียนข้อมูลไม่สำเร็จ",
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "เขียนข้อมูลเข้า Supabase สำเร็จ",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return testSupabase();
}

export async function POST() {
  return testSupabase();
}
