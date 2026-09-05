"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { employees, headquarters } from "@/data/employees";
import { canEvaluate } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";

/* =========================================================
   แบบประเมินผู้อำนวยการ
========================================================= */

const directorQuestions = [
  {
    section: "1. ด้านความรู้ความสามารถในหน้าที่",
    items: [
      {
        id: "1.1",
        text: "มีความรู้ความสามารถเหมาะสมในบทบาทหน้าที่ ที่รับผิดชอบ",
      },
      {
        id: "1.2",
        text: "มีความรู้ความสามารถในการวิเคราะห์ปัญหา และการหาวิธีแก้ไขปรับปรุงพัฒนาระบบงานงาน",
      },
    ],
  },
  {
    section: "2. ด้านการสื่อสารและการสอนงาน",
    items: [
      {
        id: "2.1",
        text: "มีการสอนงานตามมาตรฐานการปฏิบัติงานในฝ่าย",
      },
      {
        id: "2.2",
        text: "สามารถสอนงานให้สาขามีความรู้ความเข้าใจและปฏิบัติได้ถูกต้องตามมาตรฐานการปฏิบัติงานมากขึ้น",
      },
      {
        id: "2.3",
        text: "มีการตรวจติดตามงานอย่างสม่ำเสมอ พร้อมให้ข้อเสนอแนะและแนวทางในการแก้ไขปรับปรุง",
      },
      {
        id: "2.4",
        text: "สามารถสื่อสารติดต่อประสานงานกับบุคคลได้ทุกระดับอย่างเหมาะสม เพื่อผลสัมฤทธิ์ของงาน (การสื่อสาร 360 องศา)",
      },
      {
        id: "2.5",
        text: "มีการสื่อสารหรือสอนงานด้วยวิธีการ ที่เหมาะสม และน้ำเสียง วาจาที่สุภาพต่อผู้รับฟัง",
      },
      {
        id: "2.6",
        text: "มีจิตมุ่งบริการพร้อมให้ความช่วยเหลือสนับสนุนสาขาด้วยความเต็มใจ",
      },
      {
        id: "2.7",
        text: "ยินดีรับฟังความคิดเห็นและข้อเสนอแนะของสาขาเพื่อการปรับปรุงพัฒนา",
      },
    ],
  },
  {
    section: "3. ด้านผลลัพธ์งานในหน้าที่",
    items: [
      {
        id: "3.1",
        text: "สามารถปฏิบัติงานได้ตามบทบาทหน้าที่ที่กำหนด",
      },
      {
        id: "3.2",
        text: "สามารถทำงานได้บรรลุผลตามเป้าหมายตัวชี้วัดของฝ่าย",
      },
    ],
  },
];

/* =========================================================
   แบบประเมินผู้จัดการเขต
========================================================= */

const areaManagerQuestions = [
  {
    section: "1. ด้านความรู้ความสามารถในหน้าที่",
    items: [
      {
        id: "1.1",
        text: "มีความรู้ความสามารถในบทบาทหน้าที่ที่รับผิดชอบ",
      },
      {
        id: "1.2",
        text: "มีความรู้ความสามารถในการวิเคราะห์ปัญหา และการหาวิธีแก้ไขปรับปรุงพัฒนางานในเขตเพื่อให้การบริหารงานบรรลุเป้าหมาย กำไร 15.2 ได้",
      },
    ],
  },
  {
    section: "2. ด้านการสื่อสารและการสอนงาน",
    items: [
      {
        id: "2.1",
        text: "สามารถสอนงานและโค้ชทีมงานสาขาได้",
      },
      {
        id: "2.2",
        text: "สามารถให้คำปรึกษา ให้คำแนะนำสาขาได้อย่างถูกต้อง",
      },
      {
        id: "2.3",
        text: "มีการตรวจติดตามงานกับสาขาอย่างสม่ำเสมอ",
      },
      {
        id: "2.4",
        text: "สามารถสื่อสารติดต่อประสานงานกับบุคคลได้ทุกระดับอย่างเหมาะสม เพื่อผลสัมฤทธิ์ของงาน(การสื่อสาร 360 องศา)",
      },
      {
        id: "2.5",
        text: "มีจิตมุ่งบริการพร้อมให้ความช่วยเหลือสนับสนุนสาขาด้วยความเต็มใจ",
      },
      {
        id: "2.6",
        text: "ยินดีรับฟังความคิดเห็นและข้อเสนอแนะของสาขาเพื่อการปรับปรุงพัฒนา",
      },
    ],
  },
  {
    section: "3. ด้านผลลัพธ์งานในหน้าที่",
    items: [
      {
        id: "3.1",
        text: "สามารถปฏิบัติงานได้ตามบทบาทหน้าที่  ที่กำหนด",
      },
      {
        id: "3.2",
        text: "สามารถพัฒนาทีมงานในเขตให้มีพลัง มีไฟ และมีการเติบโตได้",
      },
      {
        id: "3.3",
        text: "สามารถบริหารจัดการงานสาขาในเขตให้ได้ผลลัพธ์ตามแผนงบประมาณกำไร 15.2",
      },
    ],
  },
];

