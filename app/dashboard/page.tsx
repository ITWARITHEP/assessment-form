"use client";

import { useEffect, useState } from "react";
import {
  Employee,
  employees,
} from "@/data/employees";
import {
  EvaluationTarget,
  getEvaluationTargets,
} from "@/lib/permissions";

type MyAssessment = {
  targetId: string;
  targetName: string;
  totalScore: number;
  maxScore: number;
  submittedAt?: string;
};

export default function DashboardPage() {
  const [evaluator, setEvaluator] =
    useState<Employee | null>(null);

  const [targets, setTargets] = useState<
    EvaluationTarget[]
  >([]);

  const [myAssessments, setMyAssessments] =
    useState<Record<string, MyAssessment>>({});

  useEffect(() => {
    const savedId =
      localStorage.getItem("assessment_user");

    if (!savedId) {
      window.location.href = "/";
      return;
    }

    const user = employees.find(
      (employee) => employee.id === savedId
    );

    if (!user) {
      localStorage.removeItem("assessment_user");
      window.location.href = "/";
      return;
    }

    setEvaluator(user);

    const evaluationTargets =
      getEvaluationTargets(user);

    setTargets(evaluationTargets);

    /*
     * =========================================================
     * ตรวจสอบว่า "เรา" ประเมินแต่ละคนไปแล้วหรือยัง
     *
     * รูปแบบข้อมูล:
     * assessment_result_${evaluatorId}_${targetId}
     * =========================================================
     */

    const savedAssessments: Record<
      string,
      MyAssessment
    > = {};

    evaluationTargets.forEach((target) => {
      const key =
        `assessment_result_${user.id}_${target.id}`;

      const saved =
        localStorage.getItem(key);

      if (!saved) return;

      try {
        const result = JSON.parse(saved);

        if (
          result &&
          typeof result === "object"
        ) {
          savedAssessments[target.id] = {
            targetId:
              result.targetId ??
              target.id,

            targetName:
              result.targetName ??
              target.name,

            totalScore:
              Number(
                result.totalScore ?? 0
              ),

            maxScore:
              Number(
                result.maxScore ?? 0
              ),

            submittedAt:
              result.submittedAt,
          };
        }
      } catch {
        // ข้ามข้อมูลที่อ่านไม่ได้
      }
    });

    setMyAssessments(
      savedAssessments
    );
  }, []);

  const getRoleIcon = (
    role: Employee["role"]
  ) => {
    switch (role) {
      case "executive":
        return "👑";

      case "director":
        return "🏢";

      case "area_manager":
        return "🌎";

      case "branch_manager":
        return "🏪";

      default:
        return "👤";
    }
  };

  const getCategoryName = (
    category: EvaluationTarget["category"]
  ) => {
    switch (category) {
      case "director":
        return "ผู้อำนวยการฝ่าย";

      case "area_manager":
        return "ผู้จัดการเขต";

      case "branch_manager":
        return "ผู้จัดการสาขา";

      case "headquarters":
        return "ฝ่ายสำนักงานใหญ่";

      default:
        return "ผู้ถูกประเมิน";
    }
  };

  const groupedTargets = {
    director: targets.filter(
      (target) =>
        target.category === "director"
    ),

    area_manager: targets.filter(
      (target) =>
        target.category === "area_manager"
    ),

    branch_manager: targets.filter(
      (target) =>
        target.category === "branch_manager"
    ),

    headquarters: targets.filter(
      (target) =>
        target.category === "headquarters"
    ),
  };

  const completedCount =
    Object.keys(myAssessments).length;

  const pendingCount =
    targets.length - completedCount;

  if (!evaluator) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-slate-500">
          กำลังโหลดระบบ...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Assessment Form
            </h1>

            <p className="text-sm text-slate-500">
              ระบบประเมินพนักงาน
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem(
                "assessment_user"
              );

              sessionStorage.removeItem(
                "assessment_admin_access"
              );

              window.location.href = "/";
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* =====================================================
            EVALUATOR INFORMATION
        ===================================================== */}

        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-7 text-white shadow-xl shadow-blue-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-4xl backdrop-blur">
                {getRoleIcon(
                  evaluator.role
                )}
              </div>

              <div>
                <p className="text-sm text-blue-100">
                  ผู้ประเมิน
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {evaluator.name}
                </h2>

                <p className="mt-1 text-blue-100">
                  {evaluator.roleName}
                </p>

                {evaluator.region && (
                  <p className="mt-1 text-sm text-blue-100">
                    เขต:{" "}
                    {evaluator.region}
                  </p>
                )}
              </div>
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-2xl font-bold">
                  {targets.length}
                </div>

                <div className="text-xs text-blue-100">
                  ทั้งหมด
                </div>
              </div>

              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-2xl font-bold">
                  {completedCount}
                </div>

                <div className="text-xs text-blue-100">
                  ประเมินแล้ว
                </div>
              </div>

              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-2xl font-bold">
                  {pendingCount}
                </div>

                <div className="text-xs text-blue-100">
                  ยังไม่ได้ประเมิน
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PAGE TITLE
        ===================================================== */}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            👥 ผู้ที่ฉันต้องประเมิน
          </h2>

          <p className="mt-1 text-slate-500">
            ตรวจสอบสถานะการประเมินของคุณ
          </p>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon="🏢"
            title="ผู้อำนวยการฝ่าย"
            count={
              groupedTargets.director.length
            }
          />

          <SummaryCard
            icon="🌎"
            title="ผู้จัดการเขต"
            count={
              groupedTargets.area_manager.length
            }
          />

          <SummaryCard
            icon="🏪"
            title="ผู้จัดการสาขา"
            count={
              groupedTargets.branch_manager.length
            }
          />

          <SummaryCard
            icon="🏛️"
            title="สำนักงานใหญ่"
            count={
              groupedTargets.headquarters.length
            }
          />
        </div>

        {/* =====================================================
            TARGET LIST
        ===================================================== */}

        <div className="space-y-8">
          <TargetSection
            title="🏢 ผู้อำนวยการฝ่าย"
            subtitle="รายชื่อผู้อำนวยการฝ่ายที่คุณสามารถประเมินได้"
            targets={
              groupedTargets.director
            }
            myAssessments={
              myAssessments
            }
            getCategoryName={
              getCategoryName
            }
          />

          <TargetSection
            title="🌎 ผู้จัดการเขต"
            subtitle="รายชื่อผู้จัดการเขตที่คุณสามารถประเมินได้"
            targets={
              groupedTargets.area_manager
            }
            myAssessments={
              myAssessments
            }
            getCategoryName={
              getCategoryName
            }
          />

          <TargetSection
            title="🏪 ผู้จัดการสาขา"
            subtitle="รายชื่อผู้จัดการสาขาที่คุณสามารถประเมินได้"
            targets={
              groupedTargets.branch_manager
            }
            myAssessments={
              myAssessments
            }
            getCategoryName={
              getCategoryName
            }
          />

          <TargetSection
            title="🏛️ ฝ่ายสำนักงานใหญ่"
            subtitle="รายชื่อฝ่ายสำนักงานใหญ่ที่คุณสามารถประเมินได้"
            targets={
              groupedTargets.headquarters
            }
            myAssessments={
              myAssessments
            }
            getCategoryName={
              getCategoryName
            }
          />
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-3xl">
          {icon}
        </div>

        <div className="text-3xl font-bold text-slate-900">
          {count}
        </div>
      </div>

      <p className="mt-4 font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        รายการ
      </p>
    </div>
  );
}

