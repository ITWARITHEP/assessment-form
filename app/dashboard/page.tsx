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
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [evaluator, setEvaluator] =
    useState<Employee | null>(null);

  const [targets, setTargets] = useState<
    EvaluationTarget[]
  >([]);

  const [completedTargetIds, setCompletedTargetIds] =
    useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        /*
         * =====================================================
         * ตรวจสอบผู้ใช้งาน
         * =====================================================
         *
         * localStorage ใช้เก็บ "คนที่ล็อกอิน"
         * เท่านั้น
         *
         * ไม่ใช้เก็บผลการประเมิน
         */
        const savedId =
          localStorage.getItem(
            "assessment_user"
          );

        if (!savedId) {
          window.location.href = "/";
          return;
        }

        const user = employees.find(
          (employee) =>
            employee.id === savedId
        );

        if (!user) {
          localStorage.removeItem(
            "assessment_user"
          );

          window.location.href = "/";
          return;
        }

        /*
         * =====================================================
         * โหลดสิทธิ์ผู้ถูกประเมิน
         * =====================================================
         */
        const evaluationTargets =
          getEvaluationTargets(user);

        setEvaluator(user);
        setTargets(evaluationTargets);

        /*
         * =====================================================
         * โหลดสถานะจาก Supabase
         * =====================================================
         *
         * Supabase เป็นแหล่งข้อมูลจริงว่า
         * ผู้ประเมินคนนี้ประเมินใครไปแล้ว
         */
        if (evaluationTargets.length > 0) {
          const targetIds =
            evaluationTargets.map(
              (target) => target.id
            );

          const { data, error } =
            await supabase
              .from("assessment_results")
              .select(
                "target_id"
              )
              .eq(
                "evaluator_id",
                user.id
              )
              .in(
                "target_id",
                targetIds
              );

          if (error) {
            console.error(
              "โหลดสถานะการประเมินไม่สำเร็จ:",
              error
            );
          } else {
            const completedIds =
              new Set<string>(
                (data || []).map(
                  (row) =>
                    row.target_id
                )
              );

            setCompletedTargetIds(
              completedIds
            );
          }
        }
      } catch (error) {
        console.error(
          "โหลด Dashboard ไม่สำเร็จ:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
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
    targets.filter((target) =>
      completedTargetIds.has(
        target.id
      )
    ).length;

  const pendingCount =
    targets.length - completedCount;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-700">
            กำลังโหลดระบบ...
          </p>
        </div>
      </main>
    );
  }

  if (!evaluator) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* =====================================================
          Header
      ====================================================== */}
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
            User information
        ====================================================== */}
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

            <div className="grid grid-cols-3 gap-3">
              {/* ทั้งหมด */}
              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-3xl font-bold">
                  {targets.length}
                </div>

                <div className="text-sm text-blue-100">
                  ทั้งหมด
                </div>
              </div>

              {/* ทำแล้ว */}
              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-3xl font-bold">
                  {completedCount}
                </div>

                <div className="text-sm text-blue-100">
                  ประเมินแล้ว
                </div>
              </div>

              {/* เหลือ */}
              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center backdrop-blur">
                <div className="text-3xl font-bold">
                  {pendingCount}
                </div>

                <div className="text-sm text-blue-100">
                  คงเหลือ
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            Page title
        ====================================================== */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            👥 ผู้ที่ฉันต้องประเมิน
          </h2>

          <p className="mt-1 text-slate-500">
            ระบบแสดงเฉพาะบุคคลที่คุณมีสิทธิ์ประเมิน
          </p>
        </div>

        {/* =====================================================
            Summary cards
        ====================================================== */}
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
            Targets
        ====================================================== */}
        <div className="space-y-8">
          <TargetSection
            title="🏢 ผู้อำนวยการฝ่าย"
            subtitle="รายชื่อผู้อำนวยการฝ่ายที่สามารถประเมินได้"
            targets={
              groupedTargets.director
            }
            getCategoryName={
              getCategoryName
            }
            completedTargetIds={
              completedTargetIds
            }
          />

          <TargetSection
            title="🌎 ผู้จัดการเขต"
            subtitle="ผู้จัดการเขตที่อยู่ในสิทธิ์การประเมิน"
            targets={
              groupedTargets.area_manager
            }
            getCategoryName={
              getCategoryName
            }
            completedTargetIds={
              completedTargetIds
            }
          />

          <TargetSection
            title="🏪 ผู้จัดการสาขา"
            subtitle="ผู้จัดการสาขาที่อยู่ในเขตที่รับผิดชอบ"
            targets={
              groupedTargets.branch_manager
            }
            getCategoryName={
              getCategoryName
            }
            completedTargetIds={
              completedTargetIds
            }
          />

          <TargetSection
            title="🏛️ ฝ่ายสำนักงานใหญ่"
            subtitle="ฝ่ายสำนักงานใหญ่ที่สามารถประเมินได้"
            targets={
              groupedTargets.headquarters
            }
            getCategoryName={
              getCategoryName
            }
            completedTargetIds={
              completedTargetIds
            }
          />
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   Summary Card
============================================================ */

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

/* ============================================================
   Target Section
============================================================ */

function TargetSection({
  title,
  subtitle,
  targets,
  getCategoryName,
  completedTargetIds,
}: {
  title: string;
  subtitle: string;
  targets: EvaluationTarget[];
  getCategoryName: (
    category: EvaluationTarget["category"]
  ) => string;
  completedTargetIds: Set<string>;
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
          const isCompleted =
            completedTargetIds.has(
              target.id
            );

          return (
            <div
              key={target.id}
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 ${
                isCompleted
                  ? "border-emerald-200"
                  : "border-slate-200 hover:border-blue-300 hover:shadow-lg"
              }`}
            >
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
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold leading-6 text-slate-900">
                      {target.name}
                    </h4>

                    {isCompleted && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        ✓ ประเมินแล้ว
                      </span>
                    )}
                  </div>

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

              {isCompleted ? (
                <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                  ✓ คุณประเมินบุคคลนี้เรียบร้อยแล้ว
                </div>
              ) : (
                <button
                  onClick={() => {
                    window.location.href =
                      `/evaluate/${target.id}`;
                  }}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  ประเมินบุคคลนี้ →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}