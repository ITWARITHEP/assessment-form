"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [status, setStatus] = useState("กำลังทดสอบ...");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function testConnection() {
      const { count, error } = await supabase
        .from("assessment_results")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (error) {
        console.error(error);
        setStatus(`❌ เชื่อมต่อไม่สำเร็จ: ${error.message}`);
        return;
      }

      setCount(count ?? 0);
      setStatus("✅ เชื่อมต่อ Supabase สำเร็จ");
    }

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="text-5xl">🗄️</div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Supabase Connection Test
        </h1>

        <p className="mt-4 text-lg font-semibold text-slate-700">
          {status}
        </p>

        {count !== null && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              จำนวนข้อมูลใน assessment_results
            </p>

            <p className="mt-2 text-4xl font-bold text-blue-600">
              {count}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}