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

export default function DashboardPage() {
  const [evaluator, setEvaluator] =
    useState<Employee | null>(null);

  const [targets, setTargets] = useState<
    EvaluationTarget[]
  >([]);

  const [completedIds, setCompletedIds] =
    useState<string[]>([]);

  useEffect(() => {
    const savedId = localStorage.getItem(
      "assessment_user"
    );

    if (!savedId) {
      window.location.href = "/";
      return;
    }

    const user = employees.find(
      (employee) => employee.id === savedId
    );

    if (!user) {
      localStorage.removeItem(
        "assessment_user"
      );

      window.location.href = "/";
      return;
    }

    setEvaluator(user);

    const evaluationTargets =
      getEvaluationTargets(user);

    setTargets(evaluationTargets);

    // =====================================================
    // ตรวจว่าผู้ประเมินคนนี้ประเมินใครไปแล้วบ้าง
    // =====================================================
    const completed: string[] = [];

    evaluationTargets.forEach((target) => {
      const key =
        `assessment_result_${user.id}_${target.id}`;

      const result =
        localStorage.getItem(key);

      if (result) {
        completed.push(target.id);
      }
    });

    setCompletedIds(completed);
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
    completedIds.length;

  const pendingCount =
    targets.length - completedCount;

  if (!evaluator) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="text-center text-slate-500">
          <div className="mb-3 text-4xl">
            ⏳
          </div>

          <div className="text-sm sm:text-base">
            กำลังโหลดระบบ...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* =====================================================
          Header
      ===================================================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
              Assessment Form
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
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
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-95 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* =====================================================
          Main Content
      ===================================================== */}
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        {/* ===================================================
            User information
        =================================================== */}
        <section className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white shadow-lg shadow-blue-100 sm:mb-8 sm:rounded-3xl sm:p-7">
          <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
            {/* User */}
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur sm:h-20 sm:w-20 sm:rounded-3xl sm:text-4xl">
                {getRoleIcon(evaluator.role)}
              </div>

              <div className="min-w-0">
                <p className="text-xs text-blue-100 sm:text-sm">
                  ผู้ประเมิน
                </p>

                <h2 className="mt-0.5 truncate text-lg font-bold sm:mt-1 sm:text-2xl">
                  {evaluator.name}
                </h2>

                <p className="mt-0.5 truncate text-xs text-blue-100 sm:mt-1 sm:text-sm">
                  {evaluator.roleName}
                </p>

                {evaluator.region && (
                  <p className="mt-0.5 truncate text-xs text-blue-100 sm:mt-1">
                    เขต: {evaluator.region}
                  </p>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
              <div className="rounded-xl bg-white/15 px-3 py-3 text-center backdrop-blur sm:min-w-[110px] sm:rounded-2xl sm:px-5 sm:py-4">
                <div className="text-xl font-bold sm:text-3xl">
                  {targets.length}
                </div>

                <div className="mt-0.5 text-[10px] text-blue-100 sm:mt-1 sm:text-sm">
                  ทั้งหมด
                </div>
              </div>

              <div className="rounded-xl bg-emerald-500/30 px-3 py-3 text-center backdrop-blur sm:min-w-[110px] sm:rounded-2xl sm:px-5 sm:py-4">
                <div className="text-xl font-bold sm:text-3xl">
                  {completedCount}
                </div>

                <div className="mt-0.5 text-[10px] text-blue-50 sm:mt-1 sm:text-sm">
                  ประเมินแล้ว
                </div>
              </div>

              <div className="rounded-xl bg-white/15 px-3 py-3 text-center backdrop-blur sm:min-w-[110px] sm:rounded-2xl sm:px-5 sm:py-4">
                <div className="text-xl font-bold sm:text-3xl">
                  {pendingCount}
                </div>

                <div className="mt-0.5 text-[10px] text-blue-100 sm:mt-1 sm:text-sm">
                  คงเหลือ
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            Page title
        =================================================== */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            👥 ผู้ที่ฉันต้องประเมิน
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            ระบบแสดงเฉพาะบุคคลที่คุณมีสิทธิ์ประเมิน
          </p>
        </div>

        {/* ===================================================
            Progress
        =================================================== */}
        {targets.length > 0 && (
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 sm:text-base">
                  📊 ความคืบหน้าการประเมิน
                </p>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  ประเมินแล้ว {completedCount} จาก{" "}
                  {targets.length} คน
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-lg font-bold text-blue-600 sm:text-xl">
                  {Math.round(
                    (completedCount /
                      targets.length) *
                      100
                  )}
                  %
                </div>
              </div>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${
                    (completedCount /
                      targets.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </section>
        )}

        {/* ===================================================
            Summary cards
        =================================================== */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <SummaryCard
            icon="🏢"
            title="ผู้อำนวยการฝ่าย"
            count={groupedTargets.director.length}
          />

          <SummaryCard
            icon="🌎"
            title="ผู้จัดการเขต"
            count={groupedTargets.area_manager.length}
          />

          <SummaryCard
            icon="🏪"
            title="ผู้จัดการสาขา"
            count={groupedTargets.branch_manager.length}
          />

          <SummaryCard
            icon="🏛️"
            title="สำนักงานใหญ่"
            count={groupedTargets.headquarters.length}
          />
        </div>

        {/* ===================================================
            Targets
        =================================================== */}
        <div className="space-y-6 sm:space-y-8">
          <TargetSection
            title="🏢 ผู้อำนวยการฝ่าย"
            subtitle="รายชื่อผู้อำนวยการฝ่ายที่สามารถประเมินได้"
            targets={groupedTargets.director}
            getCategoryName={getCategoryName}
            completedIds={completedIds}
          />

          <TargetSection
            title="🌎 ผู้จัดการเขต"
            subtitle="ผู้จัดการเขตที่อยู่ในสิทธิ์การประเมิน"
            targets={groupedTargets.area_manager}
            getCategoryName={getCategoryName}
            completedIds={completedIds}
          />

          <TargetSection
            title="🏪 ผู้จัดการสาขา"
            subtitle="ผู้จัดการสาขาที่อยู่ในเขตที่รับผิดชอบ"
            targets={groupedTargets.branch_manager}
            getCategoryName={getCategoryName}
            completedIds={completedIds}
          />

          <TargetSection
            title="🏛️ ฝ่ายสำนักงานใหญ่"
            subtitle="ฝ่ายสำนักงานใหญ่ที่สามารถประเมินได้"
            targets={groupedTargets.headquarters}
            getCategoryName={getCategoryName}
            completedIds={completedIds}
          />
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   Summary Card
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
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-2xl sm:text-3xl">
          {icon}
        </div>

        <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {count}
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold leading-5 text-slate-800 sm:mt-4 sm:text-sm">
        {title}
      </p>

      <p className="mt-0.5 text-[11px] text-slate-500 sm:mt-1 sm:text-sm">
        รายการ
      </p>
    </div>
  );
}

/* =========================================================
   Target Section
========================================================= */

function TargetSection({
  title,
  subtitle,
  targets,
  getCategoryName,
  completedIds,
}: {
  title: string;
  subtitle: string;
  targets: EvaluationTarget[];
  getCategoryName: (
    category: EvaluationTarget["category"]
  ) => string;
  completedIds: string[];
}) {
  if (targets.length === 0) {
    return null;
  }

  return (
    <section>
      {/* Section Header */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
          {title}
        </h3>

        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {subtitle}
        </p>
      </div>

      {/* Target Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {targets.map((target) => {
          const completed =
            completedIds.includes(
              target.id
            );

          return (
            <div
              key={target.id}
              className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl sm:p-5 ${
                completed
                  ? "border-emerald-200"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              {/* Person */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl sm:h-14 sm:w-14 sm:text-2xl ${
                    completed
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

                {/* Information */}
                <div className="min-w-0 flex-1">
                  <h4 className="break-words text-sm font-bold leading-6 text-slate-900 sm:text-base">
                    {target.name}
                  </h4>

                  <p className="mt-0.5 text-xs font-semibold text-blue-600 sm:mt-1 sm:text-sm">
                    {getCategoryName(
                      target.category
                    )}
                  </p>

                  {target.roleName !==
                    "ฝ่ายสำนักงานใหญ่" && (
                    <p className="mt-0.5 break-words text-xs text-slate-500 sm:mt-1 sm:text-sm">
                      {target.roleName}
                    </p>
                  )}

                  {target.branch && (
                    <p className="mt-0.5 break-words text-xs text-slate-500 sm:mt-1 sm:text-sm">
                      📍 {target.branch}
                    </p>
                  )}

                  {target.region && (
                    <p className="mt-0.5 text-[11px] text-slate-400 sm:mt-1 sm:text-xs">
                      เขต {target.region}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              {completed && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:mt-4 sm:text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                    ✓
                  </span>

                  เราประเมินคนนี้แล้ว
                </div>
              )}

              {/* Button */}
              <button
                onClick={() => {
                  window.location.href =
                    `/evaluate/${target.id}`;
                }}
                className={`mt-3 min-h-12 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] sm:mt-4 sm:text-base ${
                  completed
                    ? "bg-slate-700 hover:bg-slate-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {completed
                  ? "✏️ แก้ไขการประเมิน"
                  : "📝 ประเมินบุคคลนี้ →"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}