/* =========================================================
   TARGET SECTION
========================================================= */

function TargetSection({
  title,
  subtitle,
  targets,
  myAssessments,
  getCategoryName,
}: {
  title: string;
  subtitle: string;
  targets: EvaluationTarget[];
  myAssessments: Record<
    string,
    MyAssessment
  >;
  getCategoryName: (
    category: EvaluationTarget["category"]
  ) => string;
}) {
  if (targets.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">
          {title}
        </h3>

        <p className="text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {targets.map((target) => {
          const assessment =
            myAssessments[target.id];

          const isCompleted =
            Boolean(assessment);

          return (
            <div
              key={target.id}
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                isCompleted
                  ? "border-emerald-200"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              {/* =================================================
                  PERSON
              ================================================= */}

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                    isCompleted
                      ? "bg-emerald-50"
                      : "bg-blue-50"
                  }`}
                >
                  {target.category ===
                    "headquarters" &&
                    "🏛️"}

                  {target.category ===
                    "director" &&
                    "🏢"}

                  {target.category ===
                    "area_manager" &&
                    "🌎"}

                  {target.category ===
                    "branch_manager" &&
                    "🏪"}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold leading-6 text-slate-900">
                    {target.name}
                  </h4>

                  <p className="mt-1 text-sm text-blue-600">
                    {getCategoryName(
                      target.category
                    )}
                  </p>

                  {target.roleName !==
                    "ฝ่ายสำนักงานใหญ่" && (
                    <p className="mt-1 text-sm text-slate-500">
                      {target.roleName}
                    </p>
                  )}

                  {target.branch && (
                    <p className="mt-1 text-sm text-slate-500">
                      📍 {target.branch}
                    </p>
                  )}

                  {target.region && (
                    <p className="mt-1 text-xs text-slate-400">
                      เขต {target.region}
                    </p>
                  )}
                </div>
              </div>

              {/* =================================================
                  STATUS
              ================================================= */}

              <div
                className={`mt-5 rounded-xl border p-4 ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                {isCompleted ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          🟢
                        </span>

                        <span className="font-bold text-emerald-700">
                          ประเมินแล้ว
                        </span>
                      </div>

                      <span className="text-sm font-bold text-emerald-700">
                        {assessment.totalScore}{" "}
                        /{" "}
                        {assessment.maxScore}
                      </span>
                    </div>

                    {assessment.submittedAt && (
                      <p className="mt-2 text-xs text-emerald-600">
                        ประเมินเมื่อ{" "}
                        {formatDate(
                          assessment.submittedAt
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      🟠
                    </span>

                    <span className="font-bold text-amber-700">
                      ยังไม่ได้ประเมิน
                    </span>
                  </div>
                )}
              </div>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    `/evaluate/${target.id}`;
                }}
                className={`mt-4 w-full rounded-xl px-4 py-3 font-semibold transition active:scale-[0.99] ${
                  isCompleted
                    ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isCompleted
                  ? "ดู / แก้ไขการประเมิน"
                  : "ประเมินบุคคลนี้ →"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  dateString: string
) {
  try {
    return new Date(
      dateString
    ).toLocaleDateString(
      "th-TH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  } catch {
    return dateString;
  }
}