/* =========================================================
   แบบประเมินผู้จัดการสาขา
========================================================= */

const branchManagerQuestions = [
  {
    section: "1. ด้านความรู้ความสามารถในหน้าที่",
    items: [
      {
        id: "1.1",
        text: "มีความรู้ความสามารถเหมาะสมในบทบาทหน้าที่ที่รับผิดชอบ",
      },
      {
        id: "1.2",
        text: "มีความรู้ความสามารถในการวิเคราะห์ปัญหา และการหาวิธีแก้ไขปรับปรุงพัฒนาเพื่อให้การบริหารงานบรรลุเป้าหมาย กำไร 15.2 ได้",
      },
    ],
  },
  {
    section: "2. ด้านการสื่อสารและการสอนงาน",
    items: [
      {
        id: "2.1",
        text: "สามารถสอนงานและโค้ชทีมงานได้",
      },
      {
        id: "2.2",
        text: "สามารถให้คำปรึกษา ให้คำแนะนำทีมงานได้อย่างถูกต้อง",
      },
      {
        id: "2.3",
        text: "มีการตรวจติดตามงานในสาขาอย่างสม่ำเสมอ",
      },
      {
        id: "2.4",
        text: "สามารถสื่อสารติดต่อประสานงานกับบุคคลในองค์กรได้ทุกระดับอย่างเหมาะสม เพื่อผลสัมฤทธิ์ของงาน(การสื่อสาร 360 องศา)",
      },
      {
        id: "2.5",
        text: "มีจิตมุ่งบริการพร้อมให้ความช่วยเหลือสนับสนุนทีมงานด้วยความเต็มใจ",
      },
      {
        id: "2.6",
        text: "ยินดีรับฟังความคิดเห็นและข้อเสนอแนะของทีมงานเพื่อการปรับปรุงพัฒนา",
      },
    ],
  },
  {
    section: "3. ด้านผลลัพธ์งานในหน้าที่",
    items: [
      {
        id: "3.1",
        text: "สามารถปฏิบัติงานได้ตามบทบาทหน้าที่ที่กำหนด",
      },
      {
        id: "3.2",
        text: "สามารถพัฒนาทีมงานและสร้างพลังทีมในสาขาให้มีกำลังใจ มีไฟ ในการปฏิบัติงานได้",
      },
      {
        id: "3.3",
        text: "สามารถบริหารจัดการงานในสาขาให้ได้ผลลัพธ์ตามแผนงบประมาณกำไร 15.2",
      },
    ],
  },
];

/* =========================================================
   แบบประเมินฝ่าย
========================================================= */

