"use client";

import { useEffect, useMemo, useState } from "react";
import { employees, headquarters } from "@/data/employees";
import { getEvaluationEvaluators } from "@/lib/permissions";

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

  suggestion?: string;

  submittedAt: string;
};

type EvaluatorResult = {
  id: string;
  name: string;
  roleName: string;
  result: AssessmentResult | null;
};

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [targetId, setTargetId] =
    useState("");

  const [targetName, setTargetName] =
    useState("");

  const [targetRole, setTargetRole] =
    useState("");

  const [results, setResults] =
    useState<EvaluatorResult[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * =========================================================
   * LOAD
   * =========================================================
   */

  useEffect(() => {
    async function loadPage() {
      try {
        const resolvedParams =
          await params;

        const id =
          resolvedParams.id;

        /*
         * =====================================================
         * ADMIN ACCESS
         *
         * หน้า Results นี้ให้ Admin เข้าดูเท่านั้น
         * =====================================================
         */

        const adminAccess =
          sessionStorage.getItem(
            "assessment_admin_access"
          );

        if (adminAccess !== "true") {
          window.location.href =
            "/dashboard";

          return;
        }

        setTargetId(id);

        /*
         * =====================================================
         * หา "ผู้ถูกประเมิน"
         * =====================================================
         */

        const employeeTarget =
          employees.find(
            (employee) =>
              employee.id === id
          );

        if (employeeTarget) {
          setTargetName(
            employeeTarget.name
          );

          setTargetRole(
            employeeTarget.roleName
          );
        } else if (
          id.startsWith("hq-")
        ) {
          const index =
            Number(
              id.replace(
                "hq-",
                ""
              )
            ) - 1;

          const hqName =
            headquarters[index];

          if (hqName) {
            setTargetName(
              hqName
            );

            setTargetRole(
              "ฝ่ายสำนักงานใหญ่"
            );
          }
        }

        /*
         * =====================================================
         * หา "ผู้ประเมินทั้งหมด"
         * ของบุคคลนี้
         * =====================================================
         */

        const evaluators =
          getEvaluationEvaluators(
            id
          );

        /*
         * =====================================================
         * โหลดผลของผู้ประเมินแต่ละคน
         * =====================================================
         */

        const evaluatorResults: EvaluatorResult[] =
          evaluators.map(
            (evaluator) => {
              let result:
                | AssessmentResult
                | null = null;

              /*
               * Key ใหม่
               *
               * assessment_result_
               * evaluatorId_targetId
               */

              const key =
                `assessment_result_${evaluator.id}_${id}`;

              const savedResult =
                localStorage.getItem(
                  key
                );

              if (savedResult) {
                try {
                  const parsed =
                    JSON.parse(
                      savedResult
                    );

                  if (
                    parsed &&
                    parsed.targetId === id &&
                    parsed.evaluatorId ===
                      evaluator.id
                  ) {
                    result =
                      parsed;
                  }
                } catch {
                  result = null;
                }
              }

              /*
               * =================================================
               * รองรับกรณีข้อมูลถูกเก็บด้วย key อื่น
               * =================================================
               */

              if (!result) {
                for (
                  let index = 0;
                  index <
                  localStorage.length;
                  index++
                ) {
                  const storageKey =
                    localStorage.key(
                      index
                    );

                  if (
                    !storageKey ||
                    !storageKey.startsWith(
                      "assessment_result_"
                    )
                  ) {
                    continue;
                  }

                  try {
                    const saved =
                      localStorage.getItem(
                        storageKey
                      );

                    if (!saved) {
                      continue;
                    }

                    const parsed =
                      JSON.parse(
                        saved
                      );

                    if (
                      parsed &&
                      parsed.targetId ===
                        id &&
                      parsed.evaluatorId ===
                        evaluator.id
                    ) {
                      result =
                        parsed;

                      break;
                    }
                  } catch {
                    // ข้ามข้อมูลที่อ่านไม่ได้
                  }
                }
              }

              return {
                id: evaluator.id,
                name: evaluator.name,
                roleName:
                  evaluator.roleName,
                result,
              };
            }
          );

        setResults(
          evaluatorResults
        );
      } catch (error) {
        console.error(
          "โหลดผลการประเมินไม่สำเร็จ:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [params]);

  /*
   * =========================================================
   * จำนวนผู้ประเมิน
   * =========================================================
   */

  const completedCount =
    useMemo(() => {
      return results.filter(
        (item) =>
          item.result !== null
      ).length;
    }, [results]);

  const totalEvaluators =
    results.length;

  const pendingCount =
    totalEvaluators -
    completedCount;

  const progressPercent =
    totalEvaluators > 0
      ? Math.round(
          (completedCount /
            totalEvaluators) *
            100
        )
      : 0;

  /*
   * =========================================================
   * คะแนนเฉลี่ย
   * =========================================================
   */

  const averageScore =
    useMemo(() => {
      const completed =
        results
          .map(
            (item) =>
              item.result
          )
          .filter(
            (
              result
            ): result is AssessmentResult =>
              result !== null
          );

      if (
        completed.length === 0
      ) {
        return null;
      }

      const total =
        completed.reduce(
          (sum, result) =>
            sum +
            result.totalScore,
          0
        );

      const max =
        completed.reduce(
          (sum, result) =>
            sum +
            result.maxScore,
          0
        );

      if (!max) {
        return null;
      }

      return Math.round(
        (total / max) *
          100
      );
    }, [results]);

  /*
   * =========================================================
   * EXPORT
   * =========================================================
   */

  const exportExcel = () => {
    if (!targetId) {
      return;
    }

    const rows: string[][] = [];

    rows.push([
      "ผลการประเมินพนักงาน",
    ]);

    rows.push([
      "ผู้ถูกประเมิน",
      targetName,
    ]);

    rows.push([
      "ตำแหน่ง",
      targetRole,
    ]);

    rows.push([]);

    rows.push([
      "ผู้ประเมิน",
      "ตำแหน่ง",
      "สถานะ",
      "คะแนน",
      "คะแนนเต็ม",
      "เปอร์เซ็นต์",
      "วันที่ประเมิน",
      "ข้อเสนอแนะ",
    ]);

    results.forEach(
      (item) => {
        if (!item.result) {
          rows.push([
            item.name,
            item.roleName,
            "ยังไม่ได้ประเมิน",
            "",
            "",
            "",
            "",
            "",
          ]);

          return;
        }

        const result =
          item.result;

        const percent =
          result.maxScore > 0
            ? Math.round(
                (result.totalScore /
                  result.maxScore) *
                  100
              )
            : 0;

        rows.push([
          result.evaluatorName,
          result.evaluatorRole,
          "ประเมินแล้ว",
          String(
            result.totalScore
          ),
          String(
            result.maxScore
          ),
          `${percent}%`,
          result.submittedAt
            ? new Date(
                result.submittedAt
              ).toLocaleString(
                "th-TH"
              )
            : "",
          result.suggestion ||
            "",
        ]);
      }
    );

    const csv =
      rows
        .map((row) =>
          row
            .map((value) => {
              const text =
                String(
                  value ?? ""
                );

              return `"${text.replace(
                /"/g,
                '""'
              )}"`;
            })
            .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        ["\ufeff" + csv],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `ผลการประเมิน_${targetName}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm">
          <div className="text-3xl">
            ⏳
          </div>

          <p className="mt-3 font-semibold text-slate-700">
            กำลังโหลดผลการประเมิน...
          </p>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-slate-100">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Assessment System
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              ผลการประเมินรายบุคคล
            </h1>
          </div>

          <button
            onClick={() => {
              window.location.href =
                "/admin";
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← กลับ Admin
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* =====================================================
            TARGET HERO
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-7 text-white shadow-xl shadow-blue-100">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-blue-100">
                ผู้ถูกประเมิน
              </p>

              <h2 className="mt-1 text-3xl font-black">
                {targetName ||
                  "ไม่พบชื่อบุคคล"}
              </h2>

              <p className="mt-2 text-blue-100">
                {targetRole ||
                  "ไม่พบตำแหน่ง"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-3xl font-black">
                  {completedCount}
                </div>

                <p className="mt-1 text-xs text-blue-100">
                  ประเมินแล้ว
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-3xl font-black">
                  {pendingCount}
                </div>

                <p className="mt-1 text-xs text-blue-100">
                  ยังไม่ได้ประเมิน
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-3xl font-black">
                  {totalEvaluators}
                </div>

                <p className="mt-1 text-xs text-blue-100">
                  ผู้ประเมินทั้งหมด
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PROGRESS
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                📊 ความคืบหน้าการประเมิน
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                ผู้ประเมินส่งแบบประเมินแล้ว
              </p>
            </div>

            <div className="text-2xl font-black text-blue-600">
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

          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>
              ประเมินแล้ว{" "}
              {completedCount} คน
            </span>

            <span>
              {progressPercent}%
            </span>
          </div>
        </section>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              ผู้ประเมินทั้งหมด
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {totalEvaluators}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              คน
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm text-emerald-600">
              ประเมินแล้ว
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-700">
              {completedCount}
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              คน
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm text-amber-600">
              ยังไม่ได้ประเมิน
            </p>

            <p className="mt-2 text-3xl font-black text-amber-700">
              {pendingCount}
            </p>

            <p className="mt-1 text-xs text-amber-600">
              คน
            </p>
          </div>
        </section>

        {/* =====================================================
            EVALUATORS HEADER
        ===================================================== */}

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                👥 ผู้ประเมิน
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                รายชื่อผู้ที่มีสิทธิ์ประเมินบุคคลนี้
              </p>
            </div>

            <div className="flex items-center gap-3">
              {averageScore !==
                null && (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
                  <p className="text-[10px] text-slate-400">
                    คะแนนเฉลี่ย
                  </p>

                  <p className="text-xl font-black text-blue-600">
                    {averageScore}%
                  </p>
                </div>
              )}

              <button
                onClick={
                  exportExcel
                }
                className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                📊 Export Excel
              </button>
            </div>
          </div>

          {/* ===================================================
              EVALUATOR CARDS
          =================================================== */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map(
              (item) => {
                const result =
                  item.result;

                const percent =
                  result &&
                  result.maxScore >
                    0
                    ? Math.round(
                        (result.totalScore /
                          result.maxScore) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl border bg-white p-5 shadow-sm ${
                      result
                        ? "border-slate-200"
                        : "border-dashed border-slate-300"
                    }`}
                  >
                    {/* PERSON */}

                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                          result
                            ? "bg-blue-50"
                            : "bg-slate-100"
                        }`}
                      >
                        {result
                          ? "👤"
                          : "⏳"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold leading-6 text-slate-900">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-blue-600">
                          {item.roleName}
                        </p>
                      </div>
                    </div>

                    {/* COMPLETED */}

                    {result ? (
                      <>
                        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs text-slate-400">
                                คะแนนที่ได้
                              </p>

                              <p className="mt-1 text-3xl font-black text-slate-900">
                                {
                                  result.totalScore
                                }

                                <span className="ml-1 text-base font-medium text-slate-400">
                                  /
                                  {
                                    result.maxScore
                                  }
                                </span>
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-black text-blue-600">
                                {
                                  percent
                                }
                                %
                              </p>

                              <p className="text-xs text-slate-400">
                                คะแนน
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-600">
                            🟢 ประเมินแล้ว
                          </span>

                          <span className="text-slate-400">
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
                          type="button"
                          onClick={() => {
                            window.location.href =
                              `/results/${targetId}/reviewer/${item.id}`;
                          }}
                          className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
                        >
                          👁️ ดูคะแนนรายข้อ →
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center">
                          <div className="text-3xl">
                            ⏳
                          </div>

                          <p className="mt-2 font-bold text-slate-600">
                            ยังไม่ได้ประเมิน
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            รอผู้ประเมินส่งแบบประเมิน
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* NO EVALUATORS */}

          {results.length ===
            0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">
                📋
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-800">
                ไม่พบผู้ประเมิน
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                บุคคลนี้ยังไม่มีผู้ที่มีสิทธิ์ประเมิน
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}