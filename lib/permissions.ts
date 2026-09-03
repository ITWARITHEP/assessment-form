import {
  Employee,
  employees,
  headquarters,
} from "@/data/employees";

export type EvaluationTarget = {
  id: string;
  name: string;
  role: Employee["role"];
  roleName: string;
  region?: string;
  branch?: string;
  category:
    | "director"
    | "area_manager"
    | "branch_manager"
    | "headquarters";
};

/**
 * รายชื่อผู้ที่ evaluator มีสิทธิ์ประเมิน
 */
export function getEvaluationTargets(
  evaluator: Employee
): EvaluationTarget[] {
  const targets: EvaluationTarget[] = [];

  // =========================================================
  // ผู้บริหารระดับสูง
  // =========================================================
  if (evaluator.role === "executive") {
    // ---------------------------------------------------------
    // ประเมินผู้อำนวยการฝ่ายทั้งหมด
    // ---------------------------------------------------------
    employees
      .filter(
        (employee) =>
          employee.role === "director"
      )
      .forEach((employee) => {
        targets.push({
          ...employee,
          category: "director",
        });
      });

    // ---------------------------------------------------------
    // ผู้จัดการเขต
    //
    // คุณธนภูมิ (exec-001)
    // = ประธานกรรมการบริหาร
    // = ต้องประเมินผู้จัดการเขตทั้งหมด
    //
    // ผู้บริหารคนอื่น
    // = ประเมินเฉพาะเขตที่รับผิดชอบ
    // ---------------------------------------------------------
    if (evaluator.id === "exec-001") {
      employees
        .filter(
          (employee) =>
            employee.role === "area_manager"
        )
        .forEach((employee) => {
          targets.push({
            ...employee,
            category: "area_manager",
          });
        });
    } else {
      employees
        .filter(
          (employee) =>
            employee.role === "area_manager" &&
            evaluator.responsibilityRegions?.includes(
              employee.region || ""
            )
        )
        .forEach((employee) => {
          targets.push({
            ...employee,
            category: "area_manager",
          });
        });
    }

    // ---------------------------------------------------------
    // ผู้จัดการสาขา
    //
    // คุณธนภูมิไม่ได้ประเมินผู้จัดการสาขาโดยตรง
    // ผู้บริหารระดับเขตคนอื่นประเมินตามพื้นที่รับผิดชอบ
    // ---------------------------------------------------------
    if (evaluator.id !== "exec-001") {
      employees
        .filter(
          (employee) =>
            employee.role === "branch_manager" &&
            evaluator.responsibilityRegions?.includes(
              employee.region || ""
            )
        )
        .forEach((employee) => {
          targets.push({
            ...employee,
            category: "branch_manager",
          });
        });
    }
  }

  // =========================================================
  // ผู้อำนวยการฝ่าย
  // =========================================================
  if (evaluator.role === "director") {
    // ประเมินผู้จัดการเขตทั้งหมด
    employees
      .filter(
        (employee) =>
          employee.role === "area_manager"
      )
      .forEach((employee) => {
        targets.push({
          ...employee,
          category: "area_manager",
        });
      });
  }

  // =========================================================
  // ผู้จัดการเขต
  // =========================================================
  if (evaluator.role === "area_manager") {
    // ---------------------------------------------------------
    // ประเมินผู้อำนวยการฝ่ายทั้งหมด
    // ---------------------------------------------------------
    employees
      .filter(
        (employee) =>
          employee.role === "director"
      )
      .forEach((employee) => {
        targets.push({
          ...employee,
          category: "director",
        });
      });

    // ---------------------------------------------------------
    // ประเมินผู้จัดการสาขาเฉพาะเขตตัวเอง
    // ---------------------------------------------------------
    employees
      .filter(
        (employee) =>
          employee.role === "branch_manager" &&
          employee.region === evaluator.region
      )
      .forEach((employee) => {
        targets.push({
          ...employee,
          category: "branch_manager",
        });
      });
  }

  // =========================================================
  // ผู้จัดการสาขา
  // =========================================================
  if (evaluator.role === "branch_manager") {
    // ---------------------------------------------------------
    // ประเมินผู้จัดการเขตของตัวเอง
    // ---------------------------------------------------------
    employees
      .filter(
        (employee) =>
          employee.role === "area_manager" &&
          employee.region === evaluator.region
      )
      .forEach((employee) => {
        targets.push({
          ...employee,
          category: "area_manager",
        });
      });

    // ---------------------------------------------------------
    // ประเมินฝ่ายสำนักงานใหญ่
    // ---------------------------------------------------------
    headquarters.forEach(
      (name, index) => {
        targets.push({
          id: `hq-${index + 1}`,
          name,
          role: "director",
          roleName: "ฝ่ายสำนักงานใหญ่",
          category: "headquarters",
        });
      }
    );
  }

  return targets;
}

/**
 * =========================================================
 * หา "ผู้มีสิทธิ์ประเมิน" ของผู้ถูกประเมิน
 *
 * ผู้ถูกประเมิน
 *      ↓
 * ใครประเมินบ้าง
 *
 * ใช้ permission ชุดเดียวกับ getEvaluationTargets()
 * เพื่อให้สิทธิ์สองทางตรงกัน
 * =========================================================
 */
export function getEvaluationEvaluators(
  targetId: string
): Employee[] {
  return employees.filter(
    (employee) =>
      getEvaluationTargets(employee).some(
        (target) =>
          target.id === targetId
      )
  );
}

/**
 * =========================================================
 * ตรวจว่าผู้ประเมินมีสิทธิ์ประเมิน target หรือไม่
 * =========================================================
 */
export function canEvaluate(
  evaluatorId: string,
  targetId: string
): boolean {
  const evaluator = employees.find(
    (employee) =>
      employee.id === evaluatorId
  );

  if (!evaluator) {
    return false;
  }

  return getEvaluationTargets(
    evaluator
  ).some(
    (target) =>
      target.id === targetId
  );
}