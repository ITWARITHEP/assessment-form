"use client";

import { useState } from "react";

export default function TestSupabaseWritePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleTest = async () => {
    setLoading(true);
    setResult("กำลังทดสอบ...");

    try {
      const response = await fetch(
        "/api/test-supabase-write",
        {
          method: "POST",
        }
      );

      const text = await response.text();

      console.log("STATUS:", response.status);
      console.log("RESPONSE:", text);

      setResult(text);
    } catch (error) {
      console.error(error);

      setResult(
        error instanceof Error
          ? error.message
          : String(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">
          🧪 ทดสอบเขียน Supabase
        </h1>

        <p className="mt-2 text-slate-500">
          หน้านี้ใช้ทดสอบเฉพาะการเขียนข้อมูล
        </p>

        <button
          type="button"
          onClick={handleTest}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
        >
          {loading
            ? "⏳ กำลังทดสอบ..."
            : "🚀 ทดสอบบันทึกข้อมูล"}
        </button>

        <div className="mt-6 rounded-2xl bg-slate-900 p-5">
          <pre className="whitespace-pre-wrap break-words text-sm text-white">
            {result || "ยังไม่มีผลการทดสอบ"}
          </pre>
        </div>
      </div>
    </main>
  );
}