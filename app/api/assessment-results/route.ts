import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบค่า Supabase ใน .env.local",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key);

    const body = await request.json();

    console.log("📥 ASSESSMENT API:", body);

    const {
      evaluator_id,
      evaluator_name,
      evaluator_role,
      target_id,
      target_name,
      target_role,
      form_type,
      answers,
      total_score,
      max_score,
      suggestion,
      submitted_at,
    } = body;

    if (
      !evaluator_id ||
      !evaluator_name ||
      !evaluator_role ||
      !target_id ||
      !target_name ||
      !target_role ||
      !form_type
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูลการประเมินไม่ครบ",
          received: body,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("assessment_results")
      .upsert(
        {
          evaluator_id,
          evaluator_name,
          evaluator_role,
          target_id,
          target_name,
          target_role,
          form_type,
          answers: answers ?? {},
          total_score: Number(total_score ?? 0),
          max_score: Number(max_score ?? 0),
          suggestion: suggestion ?? "",
          submitted_at:
            submitted_at ??
            new Date().toISOString(),
        },
        {
          onConflict: "evaluator_id,target_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("❌ ASSESSMENT SUPABASE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "บันทึกผลประเมินไม่สำเร็จ",
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log("✅ ASSESSMENT SAVED:", data);

    return NextResponse.json({
      success: true,
      message: "บันทึกแบบประเมินสำเร็จ",
      data,
    });
  } catch (error) {
    console.error("❌ ASSESSMENT API ERROR:", error);

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