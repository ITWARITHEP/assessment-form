"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { employees, headquarters } from "@/data/employees";

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

const scoreLabels: Record<number, string> = {
  1: "ต้องปรับปรุง",
  2: "พอใช้",
  3: "ปานกลาง",
  4: "ดี",
  5: "ดีมาก",
};

const scoreColors: Record<
  number,
  string
> = {
  1: "border-red-200 bg-red-50 text-red-700",
  2: "border-orange-200 bg-orange-50 text-orange-700",
  3: "border-yellow-200 bg-yellow-50 text-yellow-700",
  4: "border-blue-200 bg-blue-50 text-blue-700",
  5: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const formLabels: Record<string, string> = {
  director: "แบบประเมินผู้อำนวยการ",
  area_manager: "แบบประเมินผู้จัดการเขต",
  branch_manager: "แบบประเมินผู้จัดการสาขา",
  department: "แบบประเมินฝ่าย",
};

function formatDate(
  value?: string
) {
  if (!value) {
    return "-";
  }

  try {
    return new Date(
      value
    ).toLocaleString(
      "th-TH",
      {
        dateStyle: "long",
        timeStyle: "short",
      }
    );
  } catch {
    return "-";
  }
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
    typeof params.reviewerId ===
    "string"
      ? params.reviewerId
      : Array.isArray(
            params.reviewerId
          )
        ? params.reviewerId[0]
        : "";

  const [result, setResult] =
    useState<AssessmentResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [notFound, setNotFound] =
    useState(false);

  useEffect(() => {
    function loadResult() {
      try {
        /*
         * =====================================================
         * ADMIN ONLY
         * =====================================================
         */
        const adminAccess =
          sessionStorage.getItem(
            "assessment_admin_access"
          );

        if (
          adminAccess !== "true"
        ) {
          window.location.href =
            "/dashboard";
          return;
        }

        if (
          !targetId ||
          !reviewerId
        ) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        /*
         * =====================================================
         * อ่านผลจาก key หลัก
         * =====================================================
         */
        const primaryKey =
          `assessment_result_${reviewerId}_${targetId}`;

        let foundResult:
          | AssessmentResult
          | null = null;

        const primaryResult =
          localStorage.getItem(
            primaryKey
          );

        if (primaryResult) {
          try {
            const parsed =
              JSON.parse(
                primaryResult
              );

            if (
              parsed &&
              parsed.targetId ===
                targetId &&
              parsed.evaluatorId ===
                reviewerId
            ) {
              foundResult = parsed;
            }
          } catch {
            foundResult = null;
          }
        }

        /*
         * =====================================================
         * รองรับข้อมูลเก่า
         * =====================================================
         */
        if (!foundResult) {
          for (
            let index = 0;
            index <
            localStorage.length;
            index++
          ) {
            const key =
              localStorage.key(
                index
              );

            if (
              !key ||
              !key.startsWith(
                "assessment_result_"
              )
            ) {
              continue;
            }

            try {
              const raw =
                localStorage.getItem(
                  key
                );

              if (!raw) {
                continue;
              }

              const parsed =
                JSON.parse(raw);

              if (
                parsed &&
                parsed.targetId ===
                  targetId &&
                parsed.evaluatorId ===
                  reviewerId
              ) {
                foundResult =
                  parsed;
                break;
              }
            } catch {
              // ข้ามข้อมูลที่อ่านไม่ได้
            }
          }
        }

        /*
         * =====================================================
         * ถ้าเจอผล
         * =====================================================
         */
        if (foundResult) {
          setResult(
            foundResult
          );
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error(
          "ไม่สามารถโหลดรายละเอียดผลการประเมิน:",
          error
        );

        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [
    targetId,
    reviewerId,
  ]);

  /*
   * =========================================================
   * Loading
   * =========================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-700">
            กำลังโหลดรายละเอียดผลการประเมิน...
          </p>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * Not Found
   * =========================================================
   */

  if (
    notFound ||
    !result
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-9">
          <div className="text-5xl">
            📋
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
            ไม่พบผลการประเมิน
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            ไม่พบข้อมูลผลการประเมินของผู้ประเมินคนนี้
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                `/results/${targetId}`;
            }}
            className="mt-6 w-full rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            ← กลับผลการประเมิน
          </button>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * เตรียมข้อมูล
   * =========================================================
   */

  const targetEmployee =
    employees.find(
      (employee) =>
        employee.id ===
        result.targetId
    );

  let targetName =
    result.targetName ||
    targetEmployee?.name ||
    "";

  let targetRole =
    result.targetRole ||
    targetEmployee?.roleName ||
    "";

  if (
    result.targetId.startsWith(
      "hq-"
    )
  ) {
    const hqIndex =
      Number(
        result.targetId.replace(
          "hq-",
          ""
        )
      ) - 1;

    const hqName =
      headquarters[hqIndex];

    if (hqName) {
      targetName = hqName;
      targetRole =
        "ฝ่ายสำนักงานใหญ่";
    }
  }

  const reviewer =
    employees.find(
      (employee) =>
        employee.id ===
        reviewerId
    );

  const evaluatorName =
    result.evaluatorName ||
    reviewer?.name ||
    "-";

  const evaluatorRole =
    result.evaluatorRole ||
    reviewer?.roleName ||
    "-";

  const percentage =
    result.maxScore > 0
      ? Math.round(
          (result.totalScore /
            result.maxScore) *
            100
        )
      : 0;

  const answerEntries =
    Object.entries(
      result.answers || {}
    ).sort(
      ([a], [b]) =>
        a.localeCompare(
          b,
          undefined,
          {
            numeric: true,
          }
        )
    );

  /*
   * =========================================================
   * Main
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-slate-100 pb-10 sm:pb-16">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-600 sm:text-sm">
              Assessment Form
            </p>

            <h1 className="truncate text-base font-bold text-slate-900 sm:text-xl">
              รายละเอียดผลการประเมิน
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                `/results/${targetId}`;
            }}
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
          >
            ← กลับ
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-5 sm:px-5 sm:py-8">
        {/* ===================================================
            TARGET
        =================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-5 text-white sm:px-7 sm:py-7">
            <p className="text-xs font-medium text-blue-100 sm:text-sm">
              ผู้ถูกประเมิน
            </p>

            <h2 className="mt-1 break-words text-xl font-bold leading-tight sm:text-3xl">
              {targetName}
            </h2>

            <p className="mt-2 break-words text-sm text-blue-100 sm:text-base">
              {targetRole}
            </p>
          </div>
        </section>

        {/* ===================================================
            EVALUATOR
        =================================================== */}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl sm:h-14 sm:w-14">
              👤
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-400 sm:text-sm">
                ผู้ประเมิน
              </p>

              <h2 className="mt-1 break-words text-lg font-bold text-slate-900 sm:text-xl">
                {evaluatorName}
              </h2>

              <p className="mt-1 break-words text-sm text-blue-600">
                {evaluatorRole}
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            SCORE SUMMARY
        =================================================== */}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500 sm:text-sm">
                คะแนนรวม
              </p>

              <p className="mt-1 text-3xl font-black text-slate-900">
                {result.totalScore}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                จาก {result.maxScore} คะแนน
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">
              <p className="text-xs text-blue-600 sm:text-sm">
                คิดเป็น
              </p>

              <p className="mt-1 text-3xl font-black text-blue-700">
                {percentage}%
              </p>

              <p className="mt-1 text-sm text-blue-500">
                ของคะแนนเต็ม
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500 sm:text-sm">
                แบบประเมิน
              </p>

              <p className="mt-1 text-sm font-bold leading-6 text-slate-800 sm:text-base">
                {formLabels[
                  result.formType
                ] ||
                  "แบบประเมิน"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400">
                วันที่ประเมิน
              </p>

              <p className="mt-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                {formatDate(
                  result.submittedAt
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400">
                จำนวนข้อที่ตอบ
              </p>

              <p className="mt-1 text-base font-bold text-slate-800">
                {answerEntries.length} ข้อ
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            ANSWERS
        =================================================== */}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                📊 คะแนนรายข้อ
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                รายละเอียดคะแนนที่ผู้ประเมินให้ในแต่ละข้อ
              </p>
            </div>

            <div className="shrink-0 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600">
              {answerEntries.length} ข้อ
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {answerEntries.map(
              ([
                questionId,
                scoreValue,
              ]) => {
                const score =
                  Number(
                    scoreValue
                  );

                return (
                  <div
                    key={
                      questionId
                    }
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 sm:text-base">
                          ข้อ{" "}
                          {
                            questionId
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                          {scoreLabels[
                            score
                          ] ||
                            "ไม่ระบุ"}
                        </p>
                      </div>

                      <div
                        className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-bold sm:px-4 sm:text-base ${
                          scoreColors[
                            score
                          ] ||
                          "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {score} / 5
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {answerEntries.length ===
            0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center">
              <div className="text-3xl">
                📝
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-600">
                ยังไม่มีข้อมูลคะแนนรายข้อ
              </p>
            </div>
          )}
        </section>

        {/* ===================================================
            SUGGESTION
        =================================================== */}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            💬 สิ่งที่ควรพัฒนาปรับปรุง / ข้อเสนอแนะ
          </h2>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            {result.suggestion ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
                {result.suggestion}
              </p>
            ) : (
              <div className="py-3 text-center">
                <div className="text-3xl">
                  💬
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  ไม่มีข้อเสนอแนะ
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            FOOTER ACTION
        =================================================== */}

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-slate-900">
                รายละเอียดผลการประเมิน
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {evaluatorName} ประเมิน{" "}
                {targetName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  `/results/${targetId}`;
              }}
              className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700 active:scale-[0.99] sm:w-auto"
            >
              ← กลับรายชื่อผู้ประเมิน
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}