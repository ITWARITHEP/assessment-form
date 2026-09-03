"use client";

import { useState } from "react";
import { employees } from "@/data/employees";

export default function Home() {
  const [selectedId, setSelectedId] = useState("");

  const selected = employees.find(
    (employee) => employee.id === selectedId
  );

  const roleLabel = {
    executive: "👑 ผู้บริหารระดับสูง",
    director: "🏢 ผู้อำนวยการฝ่าย",
    area_manager: "🌎 ผู้จัดการเขต",
    branch_manager: "🏪 ผู้จัดการสาขา",
  };

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-2 text-4xl sm:mb-3 sm:text-5xl">
            📋
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Assessment Form
          </h1>

          <p className="mt-2 text-base text-slate-500 sm:text-lg">
            ระบบประเมินพนักงาน
          </p>

          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-blue-600 sm:mt-5 sm:w-24" />
        </div>

        {/* Login Card */}
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              เข้าสู่ระบบ
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              เลือกชื่อผู้ใช้งานเพื่อทดลองระบบ
            </p>
          </div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            ผู้ประเมิน
          </label>

          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:py-4"
          >
            <option value="">-- เลือกชื่อผู้ใช้งาน --</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} — {employee.roleName}
              </option>
            ))}
          </select>

          {/* Selected User */}
          {selected && (
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 sm:mt-6 sm:p-5">
              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm sm:h-14 sm:w-14 sm:text-2xl">
                  {selected.role === "executive" && "👑"}
                  {selected.role === "director" && "🏢"}
                  {selected.role === "area_manager" && "🌎"}
                  {selected.role === "branch_manager" && "🏪"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words font-bold text-slate-900">
                    {selected.name}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-blue-700">
                    {roleLabel[selected.role]}
                  </p>

                  {selected.region && (
                    <p className="mt-1 text-sm text-slate-500">
                      เขต: {selected.region}
                    </p>
                  )}

                  {selected.branch && (
                    <p className="mt-1 text-sm text-slate-500">
                      สาขา: {selected.branch}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            disabled={!selected}
            onClick={() => {
              if (selected) {
                localStorage.setItem(
                  "assessment_user",
                  selected.id
                );

                window.location.href = "/dashboard";
              }
            }}
            className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:mt-6 sm:py-4"
          >
            เข้าสู่ระบบ →
          </button>
        </div>

        {/* Role Cards */}
        <div className="mt-7 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <RoleCard
            icon="👑"
            title="ผู้บริหารระดับสูง"
            description="ประเมินผู้อำนวยการและทีมในเขตรับผิดชอบ"
          />

          <RoleCard
            icon="🏢"
            title="ผู้อำนวยการฝ่าย"
            description="ประเมินผู้จัดการเขตทุกเขต"
          />

          <RoleCard
            icon="🌎"
            title="ผู้จัดการเขต"
            description="ประเมินผู้อำนวยการและสาขาในเขต"
          />

          <RoleCard
            icon="🏪"
            title="ผู้จัดการสาขา"
            description="ประเมินสำนักงานใหญ่และผู้จัดการเขต"
          />
        </div>

        <p className="mt-7 pb-2 text-center text-xs text-slate-400 sm:mt-10 sm:text-sm">
          Assessment Form • ระบบประเมินพนักงาน
        </p>
      </div>
    </main>
  );
}

function RoleCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5">
      <div className="mb-2 text-2xl sm:mb-3 sm:text-3xl">
        {icon}
      </div>

      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}