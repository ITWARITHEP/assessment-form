"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { employees, headquarters } from "@/data/employees";
import { getEvaluationEvaluators } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";

/*
 * =========================================================
 * ชุดคำถามเดิมของระบบ
 * ใช้สำหรับแสดงคำถามจริงใน Excel
 * =========================================================
 */

type QuestionItem = {
  id: string;
  text: string;
};

type QuestionSection = {
  section: string;
  items: QuestionItem[];
};

/*
 * ---------------------------------------------------------
 * แบบประเมินผู้อำนวยการ
 * ---------------------------------------------------------
 */
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

/*
 * ---------------------------------------------------------
 * แบบประเมินผู้จัดการเขต
 * ---------------------------------------------------------
 */
const areaManagerQuestions: QuestionSection[] = [
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

/*
 * ---------------------------------------------------------
 * แบบประเมินผู้จัดการสาขา
 * ---------------------------------------------------------
 */
const branchManagerQuestions: QuestionSection[] = [
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

/*
 * ---------------------------------------------------------
 * แบบประเมินฝ่ายสำนักงานใหญ่
 * ---------------------------------------------------------
 */
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

const scoreLabels: Record<number, string> = {
  1: "ต้องปรับปรุง",
  2: "พอใช้",
  3: "ปานกลาง",
  4: "ดี",
  5: "ดีมาก",
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

type EvaluatorResult = {
  id: string;
  name: string;
  roleName: string;
  result: AssessmentResult | null;
};

type SupabaseAssessmentRow = {
  id: number;
  evaluator_id: string;
  evaluator_name: string;
  evaluator_role: string;
  target_id: string;
  target_name: string;
  target_role: string;
  form_type: string;
  answers: Record<string, number>;
  total_score: number;
  max_score: number;
  suggestion: string;
  submitted_at: string;
  created_at: string;
};

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [targetId, setTargetId] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const [results, setResults] = useState<EvaluatorResult[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        setTargetId(id);

        const adminAccess = sessionStorage.getItem(
          "assessment_admin_access"
        );

        if (adminAccess !== "true") {
          window.location.href = "/dashboard";
          return;
        }

        const employeeTarget = employees.find(
          (employee) => employee.id === id
        );

        if (employeeTarget) {
          setTargetName(employeeTarget.name);
          setTargetRole(employeeTarget.roleName);
        } else if (id.startsWith("hq-")) {
          const index = Number(id.replace("hq-", "")) - 1;

          const headquartersTarget = headquarters[index];

          if (headquartersTarget) {
            setTargetName(headquartersTarget);
            setTargetRole("ฝ่ายสำนักงานใหญ่");
          }
        }

        const evaluators = getEvaluationEvaluators(id);

        let supabaseRows: SupabaseAssessmentRow[] = [];

        const { data, error } = await supabase
          .from("assessment_results")
          .select("*")
          .eq("target_id", id);

        if (error) {
          console.error(
            "ไม่สามารถโหลดผลการประเมินจาก Supabase:",
            error
          );
        } else {
          supabaseRows =
            (data as SupabaseAssessmentRow[]) || [];
        }

        const evaluatorResults: EvaluatorResult[] =
          evaluators.map((evaluator) => {
            const supabaseResult =
              supabaseRows.find(
                (row) =>
                  row.evaluator_id === evaluator.id &&
                  row.target_id === id
              );

            if (!supabaseResult) {
              return {
                id: evaluator.id,
                name: evaluator.name,
                roleName: evaluator.roleName,
                result: null,
              };
            }

            const result: AssessmentResult = {
              evaluatorId:
                supabaseResult.evaluator_id,
              evaluatorName:
                supabaseResult.evaluator_name,
              evaluatorRole:
                supabaseResult.evaluator_role,
              targetId:
                supabaseResult.target_id,
              targetName:
                supabaseResult.target_name,
              targetRole:
                supabaseResult.target_role,
              formType:
                supabaseResult.form_type,
              answers:
                supabaseResult.answers || {},
              totalScore:
                Number(
                  supabaseResult.total_score
                ) || 0,
              maxScore:
                Number(
                  supabaseResult.max_score
                ) || 0,
              suggestion:
                supabaseResult.suggestion || "",
              submittedAt:
                supabaseResult.submitted_at ||
                supabaseResult.created_at,
            };

            return {
              id: evaluator.id,
              name: evaluator.name,
              roleName: evaluator.roleName,
              result,
            };
          });

        setResults(evaluatorResults);
      } catch (error) {
        console.error(
          "ไม่สามารถโหลดผลการประเมิน:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [params]);

  const completedCount = useMemo(() => {
    return results.filter(
      (item) => item.result !== null
    ).length;
  }, [results]);

  const totalEvaluators = results.length;

  const progressPercent =
    totalEvaluators > 0
      ? Math.round(
          (completedCount / totalEvaluators) * 100
        )
      : 0;

  const averagePercent = useMemo(() => {
    const completedResults = results
      .map((item) => item.result)
      .filter(
        (
          result
        ): result is AssessmentResult =>
          result !== null
      );

    if (completedResults.length === 0) {
      return 0;
    }

    const totalScore =
      completedResults.reduce(
        (sum, result) =>
          sum + result.totalScore,
        0
      );

    const maxScore =
      completedResults.reduce(
        (sum, result) =>
          sum + result.maxScore,
        0
      );

    if (maxScore === 0) {
      return 0;
    }

    return Math.round(
      (totalScore / maxScore) * 100
    );
  }, [results]);

  const exportExcel = () => {
    if (!targetId) {
      return;
    }

    const rows = results.map((item) => {
      if (!item.result) {
        return {
          "ผู้ประเมิน": item.name,
          "ตำแหน่ง": item.roleName,
          "สถานะ": "ยังไม่ได้ประเมิน",
          "คะแนน": "",
          "คะแนนเต็ม": "",
          "เปอร์เซ็นต์": "",
          "วันที่ประเมิน": "",
          "ข้อเสนอแนะ": "",
        };
      }

      const result = item.result;

      const percent =
        result.maxScore > 0
          ? Math.round(
              (result.totalScore /
                result.maxScore) *
                100
            )
          : 0;

      return {
        "ผู้ประเมิน":
          result.evaluatorName,
        "ตำแหน่ง":
          result.evaluatorRole,
        "สถานะ":
          "ประเมินแล้ว",
        "คะแนน":
          result.totalScore,
        "คะแนนเต็ม":
          result.maxScore,
        "เปอร์เซ็นต์":
          `${percent}%`,
        "วันที่ประเมิน":
          result.submittedAt
            ? new Date(
                result.submittedAt
              ).toLocaleString("th-TH")
            : "",
        "ข้อเสนอแนะ":
          result.suggestion || "",
      };
    });

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 30 },
      { wch: 30 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 25 },
      { wch: 45 },
    ];

    const summaryRows = [
      ["ผลการประเมินพนักงาน"],
      [],
      ["ผู้ถูกประเมิน", targetName],
      ["ตำแหน่ง", targetRole],
      [],
      ["ผู้ประเมินทั้งหมด", totalEvaluators],
      ["ประเมินแล้ว", completedCount],
      [
        "รอประเมิน",
        totalEvaluators - completedCount,
      ],
      ["ความคืบหน้า", `${progressPercent}%`],
      ["คะแนนเฉลี่ย", `${averagePercent}%`],
    ];

    const summarySheet =
      XLSX.utils.aoa_to_sheet(
        summaryRows
      );

    summarySheet["!cols"] = [
      { wch: 28 },
      { wch: 45 },
    ];

    const questionRows: Array<{
      "ผู้ประเมิน": string;
      "ตำแหน่ง": string;
      "หมวด": string;
      "ข้อ": string;
      "คำถาม": string;
      "คะแนน": number | string;
      "ระดับ": string;
    }> = [];

    results.forEach((item) => {
      if (!item.result) {
        questionRows.push({
          "ผู้ประเมิน": item.name,
          "ตำแหน่ง": item.roleName,
          "หมวด": "-",
          "ข้อ": "-",
          "คำถาม": "-",
          "คะแนน": "-",
          "ระดับ": "ยังไม่ได้ประเมิน",
        });

        return;
      }

      const result = item.result;

      let questionSet: QuestionSection[];

      switch (result.formType) {
        case "department":
          questionSet = departmentQuestions;
          break;

        case "area_manager":
          questionSet = areaManagerQuestions;
          break;

        case "branch_manager":
          questionSet = branchManagerQuestions;
          break;

        case "director":
        default:
          questionSet = directorQuestions;
          break;
      }

      questionSet.forEach((section) => {
        section.items.forEach((question) => {
          const score =
            result.answers?.[question.id];

          questionRows.push({
            "ผู้ประเมิน":
              result.evaluatorName ||
              item.name,
            "ตำแหน่ง":
              result.evaluatorRole ||
              item.roleName,
            "หมวด":
              section.section,
            "ข้อ":
              question.id,
            "คำถาม":
              question.text,
            "คะแนน":
              typeof score === "number"
                ? score
                : "-",
            "ระดับ":
              typeof score === "number"
                ? scoreLabels[score] || "-"
                : "-",
          });
        });
      });
    });

    const questionSheet =
      XLSX.utils.json_to_sheet(
        questionRows
      );

    questionSheet["!cols"] = [
      { wch: 30 },
      { wch: 28 },
      { wch: 35 },
      { wch: 10 },
      { wch: 80 },
      { wch: 10 },
      { wch: 18 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "สรุป"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "ผลการประเมิน"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      questionSheet,
      "คะแนนรายข้อ"
    );

    const safeName =
      targetName
        .replace(/[\\/:*?"<>|]/g, "")
        .trim() || "ผู้ถูกประเมิน";

    XLSX.writeFile(
      workbook,
      `ผลการประเมิน_${safeName}.xlsx`
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white px-6 py-8 text-center shadow-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-700">
            กำลังโหลดผลการประเมิน...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-10 sm:pb-16">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">
              Assessment Form
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              ผลการประเมินพนักงาน
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
          >
            ← กลับ Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        {/* EMPLOYEE */}

        <section className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-3 text-white shadow-lg shadow-blue-100 sm:mb-6 sm:rounded-3xl sm:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
            <div className="min-w-0">
              <p className="text-[10px] text-blue-100 sm:text-sm">
                ผู้ถูกประเมิน
              </p>

              <h2 className="mt-0.5 break-words text-lg font-bold leading-tight sm:mt-1 sm:text-3xl">
                {targetName ||
                  "ไม่พบข้อมูล"}
              </h2>

              <p className="mt-1 max-w-[260px] whitespace-pre-line text-xs font-medium leading-5 text-blue-100 sm:mt-2 sm:max-w-none sm:text-base sm:leading-6">
                {targetRole || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:min-w-[300px]">
              <div className="rounded-xl bg-white/15 px-2 py-2.5 text-center backdrop-blur sm:rounded-2xl sm:px-6 sm:py-4">
                <div className="text-xl font-bold leading-none sm:text-3xl">
                  {completedCount}

                  <span className="text-xs font-medium sm:text-xl">
                    {" "}
                    / {totalEvaluators}
                  </span>
                </div>

                <div className="mt-1 text-[10px] text-blue-100 sm:text-sm">
                  ผู้ประเมิน
                </div>
              </div>

              <div className="rounded-xl bg-white/15 px-2 py-2.5 text-center backdrop-blur sm:rounded-2xl sm:px-6 sm:py-4">
                <div className="text-xl font-bold leading-none sm:text-3xl">
                  {averagePercent}%
                </div>

                <div className="mt-1 text-[10px] text-blue-100 sm:text-sm">
                  คะแนนเฉลี่ย
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRESS */}

        <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                📊 ความคืบหน้าการประเมิน
              </h3>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                จำนวนผู้ประเมินที่ส่งแบบประเมินแล้ว
              </p>
            </div>

            <div className="text-lg font-bold text-blue-600 sm:text-xl">
              {completedCount} /{" "}
              {totalEvaluators} คน
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>

          <div className="mt-2 text-right text-xs text-slate-400 sm:text-sm">
            {progressPercent}% เสร็จแล้ว
          </div>
        </section>

        {/* ACTION */}

        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              👥 รายชื่อผู้ประเมิน
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              คลิกดูคะแนนรายข้อของผู้ประเมินแต่ละคน
            </p>
          </div>

          <button
            onClick={exportExcel}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] sm:w-auto"
          >
            📊 Export Excel
          </button>
        </div>

        {/* EVALUATORS */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const result = item.result;

            const percent =
              result &&
              result.maxScore > 0
                ? Math.round(
                    (result.totalScore /
                      result.maxScore) *
                      100
                  )
                : 0;

            return (
              <div
                key={item.id}
                className={`rounded-3xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                  result
                    ? "border-slate-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                    : "border-slate-200"
                }`}
              >
                {/* ผู้ประเมิน */}

                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl sm:h-14 sm:w-14 sm:text-2xl ${
                      result
                        ? "bg-blue-50"
                        : "bg-slate-100"
                    }`}
                  >
                    {result ? "👤" : "⏳"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold leading-6 text-slate-900">
                      {item.name}
                    </h3>

                    {/* ตำแหน่งผู้ประเมิน */}

                    <p className="mt-1 text-sm leading-5 text-blue-600">
                      {item.id === "exec-002" && (
                        <>
                          <span className="block whitespace-nowrap">
                            รองประธานกรรมการบริหาร
                          </span>
                          <span className="block whitespace-nowrap">
                            ประธาน เขตอีสานใต้2
                          </span>
                        </>
                      )}

                      {item.id === "exec-003" && (
                        <>
                          <span className="block whitespace-nowrap">
                            รองประธานกรรมการบริหาร
                          </span>
                          <span className="block whitespace-nowrap">
                            ประธาน เขตอีสานเหนือ
                          </span>
                        </>
                      )}

                      {item.id === "exec-004" && (
                        <>
                          <span className="block whitespace-nowrap">
                            รองประธานกรรมการบริหาร
                          </span>
                          <span className="block whitespace-nowrap">
                            ประธาน เขตภาคกลาง
                          </span>
                        </>
                      )}

                      {item.id === "exec-005" && (
                        <>
                          <span className="block whitespace-nowrap">
                            รองประธานกรรมการบริหาร
                          </span>
                          <span className="block whitespace-nowrap">
                            ประธาน เขตภาคเหนือ
                          </span>
                        </>
                      )}

                      {item.id === "exec-006" && (
                        <>
                          <span className="block whitespace-nowrap">
                            รองประธานกรรมการบริหาร
                          </span>
                          <span className="block whitespace-nowrap">
                            ประธาน เขตอีสานใต้1
                          </span>
                        </>
                      )}

                      {!item.id.startsWith("exec-") && (
                        <span className="block">
                          {item.roleName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {result ? (
                  <>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 sm:mt-5">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500 sm:text-sm">
                            คะแนนที่ได้
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                            {result.totalScore}

                            <span className="text-base font-medium text-slate-400 sm:text-lg">
                              {" "}
                              /{" "}
                              {result.maxScore}
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600 sm:text-2xl">
                            {percent}%
                          </p>

                          <p className="text-[11px] text-slate-400 sm:text-xs">
                            คะแนนประเมิน
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        ✅ ประเมินแล้ว
                      </span>

                      <span>
                        {result.submittedAt
                          ? new Date(
                              result.submittedAt
                            ).toLocaleDateString(
                              "th-TH"
                            )
                          : "-"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        window.location.href =
                          `/results/${targetId}/reviewer/${item.id}`;
                      }}
                      className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                    >
                      👁 ดูคะแนนรายข้อ →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-center sm:mt-5">
                      <div className="text-3xl">
                        ⏳
                      </div>

                      <p className="mt-2 font-semibold text-slate-600">
                        ยังไม่ได้ประเมิน
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        รอผู้ประเมินส่งแบบประเมิน
                      </p>
                    </div>

                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400 sm:mt-4 sm:text-sm">
                      ⏳ รอผลการประเมิน
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="text-5xl">
              📋
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800 sm:text-xl">
              ยังไม่มีผู้ประเมิน
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              ไม่พบผู้ที่มีสิทธิ์ประเมินบุคคลนี้
            </p>
          </div>
        )}
      </div>
    </main>
  );
}