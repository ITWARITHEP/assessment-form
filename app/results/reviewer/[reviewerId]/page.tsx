"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  employees,
  headquarters,
} from "@/data/employees";

type AssessmentResult = {
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole?: string;

  targetId: string;
  targetName: string;
  targetRole: string;

  formType: string;
  answers: Record<string, number>;
  totalScore: number;
  maxScore: number;
  suggestion?: string;
  submittedAt: string;
};

type QuestionItem = {
  id: string;
  text: string;
};

type QuestionSection = {
  section: string;
  items: QuestionItem[];
};

/* =========================================================
   แบบประเมินผู้อำนวยการ
========================================================= */

const directorQuestions: QuestionSection[] = [
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

const areaManagerQuestions: QuestionSection[] = [
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
   แบบประเมินผู้จัดการสาขา
========================================================= */

const branchManagerQuestions: QuestionSection[] = [
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
   แบบประเมินฝ่ายสำนักงานใหญ่

   ใช้ข้อความตามแบบประเมินเดิม
========================================================= */

const departmentQuestions: QuestionSection[] = [
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

const scoreLabels: Record<number, string> = {
  1: "ต้องปรับปรุง",
  2: "พอใช้",
  3: "ปานกลาง",
  4: "ดี",
  5: "ดีมาก",
};

function getScoreClass(score: number) {
  if (score === 5) {
    return "bg-emerald-50 border-emerald-200 text-emerald-700";
  }

  if (score === 4) {
    return "bg-blue-50 border-blue-200 text-blue-700";
  }

  if (score === 3) {
    return "bg-amber-50 border-amber-200 text-amber-700";
  }

  if (score === 2) {
    return "bg-orange-50 border-orange-200 text-orange-700";
  }

  return "bg-red-50 border-red-200 text-red-700";
}

export default function ReviewerResultPage() {
  const params = useParams();

  const targetId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const reviewerId =
    typeof params.reviewerId === "string"
      ? params.reviewerId
      : Array.isArray(params.reviewerId)
        ? params.reviewerId[0]
        : "";

  const [result, setResult] =
    useState<AssessmentResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [questions, setQuestions] =
    useState<QuestionSection[]>([]);

  useEffect(() => {
    try {
      /*
       * ---------------------------------------------
       * โหลดผลประเมิน
       * ---------------------------------------------
       */

      const key =
        `assessment_result_${reviewerId}_${targetId}`;

      const saved =
        localStorage.getItem(key);

      if (saved) {
        const parsed =
          JSON.parse(saved);

        setResult(parsed);

        /*
         * ---------------------------------------------
         * เลือกชุดคำถามตาม formType
         * ---------------------------------------------
         */

        if (
          parsed.formType ===
          "department"
        ) {
          setQuestions(
            departmentQuestions
          );
        } else if (
          parsed.formType ===
          "area_manager"
        ) {
          setQuestions(
            areaManagerQuestions
          );
        } else if (
          parsed.formType ===
          "branch_manager"
        ) {
          setQuestions(
            branchManagerQuestions
          );
        } else {
          setQuestions(
            directorQuestions
          );
        }
      } else {
        /*
         * fallback:
         * เผื่อ key มีข้อมูลแต่ชื่อ key
         * ไม่ตรงที่คาดไว้
         */

        for (
          let i = 0;
          i < localStorage.length;
          i++
        ) {
          const storageKey =
            localStorage.key(i);

          if (
            !storageKey ||
            !storageKey.startsWith(
              "assessment_result_"
            )
          ) {
            continue;
          }

          try {
            const raw =
              localStorage.getItem(
                storageKey
              );

            if (!raw) continue;

            const parsed =
              JSON.parse(raw);

            if (
              parsed.targetId ===
                targetId &&
              parsed.evaluatorId ===
                reviewerId
            ) {
              setResult(parsed);

              if (
                parsed.formType ===
                "department"
              ) {
                setQuestions(
                  departmentQuestions
                );
              } else if (
                parsed.formType ===
                "area_manager"
              ) {
                setQuestions(
                  areaManagerQuestions
                );
              } else if (
                parsed.formType ===
                "branch_manager"
              ) {
                setQuestions(
                  branchManagerQuestions
                );
              } else {
                setQuestions(
                  directorQuestions
                );
              }

              break;
            }
          } catch {
            // ข้ามข้อมูลเสีย
          }
        }
      }
    } catch (error) {
      console.error(
        "โหลดรายละเอียดคะแนนไม่สำเร็จ:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [targetId, reviewerId]);

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">
              ⏳
            </div>

            <p className="mt-4 font-bold text-slate-700">
              กำลังโหลดรายละเอียดคะแนน...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ไม่พบผลประเมิน
  ========================================================= */

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">
              📋
            </div>

            <h1 className="mt-4 text-xl font-black text-slate-900">
              ไม่พบผลการประเมิน
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              อาจยังไม่ได้ส่งแบบประเมิน
              หรือข้อมูลถูกลบออกจากเครื่อง
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  `/results/${targetId}`;
              }}
              className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
            >
              ← กลับผลการประเมิน
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ข้อมูลผู้ถูกประเมิน
  ========================================================= */

  const target =
    employees.find(
      (employee) =>
        employee.id === targetId
    );

  const isHeadquarters =
    targetId.startsWith("hq-");

  const headquartersName =
    isHeadquarters
      ? headquarters[
          Number(
            targetId.replace("hq-", "")
          ) - 1
        ]
      : "";

  const displayTargetName =
    result.targetName ||
    headquartersName ||
    target?.name ||
    "";

  const displayTargetRole =
    result.targetRole ||
    (isHeadquarters
      ? "ฝ่ายสำนักงานใหญ่"
      : target?.roleName || "");

  const scorePercent =
    result.maxScore > 0
      ? Math.round(
          (result.totalScore /
            result.maxScore) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* ===================================================
            Header
        =================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <button
            type="button"
            onClick={() => {
              window.location.href =
                `/results/${targetId}`;
            }}
            className="mb-6 text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            ← กลับผลการประเมิน
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                👤
              </div>

              <div>
                <p className="text-sm font-bold text-blue-600">
                  รายละเอียดการประเมิน
                </p>

                <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                  {displayTargetName}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {displayTargetRole}
                </p>
              </div>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 lg:min-w-[220px]">

              <p className="text-sm font-semibold text-slate-500">
                คะแนนรวม
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-4xl font-black text-blue-600">
                  {result.totalScore}
                </span>

                <span className="mb-1 text-lg font-bold text-slate-400">
                  / {result.maxScore}
                </span>
              </div>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {scorePercent}%
              </p>

            </div>

          </div>
        </section>

        {/* ===================================================
            Evaluator
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl">
              📝
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                ผู้ประเมิน
              </p>

              <h2 className="text-xl font-black text-slate-900">
                {result.evaluatorName}
              </h2>

              <p className="text-sm text-slate-500">
                {result.evaluatorRole ||
                  "ไม่ระบุตำแหน่ง"}
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">
                แบบประเมิน
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {result.formType ===
                "director"
                  ? "แบบประเมินผู้อำนวยการ"
                  : result.formType ===
                      "area_manager"
                    ? "แบบประเมินผู้จัดการเขต"
                    : result.formType ===
                        "branch_manager"
                      ? "แบบประเมินผู้จัดการสาขา"
                      : "แบบประเมินฝ่าย"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">
                วันที่ประเมิน
              </p>

              <p className="mt-1 font-bold text-slate-800">
                {new Date(
                  result.submittedAt
                ).toLocaleString("th-TH")}
              </p>
            </div>

          </div>
        </section>

        {/* ===================================================
            Question scores
        =================================================== */}

        <section className="mt-6">

          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900">
              📊 คะแนนรายข้อ
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              รายละเอียดคะแนนจากผู้ประเมินแต่ละข้อ
            </p>
          </div>

          <div className="space-y-5">

            {questions.map(
              (section) => {

                const sectionTotal =
                  section.items.reduce(
                    (sum, item) =>
                      sum +
                      (result.answers[
                        item.id
                      ] || 0),
                    0
                  );

                const sectionMax =
                  section.items.length *
                  5;

                return (
                  <section
                    key={section.section}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* Section header */}

                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <h3 className="font-black text-slate-900">
                          {section.section}
                        </h3>

                        <span className="w-fit rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600 shadow-sm">
                          {sectionTotal} /{" "}
                          {sectionMax} คะแนน
                        </span>

                      </div>

                    </div>

                    {/* Questions */}

                    <div className="divide-y divide-slate-100">

                      {section.items.map(
                        (question) => {

                          const score =
                            result.answers[
                              question.id
                            ] || 0;

                          return (
                            <div
                              key={
                                question.id
                              }
                              className="p-5 sm:p-6"
                            >

                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                <div className="flex gap-3">

                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">
                                    {
                                      question.id
                                    }
                                  </div>

                                  <p className="pt-1 text-sm font-medium leading-6 text-slate-700">
                                    {
                                      question.text
                                    }
                                  </p>

                                </div>

                                <div
                                  className={`shrink-0 rounded-2xl border px-5 py-3 text-center ${getScoreClass(
                                    score
                                  )}`}
                                >
                                  <p className="text-2xl font-black">
                                    {score}
                                  </p>

                                  <p className="text-xs font-bold">
                                    {scoreLabels[
                                      score
                                    ] ||
                                      "ไม่ระบุ"}
                                  </p>
                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  </section>
                );
              }
            )}

          </div>
        </section>

        {/* ===================================================
            Suggestion
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-xl">
              💬
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                {result.formType ===
                "department"
                  ? "ข้อเสนอแนะ"
                  : "สิ่งที่ควรพัฒนาปรับปรุง"}
              </h2>

              <p className="text-sm text-slate-500">
                ความคิดเห็นจากผู้ประเมิน
              </p>
            </div>

          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-5">

            {result.suggestion ? (
              <p className="whitespace-pre-wrap leading-7 text-slate-700">
                {result.suggestion}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">
                ไม่มีข้อเสนอแนะ
              </p>
            )}

          </div>

        </section>

        {/* ===================================================
            Bottom
        =================================================== */}

        <div className="mt-6 flex justify-center">

          <button
            type="button"
            onClick={() => {
              window.location.href =
                `/results/${targetId}`;
            }}
            className="rounded-2xl bg-slate-900 px-7 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            ← กลับรายชื่อผู้ประเมิน
          </button>

        </div>

      </div>
    </main>
  );
}