const departmentQuestions = [
  {
    section: "1. ด้านความรู้ความสามารถในหน้าที่",
    items: [
      {
        id: "1.1",
        text: "มีความรู้ความสามารถเหมาะสมในบทบาทหน้าที่ ที่รับผิดชอบ",
      },
      {
        id: "1.2",
        text: "มีความรู้ความสามารถในการช่วยสาขาวิเคราะห์ปัญหา และแนะนำแนวทางในการแก้ไขปัญหาให้กับสาขาได้",
      },
    ],
  },
  {
    section: "2. ด้านการสื่อสารและการสอนงาน",
    items: [
      {
        id: "2.1",
        text: "มีการสอนงานตามมาตรฐานการปฏิบัติงานในฝ่าย",
      },
      {
        id: "2.2",
        text: "สามารถสอนงานให้สาขามีความรู้ความเข้าใจและปฏิบัติได้ถูกต้องตามมาตรฐานการปฏิบัติงานมากขึ้น",
      },
      {
        id: "2.3",
        text: "มีการสื่อสารหรือสอนงานด้วยวิธีการ ที่เหมาะสม และน้ำเสียง วาจาที่สุภาพต่อผู้รับฟัง",
      },
      {
        id: "2.4",
        text: "มีการตรวจติดตามงานพร้อมให้คำแนะนำอย่างสม่ำเสมอ",
      },
      {
        id: "2.5",
        text: "มีจิตมุ่งบริการพร้อมให้ความช่วยเหลือสนับสนุนสาขาด้วยความเต็มใจ",
      },
      {
        id: "2.6",
        text: "ยินดีรับฟังความคิดเห็นและข้อเสนอแนะของสาขาเพื่อการปรับปรุงพัฒนา",
      },
    ],
  },
  {
    section: "3. ด้านผลลัพธ์งานในหน้าที่",
    items: [
      {
        id: "3.1",
        text: "สามารถสอนงานในฝ่ายได้ถูกต้องตามมาตรฐานการปฏิบัติงาน",
      },
      {
        id: "3.2",
        text: "จากการสอนงานสาขาสามารถปฏิบัติงานได้ถูกต้องตามมาตรฐานมากขึ้น",
      },
      {
        id: "3.3",
        text: "จากการช่วยเหลือสนับสนุน ทำให้สาขาดำเนินไปได้ถูกต้อง ราบรื่น และบรรลุตามเป้าหมายของฝ่าย",
      },
    ],
  },
];

/* =========================================================
   คะแนน
========================================================= */

const scores = [
  {
    value: 1,
    label: "ต้องปรับปรุง",
  },
  {
    value: 2,
    label: "พอใช้",
  },
  {
    value: 3,
    label: "ปานกลาง",
  },
  {
    value: 4,
    label: "ดี",
  },
  {
    value: 5,
    label: "ดีมาก",
  },
];

type QuestionItem = {
  id: string;
  text: string;
};

type QuestionSection = {
  section: string;
  items: QuestionItem[];
};

type AssessmentResult = {
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  targetId: string;
  targetName: string;
  targetRole: string;
  formType: string;
  answers: Record<string, number>;
  totalScore: number;
  maxScore: number;
  suggestion: string;
  submittedAt: string;
};

