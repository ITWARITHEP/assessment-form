"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Employee,
  employees,
} from "@/data/employees";

/*
 * =========================================================
 * PIN ผู้ใช้งานทั้งหมด 78 คน
 *
 * 6 ผู้บริหารระดับสูง
 * 13 ผู้อำนวยการฝ่าย
 * 10 ผู้จัดการเขต
 * 49 ผู้จัดการสาขา
 * =========================================================
 */
const employeePins: Record<string, string> = {
  // =========================
  // ผู้บริหารระดับสูง 6 คน
  // =========================
  "exec-001": "5831",
  "exec-002": "2746",
  "exec-003": "8614",
  "exec-004": "3927",
  "exec-005": "7153",
  "exec-006": "4289",

  // =========================
  // ผู้อำนวยการฝ่าย 13 คน
  // =========================
  "dir-001": "6418",
  "dir-002": "2057",
  "dir-003": "9342",
  "dir-004": "5176",
  "dir-005": "7831",
  "dir-006": "3469",
  "dir-007": "8524",
  "dir-008": "4195",
  "dir-009": "6273",
  "dir-010": "1708",
  "dir-011": "9685",
  "dir-012": "5341",
  "dir-013": "2864",

  // =========================
  // ผู้จัดการเขต 10 คน
  // =========================
  "area-001": "7016",
  "area-002": "4538",
  "area-003": "8192",
  "area-004": "3625",
  "area-005": "9471",
  "area-006": "5804",
  "area-007": "2369",
  "area-008": "6741",
  "area-009": "1285",
  "area-010": "8357",

  // =========================
  // ผู้จัดการสาขา 49 คน
  // =========================
  "branch-001": "5162",
  "branch-002": "7834",
  "branch-003": "2491",
  "branch-004": "6047",
  "branch-005": "9316",
  "branch-006": "3582",
  "branch-007": "8425",
  "branch-008": "1679",
  "branch-009": "7254",
  "branch-010": "4938",
  "branch-011": "8165",
  "branch-012": "2741",
  "branch-013": "6503",
  "branch-014": "9827",
  "branch-015": "3416",
  "branch-016": "5689",
  "branch-017": "2074",
  "branch-018": "7541",
  "branch-019": "4296",
  "branch-020": "8632",
  "branch-021": "1957",
  "branch-022": "6374",
  "branch-023": "4801",
  "branch-024": "9163",
  "branch-025": "3527",
  "branch-026": "7085",
  "branch-027": "2614",
  "branch-028": "8459",
  "branch-029": "5731",
  "branch-030": "1248",
  "branch-031": "6942",
  "branch-032": "3197",
  "branch-033": "8570",
  "branch-034": "4625",
  "branch-035": "7318",
  "branch-036": "2854",
  "branch-037": "6409",
  "branch-038": "9781",
  "branch-039": "5137",
  "branch-040": "2068",
  "branch-041": "8243",
  "branch-042": "3915",
  "branch-043": "7652",
  "branch-044": "1486",
  "branch-045": "9325",
  "branch-046": "5740",
  "branch-047": "3186",
  "branch-048": "6871",
  "branch-049": "4507",
};

