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
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">📋</div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Assessment Form
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            ระบบประเมินพนักงาน
          </p>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-blue-600" />
        </div>

        {/* Login Card */}
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
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
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
            <div className="mt-6 rounded-2xl bg-blue-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  {selected.role === "executive" && "👑"}
                  {selected.role === "director" && "🏢"}
                  {selected.role === "area_manager" && "🌎"}
                  {selected.role === "branch_manager" && "🏪"}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {selected.name}
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
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
            className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            เข้าสู่ระบบ →
          </button>
        </div>

        {/* Role Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <p className="mt-10 text-center text-sm text-slate-400">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 text-3xl">{icon}</div>

      <h3 className="font-bold text-slate-900">{title}</h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}