export default function EvaluationPage() {
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const target = employees.find(
    (employee) => employee.id === id
  );

  const isHeadquarters = id.startsWith("hq-");
  const isAreaManager = target?.role === "area_manager";
  const isBranchManager = target?.role === "branch_manager";

  const evaluationQuestions: QuestionSection[] =
    isHeadquarters
      ? departmentQuestions
      : isAreaManager
        ? areaManagerQuestions
        : isBranchManager
          ? branchManagerQuestions
          : directorQuestions;

  const formTitle = isHeadquarters
    ? "แบบประเมินฝ่าย"
    : isAreaManager
      ? "แบบประเมินผู้จัดการเขต"
      : isBranchManager
        ? "แบบประเมินผู้จัดการสาขา"
        : "แบบประเมินผู้อำนวยการ";

  const formIcon = isHeadquarters
    ? "🏛️"
    : isAreaManager
      ? "🌎"
      : isBranchManager
        ? "🏪"
        : "🏢";

  const headquartersTarget = isHeadquarters
    ? headquarters[
        Number(id.replace("hq-", "")) - 1
      ]
    : null;

  const targetName =
    headquartersTarget ||
    target?.name ||
    "";

  const targetRole = isHeadquarters
    ? "ฝ่ายสำนักงานใหญ่"
    : target?.roleName || "";

  const [evaluatorId, setEvaluatorId] =
    useState<string | null>(null);

  const [checkingPermission, setCheckingPermission] =
    useState(true);

  const [checkingPreviousResult, setCheckingPreviousResult] =
    useState(true);

  const [answers, setAnswers] =
    useState<Record<string, number>>({});

  const [suggestion, setSuggestion] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /*
   * =========================================================
   * ตรวจสิทธิ์ + ตรวจว่ามีผลประเมินใน Supabase แล้วหรือยัง
   * =========================================================
   */

  useEffect(() => {
    if (!id) return;

    let alive = true;

    async function checkAccess() {
      try {
        const savedUserId =
          localStorage.getItem(
            "assessment_user"
          );

        if (!savedUserId) {
          alert(
            "กรุณาเข้าสู่ระบบก่อนประเมิน"
          );

          window.location.href = "/";
          return;
        }

        const currentEvaluator =
          employees.find(
            (employee) =>
              employee.id ===
              savedUserId
          );

        if (!currentEvaluator) {
          localStorage.removeItem(
            "assessment_user"
          );

          alert(
            "ไม่พบข้อมูลผู้ประเมิน"
          );

          window.location.href = "/";
          return;
        }

        if (
          !canEvaluate(
            currentEvaluator.id,
            id
          )
        ) {
          alert(
            "คุณไม่มีสิทธิ์ประเมินบุคคลนี้"
          );

          window.location.href =
            "/dashboard";

          return;
        }

        if (!alive) return;

        setEvaluatorId(
          currentEvaluator.id
        );

        setCheckingPermission(false);

        /*
         * -----------------------------------------------------
         * ตรวจจาก Supabase เท่านั้น
         * -----------------------------------------------------
         */

        const {
          data,
          error,
        } = await supabase
          .from("assessment_results")
          .select("id")
          .eq(
            "evaluator_id",
            currentEvaluator.id
          )
          .eq(
            "target_id",
            id
          )
          .maybeSingle();

        if (error) {
          console.error(
            "ไม่สามารถตรวจสอบผลประเมินเดิม:",
            error
          );

          alert(
            `ไม่สามารถตรวจสอบสถานะการประเมินได้\n\n${error.message}`
          );

          return;
        }

        if (data) {
          alert(
            "คุณประเมินบุคคลนี้ไปแล้ว\n\nสามารถดูผลการประเมินได้จาก Dashboard"
          );

          window.location.href =
            "/dashboard";

          return;
        }

        /*
         * ไม่มีข้อมูลใน Supabase
         * = สามารถประเมินได้
         */

        if (alive) {
          setCheckingPreviousResult(
            false
          );
        }
      } catch (error) {
        console.error(
          "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์:",
          error
        );

        alert(
          `เกิดข้อผิดพลาด\n\n${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        );
      }
    }

    checkAccess();

    return () => {
      alive = false;
    };
  }, [id]);

  const totalQuestions =
    evaluationQuestions.reduce(
      (total, section) =>
        total + section.items.length,
      0
    );

  const answeredCount =
    Object.keys(answers).length;

  const totalScore =
    Object.values(answers).reduce(
      (total, score) =>
        total + score,
      0
    );

  const maxScore =
    totalQuestions * 5;

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answeredCount /
            totalQuestions) *
            100
        )
      : 0;

  const handleScore = (
    questionId: string,
    score: number
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: score,
    }));
  };

  /*
   * =========================================================
   * บันทึกผล
   * =========================================================
   */

  const handleSubmit = async () => {
    console.log(
      "🔥 BUTTON CLICK"
    );

    if (saving) return;

    if (!evaluatorId) {
      alert(
        "ไม่พบข้อมูลผู้ประเมิน"
      );
      return;
    }

    if (
      !canEvaluate(
        evaluatorId,
        id
      )
    ) {
      alert(
        "คุณไม่มีสิทธิ์ประเมินบุคคลนี้"
      );

      window.location.href =
        "/dashboard";

      return;
    }

    if (
      answeredCount !==
      totalQuestions
    ) {
      alert(
        `กรุณาประเมินให้ครบทุกข้อ\n\nประเมินแล้ว ${answeredCount} จาก ${totalQuestions} ข้อ`
      );

      return;
    }

    const evaluator =
      employees.find(
        (employee) =>
          employee.id ===
          evaluatorId
      );

    if (!evaluator) {
      alert(
        "ไม่พบข้อมูลผู้ประเมิน"
      );
      return;
    }

    const formType =
      isHeadquarters
        ? "department"
        : isAreaManager
          ? "area_manager"
          : isBranchManager
            ? "branch_manager"
            : "director";

    const submittedAt =
      new Date().toISOString();

    const result: AssessmentResult = {
      evaluatorId:
        evaluator.id,

      evaluatorName:
        evaluator.name,

      evaluatorRole:
        evaluator.roleName,

      targetId:
        id,

      targetName,

      targetRole,

      formType,

      answers,

      totalScore,

      maxScore,

      suggestion,

      submittedAt,
    };

    setSaving(true);

    try {
      /*
       * -----------------------------------------------------
       * ส่งไป Next.js API
       * ไม่มีการเก็บผลประเมินใน localStorage
       * -----------------------------------------------------
       */

      console.log(
        "📤 ส่งข้อมูลไป /api/assessment-results",
        result
      );

      const response =
        await fetch(
          "/api/assessment-results",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              evaluator_id:
                evaluator.id,

              evaluator_name:
                evaluator.name,

              evaluator_role:
                evaluator.roleName,

              target_id:
                id,

              target_name:
                targetName,

              target_role:
                targetRole,

              form_type:
                formType,

              answers,

              total_score:
                totalScore,

              max_score:
                maxScore,

              suggestion,

              submitted_at:
                submittedAt,
            }),
          }
        );

      const responseText =
        await response.text();

      console.log(
        "📥 API STATUS:",
        response.status
      );

      console.log(
        "📥 API RESPONSE:",
        responseText
      );

      let responseData:
        | {
            success?: boolean;
            message?: string;
            error?: string;
            code?: string;
            data?: {
              id?: number;
            };
          }
        | null = null;

      try {
        responseData =
          JSON.parse(
            responseText
          );
      } catch {
        responseData = null;
      }

      if (
        !response.ok ||
        !responseData?.success
      ) {
        alert(
          `บันทึกแบบประเมินไม่สำเร็จ\n\nสถานะ: ${response.status}\n\n${
            responseData?.message ||
            responseData?.error ||
            responseText ||
            "ไม่ทราบสาเหตุ"
          }`
        );

        setSaving(false);
        return;
      }

      /*
       * -----------------------------------------------------
       * บันทึกสำเร็จใน Supabase
       * -----------------------------------------------------
       */

      alert(
        `✅ บันทึกแบบประเมินเรียบร้อยแล้ว\n\nผู้ประเมิน:\n${evaluator.name}\n\nผู้ถูกประเมิน:\n${targetName}\n\nคะแนน:\n${totalScore} / ${maxScore}\n\nSupabase ID:\n${responseData.data?.id ?? "-"}`
      );

      setAnswers({});
      setSuggestion("");
      setSaving(false);

      window.location.href =
        "/dashboard";
    } catch (error) {
      console.error(
        "🔥 SUBMIT ERROR:",
        error
      );

      alert(
        `เกิดข้อผิดพลาดในการส่งข้อมูล\n\n${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );

      setSaving(false);
    }
  };

  /*
   * =========================================================
   * Loading
   * =========================================================
   */

  if (
    checkingPermission ||
    checkingPreviousResult
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-700">
            กำลังตรวจสอบสถานะการประเมิน...
          </p>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * ไม่พบผู้ถูกประเมิน
   * =========================================================
   */

  if (
    !target &&
    !isHeadquarters
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="text-6xl">
            ❌
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            ไม่พบผู้ถูกประเมิน
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            ไม่พบข้อมูลบุคคลที่ต้องการประเมิน
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
            className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            ← กลับ Dashboard
          </button>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * Main
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-slate-100 pb-10 sm:pb-16">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-600 sm:text-sm">
              Assessment Form
            </p>

            <h1 className="truncate text-base font-bold text-slate-900 sm:text-xl">
              {formTitle}
            </h1>
          </div>

          <button
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:px-4"
          >
            ← กลับ
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-5 sm:px-5 sm:py-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-5 text-white sm:px-6 sm:py-7">
            <div className="flex items-start gap-3 sm:items-center sm:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                {formIcon}
              </div>

              <div className="min-w-0">
                <p className="text-xs text-blue-100 sm:text-sm">
                  ผู้ถูกประเมิน
                </p>

                <h2 className="mt-1 break-words text-xl font-bold leading-tight sm:text-2xl">
                  {targetName}
                </h2>

                <p className="mt-1 break-words text-sm text-blue-100 sm:text-base">
                  {targetRole}
                </p>

                {target?.region && (
                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                    เขต: {target.region}
                  </p>
                )}

                {target?.branch && (
                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                    สาขา: {target.branch}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x border-t border-slate-100">
            <div className="p-3 text-center sm:p-4">
              <div className="text-lg font-bold text-slate-900 sm:text-xl">
                {totalQuestions}
              </div>

              <div className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                ข้อประเมิน
              </div>
            </div>

            <div className="p-3 text-center sm:p-4">
              <div className="text-lg font-bold text-blue-600 sm:text-xl">
                {answeredCount}
              </div>

              <div className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                ประเมินแล้ว
              </div>
            </div>

            <div className="p-3 text-center sm:p-4">
              <div className="text-lg font-bold text-slate-900 sm:text-xl">
                {totalScore}
              </div>

              <div className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                คะแนน
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">
                ความคืบหน้าการประเมิน
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {answeredCount} / {totalQuestions} ข้อ
              </p>
            </div>

            <div className="shrink-0 text-lg font-bold text-blue-600 sm:text-xl">
              {progress}%
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            รายละเอียดคะแนนการประเมิน
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            เลือกคะแนนให้เหมาะสมกับผลการประเมิน
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-5 sm:gap-3">
            {scores.map((score) => (
              <div
                key={score.value}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center sm:p-4"
              >
                <div className="text-xl font-bold text-blue-600 sm:text-2xl">
                  {score.value}
                </div>

                <div className="mt-1 text-[11px] font-semibold leading-4 text-slate-600 sm:text-xs">
                  {score.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
          {evaluationQuestions.map(
            (section) => (
              <section
                key={section.section}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
                  <h2 className="text-base font-bold leading-6 text-slate-900 sm:text-lg">
                    {section.section}
                  </h2>
                </div>

                <div>
                  {section.items.map(
                    (question) => (
                      <div
                        key={question.id}
                        className="border-b border-slate-100 px-4 py-5 last:border-b-0 sm:px-6 sm:py-7"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <span className="shrink-0 text-base font-bold text-blue-600 sm:text-lg">
                            {question.id}
                          </span>

                          <p className="text-sm font-medium leading-6 text-slate-800 sm:text-base sm:leading-7">
                            {question.text}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:mt-5 sm:gap-2">
                          {scores.map(
                            (score) => {
                              const selected =
                                answers[
                                  question.id
                                ] ===
                                score.value;

                              return (
                                <button
                                  key={
                                    score.value
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleScore(
                                      question.id,
                                      score.value
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  className={`min-h-[68px] touch-manipulation rounded-2xl border px-1 py-2 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-0 sm:px-2 sm:py-3 ${
                                    selected
                                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                                  }`}
                                >
                                  <div className="text-lg font-bold sm:text-xl">
                                    {
                                      score.value
                                    }
                                  </div>

                                  <div className="mt-1 text-[10px] font-medium leading-tight sm:text-[11px]">
                                    {
                                      score.label
                                    }
                                  </div>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {isHeadquarters
              ? "ข้อเสนอแนะ"
              : "สิ่งที่ควรพัฒนาปรับปรุง"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            กรุณาระบุความคิดเห็น
          </p>

          <textarea
            value={suggestion}
            onChange={(event) =>
              setSuggestion(
                event.target.value
              )
            }
            disabled={saving}
            rows={6}
            placeholder="กรอกความคิดเห็น..."
            className="mt-4 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 sm:py-4 sm:text-base"
          />
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-slate-900">
                {saving
                  ? "กำลังบันทึกแบบประเมิน..."
                  : "พร้อมส่งแบบประเมิน"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {answeredCount} / {totalQuestions} ข้อ •{" "}
                {totalScore} / {maxScore} คะแนน
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none sm:w-auto sm:px-8"
            >
              {saving
                ? "⏳ กำลังบันทึก..."
                : "ส่งแบบประเมิน →"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}