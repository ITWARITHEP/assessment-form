"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as XLSX from "xlsx";

import { employees, headquarters } from "@/data/employees";
import { getEvaluationEvaluators } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";

type Result = {
  evaluatorId?: string;
  evaluatorName?: string;
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

type Target = {
  id: string;
  name: string;
  role: string;
  roleName: string;
  region?: string;
  branch?: string;
};

type TargetOverview = Target & {
  totalEvaluators: number;
  completedEvaluators: number;
  pendingEvaluators: number;
  results: Result[];
};

type FilterType =
  | "all"
  | "complete"
  | "progress"
  | "pending";

const getFormLabel = (formType: string) => {
  const labels: Record<string, string> = {
    director: "แบบประเมินผู้อำนวยการ",
    area_manager: "แบบประเมินผู้จัดการเขต",
    branch_manager: "แบบประเมินผู้จัดการสาขา",
    department: "แบบประเมินฝ่าย",
  };

  return labels[formType] || formType;
};

function formatDate(date?: string) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString(
      "th-TH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  } catch {
    return "-";
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case "director":
      return "🏢";

    case "area_manager":
      return "🌎";

    case "branch_manager":
      return "🏪";

    case "department":
      return "🏛️";

    default:
      return "👤";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "director":
      return "ผู้อำนวยการฝ่าย";

    case "area_manager":
      return "ผู้จัดการเขต";

    case "branch_manager":
      return "ผู้จัดการสาขา";

    case "department":
      return "ฝ่ายสำนักงานใหญ่";

    default:
      return role;
  }
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  const [overviews, setOverviews] =
    useState<TargetOverview[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [loadingData, setLoadingData] =
    useState(true);

  const [exporting, setExporting] =
    useState(false);

  /*
   * =========================================================
   * LOAD RESULTS FROM SUPABASE
   * =========================================================
   */

  useEffect(() => {
    let alive = true;

    setMounted(true);

    const loadData = async () => {
      try {
        /*
         * -----------------------------------------------------
         * ผู้ถูกประเมินจาก employees
         * -----------------------------------------------------
         */

        const employeeTargets: Target[] =
          employees
            .filter(
              (employee) =>
                employee.role !== "executive"
            )
            .map((employee) => ({
              id: employee.id,
              name: employee.name,
              role: employee.role,
              roleName: employee.roleName,
              region: employee.region,
              branch: employee.branch,
            }));

        /*
         * -----------------------------------------------------
         * ฝ่ายสำนักงานใหญ่
         * -----------------------------------------------------
         */

        const hqTargets: Target[] =
          headquarters.map(
            (name, index) => ({
              id: `hq-${index + 1}`,
              name,
              role: "department",
              roleName: "ฝ่ายสำนักงานใหญ่",
              region: "",
              branch: "",
            })
          );

        const allTargets = [
          ...employeeTargets,
          ...hqTargets,
        ];

        /*
         * -----------------------------------------------------
         * ดึงผลประเมินจาก SUPABASE
         * -----------------------------------------------------
         */

        const {
          data,
          error,
        } = await supabase
          .from("assessment_results")
          .select("*")
          .order("submitted_at", {
            ascending: false,
          });

        if (error) {
          console.error(
            "❌ ADMIN SUPABASE LOAD ERROR:",
            error
          );

          return;
        }

        /*
         * -----------------------------------------------------
         * แปลงข้อมูลจาก Supabase
         * snake_case -> camelCase
         * -----------------------------------------------------
         */

        const allResults: Result[] =
          (data || []).map(
            (row) => ({
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
                Number(
                  row.total_score || 0
                ),

              maxScore:
                Number(
                  row.max_score || 0
                ),

              suggestion:
                row.suggestion || "",

              submittedAt:
                row.submitted_at,
            })
          );

        /*
         * -----------------------------------------------------
         * รวมตามผู้ถูกประเมิน
         * -----------------------------------------------------
         */

        const resultData: TargetOverview[] =
          allTargets.map(
            (target) => {
              const evaluators =
                getEvaluationEvaluators(
                  target.id
                );

              const targetResults =
                allResults.filter(
                  (result) =>
                    result.targetId ===
                    target.id
                );

              /*
               * เอาเฉพาะ evaluator ที่มีสิทธิ์ประเมินจริง
               */
              const uniqueResults =
                evaluators
                  .map(
                    (evaluator) =>
                      targetResults.find(
                        (result) =>
                          result.evaluatorId ===
                          evaluator.id
                      )
                  )
                  .filter(
                    (
                      result
                    ): result is Result =>
                      Boolean(result)
                  );

              const totalEvaluators =
                evaluators.length;

              const completedEvaluators =
                uniqueResults.length;

              return {
                ...target,

                totalEvaluators,

                completedEvaluators,

                pendingEvaluators:
                  Math.max(
                    totalEvaluators -
                      completedEvaluators,
                    0
                  ),

                results:
                  uniqueResults,
              };
            }
          );

        if (alive) {
          setOverviews(resultData);
        }
      } catch (error) {
        console.error(
          "🔥 ADMIN LOAD ERROR:",
          error
        );
      } finally {
        if (alive) {
          setLoadingData(false);
        }
      }
    };

    loadData();

    /*
     * ---------------------------------------------------------
     * รีเฟรชจาก Supabase ทุก 2 วินาที
     * ---------------------------------------------------------
     */

    const interval =
      window.setInterval(
        loadData,
        2000
      );

    /*
     * ---------------------------------------------------------
     * โหลดใหม่เมื่อกลับเข้าหน้า
     * ---------------------------------------------------------
     */

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      alive = false;

      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  /*
   * =========================================================
   * FILTER
   * =========================================================
   */

  const filtered =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return overviews.filter(
        (item) => {
          const matchesSearch =
            !keyword ||
            item.name
              .toLowerCase()
              .includes(keyword) ||
            item.roleName
              .toLowerCase()
              .includes(keyword) ||
            item.region
              ?.toLowerCase()
              .includes(keyword) ||
            item.branch
              ?.toLowerCase()
              .includes(keyword);

          const isComplete =
            item.totalEvaluators > 0 &&
            item.completedEvaluators ===
              item.totalEvaluators;

          const isPending =
            item.completedEvaluators ===
            0;

          const isProgress =
            item.completedEvaluators >
              0 &&
            item.completedEvaluators <
              item.totalEvaluators;

          let matchesFilter = true;

          if (filter === "complete") {
            matchesFilter =
              isComplete;
          }

          if (filter === "progress") {
            matchesFilter =
              isProgress;
          }

          if (filter === "pending") {
            matchesFilter =
              isPending;
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      overviews,
      search,
      filter,
    ]);

  /*
   * =========================================================
   * STATS
   * =========================================================
   */

  const stats =
    useMemo(() => {
      const total =
        overviews.length;

      const complete =
        overviews.filter(
          (item) =>
            item.totalEvaluators >
              0 &&
            item.completedEvaluators ===
              item.totalEvaluators
        ).length;

      const progress =
        overviews.filter(
          (item) =>
            item.completedEvaluators >
              0 &&
            item.completedEvaluators <
              item.totalEvaluators
        ).length;

      const pending =
        overviews.filter(
          (item) =>
            item.completedEvaluators ===
            0
        ).length;

      const totalRequired =
        overviews.reduce(
          (sum, item) =>
            sum +
            item.totalEvaluators,
          0
        );

      const totalCompleted =
        overviews.reduce(
          (sum, item) =>
            sum +
            item.completedEvaluators,
          0
        );

      return {
        total,
        complete,
        progress,
        pending,
        totalRequired,
        totalCompleted,
      };
    }, [overviews]);

  /*
   * =========================================================
   * GROUPS
   * =========================================================
   */

  const roleGroups =
    useMemo(() => {
      return [
        {
          key: "director",
          title:
            "ผู้อำนวยการฝ่าย",
          icon: "🏢",
        },
        {
          key: "area_manager",
          title:
            "ผู้จัดการเขต",
          icon: "🌎",
        },
        {
          key: "branch_manager",
          title:
            "ผู้จัดการสาขา",
          icon: "🏪",
        },
        {
          key: "department",
          title:
            "ฝ่ายสำนักงานใหญ่",
          icon: "🏛️",
        },
      ];
    }, []);

  /*
   * =========================================================
   * OPEN RESULTS
   * =========================================================
   */

  const openResults = (
    targetId: string
  ) => {
    sessionStorage.setItem(
      "assessment_admin_access",
      "true"
    );

    window.location.href =
      `/results/${targetId}`;
  };

  /*
   * =========================================================
   * EXPORT EXCEL
   * =========================================================
   */

  const exportToExcel = () => {
    try {
      setExporting(true);

      /*
       * -----------------------------------------------------
       * เอาผลประเมินทั้งหมดที่ Admin มองเห็น
       * -----------------------------------------------------
       */

      const rows = overviews.flatMap(
        (item) =>
          item.results.map(
            (result) => ({
              "ผู้ถูกประเมิน":
                item.name,

              "ตำแหน่งผู้ถูกประเมิน":
                getRoleLabel(
                  item.role
                ),

              "ตำแหน่ง":
                item.roleName || "",

              "เขต":
                item.region || "",

              "สาขา":
                item.branch || "",

              "ผู้ประเมิน":
                result.evaluatorName ||
                "",

              "ตำแหน่งผู้ประเมิน":
                result.evaluatorRole ||
                "",

              "แบบประเมิน":
                getFormLabel(
                  result.formType
                ),

              "คะแนนรวม":
                result.totalScore,

              "คะแนนเต็ม":
                result.maxScore,

              "เปอร์เซ็นต์":
                result.maxScore > 0
                  ? Math.round(
                      (result.totalScore /
                        result.maxScore) *
                        100
                    )
                  : 0,

              "ข้อเสนอแนะ":
                result.suggestion ||
                "",

              "วันที่ประเมิน":
                formatDate(
                  result.submittedAt
                ),
            })
          )
      );

      if (rows.length === 0) {
        alert(
          "ยังไม่มีข้อมูลสำหรับ Export"
        );

        return;
      }

      /*
       * -----------------------------------------------------
       * สร้าง Worksheet
       * -----------------------------------------------------
       */

      const worksheet =
        XLSX.utils.json_to_sheet(
          rows
        );

      /*
       * -----------------------------------------------------
       * ตั้งความกว้างคอลัมน์
       * -----------------------------------------------------
       */

      worksheet["!cols"] = [
        { wch: 28 },
        { wch: 24 },
        { wch: 28 },
        { wch: 15 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 32 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 40 },
        { wch: 24 },
      ];

      /*
       * -----------------------------------------------------
       * สร้าง Workbook
       * -----------------------------------------------------
       */

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "ผลการประเมิน"
      );

      /*
       * -----------------------------------------------------
       * ชื่อไฟล์
       * -----------------------------------------------------
       */

      const now =
        new Date();

      const date =
        now.toLocaleDateString(
          "sv-SE",
          {
            timeZone:
              "Asia/Bangkok",
          }
        );

      const fileName =
        `ผลการประเมินพนักงาน_${date}.xlsx`;

      /*
       * -----------------------------------------------------
       * ดาวน์โหลด Excel จริง
       * -----------------------------------------------------
       */

      XLSX.writeFile(
        workbook,
        fileName
      );
    } catch (error) {
      console.error(
        "❌ EXPORT EXCEL ERROR:",
        error
      );

      alert(
        "ไม่สามารถ Export Excel ได้ กรุณาลองใหม่"
      );
    } finally {
      setExporting(false);
    }
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-4xl">
            📊
          </div>

          <p className="mt-3 font-semibold text-slate-600">
            กำลังโหลดข้อมูล...
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
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg shadow-blue-100">
              📊
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Assessment System
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Admin Overview
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-xs font-semibold text-emerald-600 sm:block">
              ● Supabase Live
            </div>

            <button
              onClick={() => {
                sessionStorage.removeItem(
                  "assessment_admin_access"
                );

                window.location.href =
                  "/dashboard";
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="mb-7">
          <p className="text-sm font-medium text-slate-500">
            Assessment Overview
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            ภาพรวมการประเมิน
          </h2>

          <p className="mt-2 text-slate-500">
            ข้อมูลจาก Supabase อัปเดตอัตโนมัติทุก 2 วินาที
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="👥"
            title="ผู้ถูกประเมิน"
            value={stats.total}
            description="ทั้งหมด"
          />

          <StatCard
            icon="✅"
            title="ประเมินครบ"
            value={stats.complete}
            description="ครบทุกผู้ประเมิน"
          />

          <StatCard
            icon="🔄"
            title="กำลังประเมิน"
            value={stats.progress}
            description="มีบางคนประเมินแล้ว"
          />

          <StatCard
            icon="⏳"
            title="ยังไม่เริ่ม"
            value={stats.pending}
            description="ยังไม่มีผู้ประเมิน"
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                ความคืบหน้ารวม
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                ประเมินแล้ว{" "}
                <span className="font-bold text-blue-600">
                  {stats.totalCompleted}
                </span>{" "}
                จาก{" "}
                <span className="font-bold">
                  {stats.totalRequired}
                </span>{" "}
                รายการประเมิน
              </p>
            </div>

            <div className="text-2xl font-black text-blue-600">
              {stats.totalRequired
                ? Math.round(
                    (stats.totalCompleted /
                      stats.totalRequired) *
                      100
                  )
                : 0}
              %
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${
                  stats.totalRequired
                    ? Math.min(
                        (stats.totalCompleted /
                          stats.totalRequired) *
                          100,
                        100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                ผู้ถูกประเมิน
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                คลิกเพื่อดูผู้ประเมินและผลคะแนน
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={exportToExcel}
                disabled={
                  exporting ||
                  overviews.every(
                    (item) =>
                      item.results.length ===
                      0
                  )
                }
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {exporting
                  ? "⏳ กำลัง Export..."
                  : "📊 Export Excel"}
              </button>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="🔎 ค้นหาชื่อ / ตำแหน่ง / เขต..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:w-80"
              />

              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                <FilterButton
                  active={filter === "all"}
                  onClick={() =>
                    setFilter("all")
                  }
                >
                  ทั้งหมด
                </FilterButton>

                <FilterButton
                  active={
                    filter === "complete"
                  }
                  onClick={() =>
                    setFilter("complete")
                  }
                >
                  ครบ
                </FilterButton>

                <FilterButton
                  active={
                    filter === "progress"
                  }
                  onClick={() =>
                    setFilter("progress")
                  }
                >
                  กำลังทำ
                </FilterButton>

                <FilterButton
                  active={
                    filter === "pending"
                  }
                  onClick={() =>
                    setFilter("pending")
                  }
                >
                  รอ
                </FilterButton>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-8">
          {roleGroups.map(
            (group) => {
              const items =
                filtered.filter(
                  (item) =>
                    item.role ===
                    group.key
                );

              if (
                items.length === 0
              ) {
                return null;
              }

              return (
                <section
                  key={group.key}
                >
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {group.icon}{" "}
                        {group.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {items.length} รายการ
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {items.map(
                      (item) => {
                        const percent =
                          item.totalEvaluators
                            ? Math.round(
                                (item.completedEvaluators /
                                  item.totalEvaluators) *
                                  100
                              )
                            : 0;

                        const complete =
                          item.totalEvaluators >
                            0 &&
                          item.completedEvaluators ===
                            item.totalEvaluators;

                        const pending =
                          item.completedEvaluators ===
                          0;

                        return (
                          <div
                            key={
                              item.id
                            }
                            className={`rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                              complete
                                ? "border-emerald-200"
                                : pending
                                  ? "border-slate-200"
                                  : "border-blue-200"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                                {getRoleIcon(
                                  item.role
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold leading-6 text-slate-900">
                                  {
                                    item.name
                                  }
                                </h4>

                                <p className="mt-1 text-sm text-blue-600">
                                  {getRoleLabel(
                                    item.role
                                  )}
                                </p>

                                {item.roleName && (
                                  <p className="mt-1 text-sm text-slate-500">
                                    {
                                      item.roleName
                                    }
                                  </p>
                                )}

                                {item.region && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    เขต{" "}
                                    {
                                      item.region
                                    }
                                  </p>
                                )}

                                {item.branch && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    📍{" "}
                                    {
                                      item.branch
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-6">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">
                                  ความคืบหน้าการประเมิน
                                </span>

                                <span
                                  className={`text-sm font-black ${
                                    complete
                                      ? "text-emerald-600"
                                      : pending
                                        ? "text-slate-400"
                                        : "text-blue-600"
                                  }`}
                                >
                                  {
                                    item.completedEvaluators
                                  }{" "}
                                  /{" "}
                                  {
                                    item.totalEvaluators
                                  } คน
                                </span>
                              </div>

                              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    complete
                                      ? "bg-emerald-500"
                                      : "bg-blue-500"
                                  }`}
                                  style={{
                                    width: `${percent}%`,
                                  }}
                                />
                              </div>

                              <div className="mt-2 flex items-center justify-between">
                                <span
                                  className={`text-xs font-semibold ${
                                    complete
                                      ? "text-emerald-600"
                                      : pending
                                        ? "text-slate-400"
                                        : "text-blue-600"
                                  }`}
                                >
                                  {complete
                                    ? "✓ ประเมินครบทุกคน"
                                    : pending
                                      ? "ยังไม่มีการประเมิน"
                                      : "กำลังดำเนินการ"}
                                </span>

                                <span className="text-xs text-slate-400">
                                  {percent}%
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                              <div className="grid grid-cols-2 gap-3 text-center">
                                <div>
                                  <p className="text-lg font-black text-emerald-600">
                                    {
                                      item.completedEvaluators
                                    }
                                  </p>

                                  <p className="text-[11px] text-slate-500">
                                    ประเมินแล้ว
                                  </p>
                                </div>

                                <div>
                                  <p className="text-lg font-black text-amber-500">
                                    {
                                      item.pendingEvaluators
                                    }
                                  </p>

                                  <p className="text-[11px] text-slate-500">
                                    ยังไม่ได้ประเมิน
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                openResults(
                                  item.id
                                )
                              }
                              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 active:scale-[0.99]"
                            >
                              👁️ ดูผลการประเมิน
                            </button>

                            {item.results.length >
                              0 && (
                              <div className="mt-4 space-y-2">
                                {item.results
                                  .slice(0, 3)
                                  .map(
                                    (
                                      result
                                    ) => (
                                      <div
                                        key={`${item.id}-${result.evaluatorId}`}
                                        className="rounded-xl border border-slate-100 bg-white px-3 py-2"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="min-w-0 truncate text-xs font-semibold text-slate-700">
                                            {
                                              result.evaluatorName
                                            }
                                          </p>

                                          <span className="shrink-0 text-sm font-black text-blue-600">
                                            {
                                              result.totalScore
                                            }
                                            /
                                            {
                                              result.maxScore
                                            }
                                          </span>
                                        </div>

                                        <div className="mt-1 flex items-center justify-between gap-2">
                                          <p className="truncate text-[10px] text-slate-400">
                                            {getFormLabel(
                                              result.formType
                                            )}
                                          </p>

                                          <p className="shrink-0 text-[10px] text-slate-400">
                                            {formatDate(
                                              result.submittedAt
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                              </div>
                            )}
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

        {loadingData &&
          overviews.length === 0 && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 font-semibold text-slate-600">
                กำลังโหลดข้อมูลจาก Supabase...
              </p>
            </div>
          )}

        {!loadingData &&
          filtered.length === 0 && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <div className="text-5xl">
                🔎
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                ไม่พบข้อมูล
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                ลองเปลี่ยนคำค้นหาหรือตัวกรอง
              </p>
            </div>
          )}
      </div>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
          {icon}
        </div>

        <span className="text-xs font-semibold text-slate-400">
          {title}
        </span>
      </div>

      <div className="mt-5 text-3xl font-black text-slate-900">
        {value}
      </div>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}