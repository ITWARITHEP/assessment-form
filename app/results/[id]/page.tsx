"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { employees, headquarters } from "@/data/employees";
import { getEvaluationEvaluators } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";

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

        /*
         * =====================================================
         * ตรวจสอบผู้ใช้งาน
         * =====================================================
         */
        const savedUser =
          localStorage.getItem(
            "assessment_user"
          );

        if (!savedUser) {
          window.location.href = "/";
          return;
        }

        const currentUser =
          employees.find(
            (employee) =>
              employee.id === savedUser
          );

        if (!currentUser) {
          localStorage.removeItem(
            "assessment_user"
          );

          window.location.href = "/";
          return;
        }

        /*
         * =====================================================
         * หาข้อมูลบุคคลที่ถูกประเมิน
         * =====================================================
         */
        const target =
          employees.find(
            (employee) =>
              employee.id === id
          );

        const isHeadquarters =
          id.startsWith("hq-");

        if (isHeadquarters) {
          const hq =
            (await import("@/data/employees")).headquarters[
              Number(
                id.replace("hq-", "")
              ) - 1
            ];

          setTargetName(
            hq || "ฝ่ายสำนักงานใหญ่"
          );

          setTargetRole(
            "ฝ่ายสำนักงานใหญ่"
          );
        } else if (target) {
          setTargetName(
            target.name
          );

          setTargetRole(
            target.roleName
          );
        }

        /*
         * =====================================================
         * หาผู้ที่มีสิทธิ์ประเมินบุคคลนี้ทั้งหมด
         * =====================================================
         */
        const evaluators =
          getEvaluationEvaluators(id);

        /*
         * =====================================================
         * โหลดผลจาก Supabase เท่านั้น
         * =====================================================
         */
        const { data, error } =
          await supabase
            .from(
              "assessment_results"
            )
            .select(
              `
                id,
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
                submitted_at
              `
            )
            .eq(
              "target_id",
              id
            );

        if (error) {
          console.error(
            "ไม่สามารถโหลดผลการประเมินจาก Supabase:",
            error
          );

          throw error;
        }

        const evaluatorResults:
          EvaluatorResult[] =
          evaluators.map(
            (evaluator) => {
              const row =
                (data || []).find(
                  (item) =>
                    item.evaluator_id ===
                    evaluator.id
                );

              if (!row) {
                return {
                  id: evaluator.id,
                  name: evaluator.name,
                  roleName:
                    evaluator.roleName,
                  result: null,
                };
              }

              const result:
                AssessmentResult = {
                evaluatorId:
                  row.evaluator_id,

                evaluatorName:
                  row.evaluator_name,

                evaluatorRole:
                  row.evaluator_role,

                targetId:
                  row.target_id,

                targetName:
                  row.target_name,

                targetRole:
                  row.target_role,

                formType:
                  row.form_type,

                answers:
                  row.answers || {},

                totalScore:
                  row.total_score,

                maxScore:
                  row.max_score,

                suggestion:
                  row.suggestion || "",

                submittedAt:
                  row.submitted_at,
              };

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
          "ไม่สามารถโหลดผลการประเมิน:",
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
   * เธเธณเธเธงเธเธเธเธ—เธตเนเธเธฃเธฐเน€เธกเธดเธเน€เธชเธฃเนเธ
   * =========================================================
   */

  const completedCount = useMemo(() => {
    return results.filter(
      (item) => item.result !== null
    ).length;
  }, [results]);

  const totalEvaluators = results.length;

  /*
   * =========================================================
   * Progress
   * =========================================================
   */

  const progressPercent =
    totalEvaluators > 0
      ? Math.round(
          (completedCount / totalEvaluators) * 100
        )
      : 0;

  /*
   * =========================================================
   * เธเธฐเนเธเธเน€เธเธฅเธตเนเธข
   * =========================================================
   */

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

  /*
   * =========================================================
   * Export Excel
   * =========================================================
   */

  const exportExcel = () => {
    if (!targetId) {
      return;
    }

    /*
     * -------------------------------------------------------
     * Sheet 1 : เธเธฅเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธ
     * -------------------------------------------------------
     */

    const rows = results.map((item) => {
      if (!item.result) {
        return {
          "เธเธนเนเธเธฃเธฐเน€เธกเธดเธ": item.name,
          "เธ•เธณเนเธซเธเนเธ": item.roleName,
          "เธชเธ–เธฒเธเธฐ": "เธขเธฑเธเนเธกเนเนเธ”เนเธเธฃเธฐเน€เธกเธดเธ",
          "เธเธฐเนเธเธ": "",
          "เธเธฐเนเธเธเน€เธ•เนเธก": "",
          "เน€เธเธญเธฃเนเน€เธเนเธเธ•เน": "",
          "เธงเธฑเธเธ—เธตเนเธเธฃเธฐเน€เธกเธดเธ": "",
          "เธเนเธญเน€เธชเธเธญเนเธเธฐ": "",
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
        "เธเธนเนเธเธฃเธฐเน€เธกเธดเธ":
          result.evaluatorName,

        "เธ•เธณเนเธซเธเนเธ":
          result.evaluatorRole,

        "เธชเธ–เธฒเธเธฐ":
          "เธเธฃเธฐเน€เธกเธดเธเนเธฅเนเธง",

        "เธเธฐเนเธเธ":
          result.totalScore,

        "เธเธฐเนเธเธเน€เธ•เนเธก":
          result.maxScore,

        "เน€เธเธญเธฃเนเน€เธเนเธเธ•เน":
          `${percent}%`,

        "เธงเธฑเธเธ—เธตเนเธเธฃเธฐเน€เธกเธดเธ":
          result.submittedAt
            ? new Date(
                result.submittedAt
              ).toLocaleString("th-TH")
            : "",

        "เธเนเธญเน€เธชเธเธญเนเธเธฐ":
          result.suggestion || "",
      };
    });

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    /*
     * -------------------------------------------------------
     * เธเธณเธซเธเธ”เธเธงเธฒเธกเธเธงเนเธฒเธเธเธญเธฅเธฑเธกเธเน
     * -------------------------------------------------------
     */

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

    /*
     * -------------------------------------------------------
     * Sheet 2 : เธชเธฃเธธเธ
     * -------------------------------------------------------
     */

    const summaryRows = [
      ["เธเธฅเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธเธเธเธฑเธเธเธฒเธ"],
      [],
      ["เธเธนเนเธ–เธนเธเธเธฃเธฐเน€เธกเธดเธ", targetName],
      ["เธ•เธณเนเธซเธเนเธ", targetRole],
      [],
      ["เธเธนเนเธเธฃเธฐเน€เธกเธดเธเธ—เธฑเนเธเธซเธกเธ”", totalEvaluators],
      ["เธเธฃเธฐเน€เธกเธดเธเนเธฅเนเธง", completedCount],
      ["เธฃเธญเธเธฃเธฐเน€เธกเธดเธ", totalEvaluators - completedCount],
      ["เธเธงเธฒเธกเธเธทเธเธซเธเนเธฒ", `${progressPercent}%`],
      ["เธเธฐเนเธเธเน€เธเธฅเธตเนเธข", `${averagePercent}%`],
    ];

    const summarySheet =
      XLSX.utils.aoa_to_sheet(
        summaryRows
      );

    summarySheet["!cols"] = [
      { wch: 28 },
      { wch: 45 },
    ];

    /*
     * -------------------------------------------------------
     * เธชเธฃเนเธฒเธ Workbook
     * -------------------------------------------------------
     */

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "เธชเธฃเธธเธ"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "เธเธฅเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธ"
    );

    /*
     * -------------------------------------------------------
     * เธ”เธฒเธงเธเนเนเธซเธฅเธ”เน€เธเนเธ Excel เธเธฃเธดเธ
     * -------------------------------------------------------
     */

    const safeName =
      targetName
        .replace(/[\\/:*?"<>|]/g, "")
        .trim() || "เธเธนเนเธ–เธนเธเธเธฃเธฐเน€เธกเธดเธ";

    XLSX.writeFile(
      workbook,
      `เธเธฅเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธ_${safeName}.xlsx`
    );
  };

  /*
   * =========================================================
   * Loading
   * =========================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white px-6 py-8 text-center shadow-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-700">
            เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเธฅเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธ...
          </p>
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
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">
              Assessment Form
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              เธเธฅเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธเธเธเธฑเธเธเธฒเธ
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
          >
            โ เธเธฅเธฑเธ Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        {/* EMPLOYEE */}

        <section className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white shadow-xl shadow-blue-100 sm:mb-6 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs text-blue-100 sm:text-sm">
                เธเธนเนเธ–เธนเธเธเธฃเธฐเน€เธกเธดเธ
              </p>

              <h2 className="mt-1 break-words text-xl font-bold leading-tight sm:text-3xl">
                {targetName ||
                  "เนเธกเนเธเธเธเนเธญเธกเธนเธฅ"}
              </h2>

              <p className="mt-2 text-sm text-blue-100 sm:text-base">
                {targetRole || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:min-w-[300px]">
              <div className="rounded-2xl bg-white/15 px-3 py-4 text-center backdrop-blur sm:px-6">
                <div className="text-2xl font-bold sm:text-3xl">
                  {completedCount}
                  <span className="text-base font-medium sm:text-xl">
                    {" "}
                    / {totalEvaluators}
                  </span>
                </div>

                <div className="mt-1 text-xs text-blue-100 sm:text-sm">
                  เธเธนเนเธเธฃเธฐเน€เธกเธดเธ
                </div>
              </div>

              <div className="rounded-2xl bg-white/15 px-3 py-4 text-center backdrop-blur sm:px-6">
                <div className="text-2xl font-bold sm:text-3xl">
                  {averagePercent}%
                </div>

                <div className="mt-1 text-xs text-blue-100 sm:text-sm">
                  เธเธฐเนเธเธเน€เธเธฅเธตเนเธข
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
                ๐“ เธเธงเธฒเธกเธเธทเธเธซเธเนเธฒเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธ
              </h3>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                เธเธณเธเธงเธเธเธนเนเธเธฃเธฐเน€เธกเธดเธเธ—เธตเนเธชเนเธเนเธเธเธเธฃเธฐเน€เธกเธดเธเนเธฅเนเธง
              </p>
            </div>

            <div className="text-lg font-bold text-blue-600 sm:text-xl">
              {completedCount} /{" "}
              {totalEvaluators} เธเธ
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
            {progressPercent}% เน€เธชเธฃเนเธเนเธฅเนเธง
          </div>
        </section>

        {/* ACTION */}

        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              ๐‘ฅ เธฃเธฒเธขเธเธทเนเธญเธเธนเนเธเธฃเธฐเน€เธกเธดเธ
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              เธเธฅเธดเธเธ”เธนเธเธฐเนเธเธเธฃเธฒเธขเธเนเธญเธเธญเธเธเธนเนเธเธฃเธฐเน€เธกเธดเธเนเธ•เนเธฅเธฐเธเธ
            </p>
          </div>

          <button
            onClick={exportExcel}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] sm:w-auto"
          >
            ๐“ Export Excel
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
                {/* เธเธนเนเธเธฃเธฐเน€เธกเธดเธ */}

                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl sm:h-14 sm:w-14 sm:text-2xl ${
                      result
                        ? "bg-blue-50"
                        : "bg-slate-100"
                    }`}
                  >
                    {result ? "๐‘ค" : "โณ"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold leading-6 text-slate-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-blue-600">
                      {item.roleName}
                    </p>
                  </div>
                </div>

                {result ? (
                  <>
                    {/* เธเธฐเนเธเธ */}

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 sm:mt-5">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500 sm:text-sm">
                            เธเธฐเนเธเธเธ—เธตเนเนเธ”เน
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
                            เธเธฐเนเธเธเธเธฃเธฐเน€เธกเธดเธ
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* เธชเธ–เธฒเธเธฐ */}

                    <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        โ… เธเธฃเธฐเน€เธกเธดเธเนเธฅเนเธง
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

                    {/* เธ”เธนเธฃเธฒเธขเธเนเธญ */}

                    <button
                      onClick={() => {
                        window.location.href =
                          `/results/${targetId}/reviewer/${item.id}`;
                      }}
                      className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                    >
                      ๐‘ เธ”เธนเธเธฐเนเธเธเธฃเธฒเธขเธเนเธญ โ’
                    </button>
                  </>
                ) : (
                  <>
                    {/* เธขเธฑเธเนเธกเนเธเธฃเธฐเน€เธกเธดเธ */}

                    <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-center sm:mt-5">
                      <div className="text-3xl">
                        โณ
                      </div>

                      <p className="mt-2 font-semibold text-slate-600">
                        เธขเธฑเธเนเธกเนเนเธ”เนเธเธฃเธฐเน€เธกเธดเธ
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        เธฃเธญเธเธนเนเธเธฃเธฐเน€เธกเธดเธเธชเนเธเนเธเธเธเธฃเธฐเน€เธกเธดเธ
                      </p>
                    </div>

                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-center text-xs text-slate-400 sm:mt-4 sm:text-sm">
                      โณ เธฃเธญเธเธฅเธเธฒเธฃเธเธฃเธฐเน€เธกเธดเธ
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* EMPTY */}

        {results.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="text-5xl">
              ๐“
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800 sm:text-xl">
              เธขเธฑเธเนเธกเนเธกเธตเธเธนเนเธเธฃเธฐเน€เธกเธดเธ
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              เนเธกเนเธเธเธเธนเนเธ—เธตเนเธกเธตเธชเธดเธ—เธเธดเนเธเธฃเธฐเน€เธกเธดเธเธเธธเธเธเธฅเธเธตเน
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
