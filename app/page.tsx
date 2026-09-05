"use client";

import { useMemo, useState } from "react";
import { employees } from "@/data/employees";

export default function Home() {
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  const selected = employees.find(
    (employee) => employee.id === selectedId
  );

  const roleLabel = {
    executive: "👑 ผู้บริหารระดับสูง",
    director: "🏢 ผู้อำนวยการฝ่าย",
    area_manager: "🌎 ผู้จัดการเขต",
    branch_manager: "🏪 ผู้จัดการสาขา",
  };

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(keyword) ||
        employee.roleName.toLowerCase().includes(keyword) ||
        employee.region?.toLowerCase().includes(keyword) ||
        employee.branch?.toLowerCase().includes(keyword)
      );
    });
  }, [search]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
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
            แบบประเมินการปฏิบัติงานกลุ่มบริษัท วารีเทพ จำกัด
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
              ค้นหาและเลือกชื่อของคุณก่อนเข้าสู่ระบบ
            </p>
          </div>

          {/* Search */}
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            🔎 ค้นหาชื่อพนักงาน
          </label>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);

                // ถ้าเปลี่ยนคำค้น ให้ยกเลิกชื่อเดิม
                if (selectedId) {
                  setSelectedId("");
                }
              }}
              placeholder="พิมพ์ชื่อ เช่น วรภูมิ / วนัชพร"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:py-4"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedId("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="ล้างการค้นหา"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Result Count */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-400 sm:text-sm">
              {search
                ? `พบ ${filteredEmployees.length} รายการ`
                : `ทั้งหมด ${employees.length} คน`}
            </p>

            {selected && (
              <p className="text-xs font-semibold text-emerald-600 sm:text-sm">
                ✅ เลือกแล้ว
              </p>
            )}
          </div>

          {/* Employee List */}
          <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                const isSelected =
                  selectedId === employee.id;

                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() =>
                      handleSelect(employee.id)
                    }
                    className={`w-full rounded-xl border p-3 text-left transition active:scale-[0.99] sm:p-4 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100"
                        }`}
                      >
                        {employee.role ===
                          "executive" && "👑"}

                        {employee.role ===
                          "director" && "🏢"}

                        {employee.role ===
                          "area_manager" && "🌎"}

                        {employee.role ===
                          "branch_manager" && "🏪"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="break-words font-bold text-slate-900">
                          {employee.name}
                        </div>

                        <div className="mt-1 break-words text-sm leading-5 text-blue-600">
                          {employee.roleName}
                        </div>

                        {employee.region && (
                          <div className="mt-1 text-xs text-slate-500">
                            เขต: {employee.region}
                          </div>
                        )}

                        {employee.branch && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            สาขา: {employee.branch}
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <div className="shrink-0 pt-1 text-blue-600">
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center">
                <div className="text-4xl">🔍</div>

                <p className="mt-3 font-semibold text-slate-700">
                  ไม่พบชื่อที่ค้นหา
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  ลองพิมพ์ชื่อหรือนามสกุลใหม่อีกครั้ง
                </p>
              </div>
            )}
          </div>

          {/* Selected User */}
          {selected && (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:mt-6 sm:p-5">
              <div className="mb-3 text-xs font-semibold text-blue-600">
                ยืนยันผู้ใช้งาน
              </div>

              <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm sm:h-14 sm:w-14 sm:text-2xl">
                  {selected.role === "executive" &&
                    "👑"}

                  {selected.role === "director" &&
                    "🏢"}

                  {selected.role === "area_manager" &&
                    "🌎"}

                  {selected.role === "branch_manager" &&
                    "🏪"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words font-bold text-slate-900">
                    {selected.name}
                  </p>

                  <p className="mt-1 break-words text-sm leading-5 text-blue-700">
                    {roleLabel[selected.role]}
                  </p>

                  <p className="mt-1 break-words text-sm leading-5 text-slate-600">
                    {selected.roleName}
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

          {/* Login */}
          <button
            disabled={!selected}
            onClick={() => {
              if (!selected) {
                return;
              }

              localStorage.setItem(
                "assessment_user",
                selected.id
              );

              window.location.href = "/dashboard";
            }}
            className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:mt-6 sm:py-4"
          >
            {selected
              ? "เข้าสู่ระบบ →"
              : "กรุณาเลือกชื่อก่อนเข้าสู่ระบบ"}
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