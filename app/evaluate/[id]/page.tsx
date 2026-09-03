"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { employees, headquarters } from "@/data/employees";
import { canEvaluate } from "@/lib/permissions";

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

  const isHeadquarters =
    id.startsWith("hq-");

  const isAreaManager =
    target?.role === "area_manager";

  const isBranchManager =
    target?.role === "branch_manager";

  const isDirector =
    target?.role === "director";

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

  const [answers, setAnswers] = useState<
    Record<string, number>
  >({});

  const [suggestion, setSuggestion] =
    useState("");

  /*
   * =======================================================
   * ตรวจผู้ประเมิน + สิทธิ์
   * =======================================================
   *
   * assessment_user ในระบบเดิมเก็บเป็น employee.id
   * ไม่ใช่ JSON
   */
  useEffect(() => {
    if (!id) return;

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
          employee.id === savedUserId
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

    /*
     * ตรวจสิทธิ์จริงจาก permissions.ts
     */
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

    setEvaluatorId(
      currentEvaluator.id
    );

    /*
     * โหลดผลเดิมของ
     * ผู้ประเมินคนนี้ + ผู้ถูกประเมินคนนี้
     *
     * ทำให้แต่ละคนมีผลของตัวเอง
     */
    const resultKey =
      `assessment_result_${currentEvaluator.id}_${id}`;

    const savedResult =
      localStorage.getItem(
        resultKey
      );

    if (savedResult) {
      try {
        const result =
          JSON.parse(savedResult);

        if (
          result &&
          typeof result === "object"
        ) {
          setAnswers(
            result.answers || {}
          );

          setSuggestion(
            result.suggestion || ""
          );
        }
      } catch {
        console.error(
          "อ่านผลประเมินเดิมไม่สำเร็จ"
        );
      }
    }

    setCheckingPermission(false);
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
   * =======================================================
   * บันทึกผล
   * =======================================================
   */
  const handleSubmit = () => {
    if (!evaluatorId) {
      alert(
        "ไม่พบข้อมูลผู้ประเมิน"
      );
      return;
    }

    /*
     * ตรวจสิทธิ์อีกครั้งก่อนบันทึก
     */
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

    const result = {
      /*
       * ผู้ประเมิน
       */
      evaluatorId:
        evaluator.id,

      evaluatorName:
        evaluator.name,

      evaluatorRole:
        evaluator.roleName,

      /*
       * ผู้ถูกประเมิน
       */
      targetId: id,

      targetName,

      targetRole,

      /*
       * แบบประเมิน
       */
      formType,

      answers,

      totalScore,

      maxScore,

      suggestion,

      submittedAt:
        new Date().toISOString(),
    };

    /*
     * สำคัญมาก
     *
     * 1 ผู้ประเมิน + 1 ผู้ถูกประเมิน
     * = 1 ผลประเมิน
     */
    const resultKey =
      `assessment_result_${evaluator.id}_${id}`;

    localStorage.setItem(
      resultKey,
      JSON.stringify(result)
    );

    alert(
      `บันทึกแบบประเมินเรียบร้อยแล้ว\n\n${evaluator.name}\nประเมิน ${targetName}\nคะแนน ${totalScore} / ${maxScore} คะแนน`
    );

    window.location.href =
      "/dashboard";
  };

  /*
   * =======================================================
   * Loading
   * =======================================================
   */
  if (checkingPermission) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-700">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </main>
    );
  }

  /*
   * =======================================================
   * ไม่พบผู้ถูกประเมิน
   * =======================================================
   */
  if (!target && !isHeadquarters) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
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
            className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            ← กลับ Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-16">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Assessment Form
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              {formTitle}
            </h1>
          </div>

          <button
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← กลับ
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        {/* ===================================================
            ผู้ถูกประเมิน
        =================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-7 text-white">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                {formIcon}
              </div>

              <div>
                <p className="text-sm text-blue-100">
                  ผู้ถูกประเมิน
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {targetName}
                </h2>

                <p className="mt-1 text-blue-100">
                  {targetRole}
                </p>

                {target?.region && (
                  <p className="mt-1 text-sm text-blue-100">
                    เขต:{" "}
                    {target.region}
                  </p>
                )}

                {target?.branch && (
                  <p className="mt-1 text-sm text-blue-100">
                    สาขา:{" "}
                    {target.branch}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x border-t border-slate-100">
            <div className="p-4 text-center">
              <div className="text-xl font-bold text-slate-900">
                {totalQuestions}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                ข้อประเมิน
              </div>
            </div>

            <div className="p-4 text-center">
              <div className="text-xl font-bold text-blue-600">
                {answeredCount}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                ประเมินแล้ว
              </div>
            </div>

            <div className="p-4 text-center">
              <div className="text-xl font-bold text-slate-900">
                {totalScore}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                คะแนน
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">
                ความคืบหน้าการประเมิน
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {answeredCount} /{" "}
                {totalQuestions} ข้อ
              </p>
            </div>

            <div className="text-xl font-bold text-blue-600">
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

        {/* ===================================================
            SCORE GUIDE
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            รายละเอียดคะแนนการประเมิน
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            เลือกคะแนนให้เหมาะสมกับผลการประเมิน
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {scores.map(
              (score) => (
                <div
                  key={score.value}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center"
                >
                  <div className="text-2xl font-bold text-blue-600">
                    {score.value}
                  </div>

                  <div className="mt-1 text-xs font-semibold text-slate-600">
                    {score.label}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* ===================================================
            QUESTIONS
        =================================================== */}

        <div className="mt-6 space-y-6">
          {evaluationQuestions.map(
            (section) => (
              <section
                key={section.section}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {section.section}
                  </h2>
                </div>

                <div>
                  {section.items.map(
                    (question) => (
                      <div
                        key={question.id}
                        className="border-b border-slate-100 px-6 py-7 last:border-b-0"
                      >
                        <div className="flex gap-3">
                          <span className="shrink-0 text-lg font-bold text-blue-600">
                            {question.id}
                          </span>

                          <p className="text-base font-medium leading-7 text-slate-800">
                            {question.text}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-5 gap-2">
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
                                  className={`rounded-2xl border px-2 py-3 transition ${
                                    selected
                                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                                  }`}
                                >
                                  <div className="text-xl font-bold">
                                    {
                                      score.value
                                    }
                                  </div>

                                  <div className="mt-1 text-[11px] font-medium">
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

        {/* ===================================================
            ข้อเสนอแนะ
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
            rows={6}
            placeholder="กรอกความคิดเห็น..."
            className="mt-4 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </section>

        {/* ===================================================
            SUBMIT
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-slate-900">
                พร้อมส่งแบบประเมิน
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {answeredCount} /{" "}
                {totalQuestions} ข้อ
                {" • "}
                {totalScore} /{" "}
                {maxScore} คะแนน
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleSubmit
              }
              className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              ส่งแบบประเมิน →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}