export default function LoginPage() {
  const [search, setSearch] =
    useState("");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [pin, setPin] =
    useState("");

  const [pinError, setPinError] =
    useState("");

  /*
   * =========================================================
   * รายชื่อค้นหา
   * =========================================================
   */
  const filteredEmployees = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return employees;
    }

    return employees.filter(
      (employee) => {
        const text = [
          employee.name,
          employee.roleName,
          employee.region,
          employee.branch,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(keyword);
      }
    );
  }, [search]);

  /*
   * =========================================================
   * พนักงานที่เลือก
   * =========================================================
   */
  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.id === selectedId
      ) || null,
    [selectedId]
  );

  /*
   * =========================================================
   * เลือกพนักงาน
   * =========================================================
   */
  const handleSelectEmployee = (
    employee: Employee
  ) => {
    setSelectedId(employee.id);
    setPin("");
    setPinError("");
  };

  /*
   * =========================================================
   * Login
   * =========================================================
   */
  const handleLogin = () => {
    if (!selectedEmployee) {
      setPinError(
        "กรุณาเลือกพนักงานก่อน"
      );
      return;
    }

    if (pin.length !== 4) {
      setPinError(
        "กรุณากรอกรหัส PIN 4 หลัก"
      );
      return;
    }

    const correctPin =
      employeePins[selectedEmployee.id];

    if (!correctPin) {
      setPinError(
        "ยังไม่ได้กำหนด PIN สำหรับผู้ใช้งานนี้"
      );
      return;
    }

    if (pin !== correctPin) {
      setPinError(
        "รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่"
      );

      setPin("");
      return;
    }

    /*
     * เก็บเฉพาะ employee.id
     * ระบบเดิมใช้งานค่าเดียวกันนี้อยู่แล้ว
     */
    localStorage.setItem(
      "assessment_user",
      selectedEmployee.id
    );

    window.location.href =
      "/dashboard";
  };

  /*
   * =========================================================
   * Role Icon
   * =========================================================
   */
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

  /*
   * =========================================================
   * Main
   * =========================================================
   */
  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* =================================================
            Header
        ================================================= */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-3xl shadow-lg shadow-blue-200">
            📋
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">
            ระบบประเมินพนักงาน
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            บริษัท วารีเทพ จำกัด
          </p>
        </div>

        {/* =================================================
            Login Card
        ================================================= */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">

          {/* Top Blue */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-6 text-white sm:px-8 sm:py-8">
            <h2 className="text-xl font-bold sm:text-2xl">
              🔐 เข้าสู่ระบบ
            </h2>

            <p className="mt-1 text-sm text-blue-100 sm:text-base">
              เลือกชื่อของคุณ แล้วกรอกรหัส PIN 4 หลัก
            </p>
          </div>

          <div className="p-4 sm:p-8">

            {/* =================================================
                Search
            ================================================= */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-bold text-slate-800 sm:text-base">
                🔎 ค้นหาชื่อพนักงาน
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                }}
                placeholder="พิมพ์ชื่อ / ตำแหน่ง / เขต / สาขา"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-14 sm:text-base"
              />
            </div>

            {/* =================================================
                Employee List
            ================================================= */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-800 sm:text-base">
                  รายชื่อพนักงาน
                </p>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  พบ{" "}
                  {filteredEmployees.length}{" "}
                  คน
                </span>
              </div>

              <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1 sm:space-y-3">
                {filteredEmployees.map(
                  (employee) => {
                    const selected =
                      employee.id ===
                      selectedId;

                    return (
                      <button
                        type="button"
                        key={employee.id}
                        onClick={() =>
                          handleSelectEmployee(
                            employee
                          )
                        }
                        className={`w-full rounded-2xl border p-3 text-left transition active:scale-[0.99] sm:p-4 ${
                          selected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl sm:h-12 sm:w-12 ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100"
                            }`}
                          >
                            {getRoleIcon(
                              employee.role
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                              {employee.name}
                            </p>

                            <p className="mt-0.5 truncate text-xs font-semibold text-blue-600 sm:text-sm">
                              {employee.roleName}
                            </p>

                            <div className="mt-0.5 flex min-w-0 flex-wrap gap-x-2 text-[11px] text-slate-500 sm:text-xs">
                              {employee.region && (
                                <span>
                                  เขต{" "}
                                  {employee.region}
                                </span>
                              )}

                              {employee.branch && (
                                <span>
                                  📍{" "}
                                  {employee.branch}
                                </span>
                              )}
                            </div>
                          </div>

                          {selected && (
                            <div className="shrink-0 text-xl text-blue-600">
                              ✓
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}

                {filteredEmployees.length ===
                  0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center">
                    <div className="text-4xl">
                      🔎
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      ไม่พบรายชื่อที่ค้นหา
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      ลองค้นหาด้วยชื่อหรือชื่อตำแหน่ง
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                Selected Employee
            ================================================= */}
            {selectedEmployee && (
              <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                    {getRoleIcon(
                      selectedEmployee.role
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-blue-500">
                      ผู้ใช้งานที่เลือก
                    </p>

                    <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                      {selectedEmployee.name}
                    </h3>

                    <p className="truncate text-xs text-slate-500 sm:text-sm">
                      {selectedEmployee.roleName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                PIN
            ================================================= */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-slate-800 sm:text-base">
                🔑 รหัส PIN 4 หลัก
              </label>

              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={pin}
                onChange={(event) => {
                  const value =
                    event.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setPin(value);
                  setPinError("");
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    handleLogin();
                  }
                }}
                placeholder="••••"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-2xl font-bold tracking-[0.7em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-16 sm:text-3xl"
              />

              {pinError && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-center text-sm font-semibold text-red-600">
                  ⚠️ {pinError}
                </div>
              )}
            </div>

            {/* =================================================
                Login Button
            ================================================= */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={
                !selectedEmployee ||
                pin.length !== 4
              }
              className="h-14 w-full rounded-2xl bg-blue-600 px-5 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:h-16 sm:text-lg"
            >
              {selectedEmployee
                ? "🚀 เข้าสู่ระบบ"
                : "👤 เลือกชื่อพนักงานก่อน"}
            </button>

            {/* =================================================
                Info
            ================================================= */}
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-center">
              <p className="text-xs leading-5 text-slate-500">
                ระบบนี้มีผู้ใช้งานทั้งหมด{" "}
                <span className="font-bold text-slate-700">
                  {employees.length} คน
                </span>
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                ผู้บริหารระดับสูง + ผู้อำนวยการฝ่าย + ผู้จัดการเขต + ผู้จัดการสาขา
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            Footer
        ================================================= */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Assessment Form • Warithep
        </p>
      </div>
    </main>
  );
}