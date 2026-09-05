export type Role =
  | "executive"
  | "director"
  | "area_manager"
  | "branch_manager";

export type Employee = {
  id: string;
  name: string;
  role: Role;
  roleName: string;
  region?: string;
  branch?: string;
  responsibilityRegions?: string[];
};

export const employees: Employee[] = [
  // =========================
  // 👑 ผู้บริหารระดับสูง
  // =========================
  {
    id: "exec-001",
    name: "นายธนภูมิ เชื้อวณิชย์",
    role: "executive",
    roleName: "ประธานกรรมการบริหาร",
    responsibilityRegions: [],
  },
  {
    id: "exec-002",
    name: "นางวารีทอง เชื้อวณิชย์",
    role: "executive",
    roleName: "รองประธานกรรมการบริหาร ประธานเขตอีสานใต้2",
    responsibilityRegions: ["อีสานใต้ 2/1", "อีสานใต้ 2/2"],
  },
  {
    id: "exec-003",
    name: "นายวรภูมิ เชื้อวณิชย์",
    role: "executive",
    roleName: "รองประธานกรรมการบริหาร ประธานเขตอีสานเหนือ",
    responsibilityRegions: ["อีสานเหนือ 1", "อีสานเหนือ 2"],
  },
  {
    id: "exec-004",
    name: "นางสาววารุณพร เชื้อวณิชย์",
    role: "executive",
    roleName: "รองประธานกรรมการบริหาร ประธานเขตภาคกลาง",
    responsibilityRegions: ["ภาคกลาง 1", "ภาคกลาง 2"],
  },
  {
    id: "exec-005",
    name: "นางสาววนัชพร เชื้อวณิชย์",
    role: "executive",
    roleName: "รองประธานกรรมการบริหาร ประธานเขตภาคเหนือ",
    responsibilityRegions: ["ภาคเหนือ 1", "ภาคเหนือ 2"],
  },
  {
    id: "exec-006",
    name: "นางสาววิชญาดา เชื้อวณิชย์",
    role: "executive",
    roleName: "รองประธานกรรมการบริหาร ประธานเขตอีสานใต้1",
    responsibilityRegions: ["อีสานใต้ 1/1", "อีสานใต้ 1/2"],
  },

  // =========================
  // 🏢 ผู้อำนวยการฝ่าย
  // =========================
  {
    id: "dir-001",
    name: "นางสาวสุปราณี สายเพชร",
    role: "director",
    roleName:
      "ผู้อำนวยการอาวุโส / ฝ่ายบริหารโครงการ ",
  },
  {
    id: "dir-002",
    name: "นางเยาวภา พนมศร",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายจัดซื้อจัดจ้าง",
  },
  {
    id: "dir-003",
    name: "นางสาววรรณยุภา บุญทศ",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายการเงิน",
  },
  {
    id: "dir-004",
    name: "นางณิชกุล โกพลรัตน์",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายภาษีและเทคโนโลยีสารสนเทศ",
  },
  {
    id: "dir-005",
    name: "นางสาวจิตราภรณ์ บัวใหญ่",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายคลังสินค้า",
  },
  {
    id: "dir-006",
    name: "นางสาวอัญชลี พวงจำปา",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายสำนักบริหารกลาง",
  },
  {
    id: "dir-007",
    name: "นางสาวธนิดา วันทา",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายบัญชี",
  },
  {
    id: "dir-008",
    name: "นางดาวสวรรค์ บุญจอง",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายการเงิน",
  },
  {
    id: "dir-009",
    name: "นางสาวแสงจันทร์ ยงยืน",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายตรวจสอบภายใน",
  },
  {
    id: "dir-010",
    name: "นางสาวนภาเพ็ญ สุภโกศล",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายบริหารทรัพยากรมนุษย์",
  },
  {
    id: "dir-011",
    name: "นางพัชริน อุตม์ทอง",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
  },
  {
    id: "dir-012",
    name: "นายคงคา ชาวนา",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายวิศวกรรม",
  },
   {
    id: "dir-013",
    name: "นายชัยวิชิต ทองบ่อ",
    role: "director",
    roleName: "ผู้อำนวยการฝ่ายขายและการตลาด",
  },

  // =========================
  // 🌎 ผู้จัดการเขต
  // =========================
  {
    id: "area-001",
    name: "นางสาวนงลักษณ์ กกแก้ว",
    role: "area_manager",
    roleName: "ผู้จัดการเขตอีสานใต้ 1/1",
    region: "อีสานใต้ 1/1",
  },
  {
    id: "area-002",
    name: "นายสุริยนต์ วิเศษสังข์",
    role: "area_manager",
    roleName: "ผู้จัดการเขตอีสานใต้ 1/2",
    region: "อีสานใต้ 1/2",
  },
  {
    id: "area-003",
    name: "นายอาทร สอนคำ",
    role: "area_manager",
    roleName: "ผู้จัดการเขตอีสานใต้ 2/1",
    region: "อีสานใต้ 2/1",
  },
  {
    id: "area-004",
    name: "นายฉัตรชัย อุตม์ทอง",
    role: "area_manager",
    roleName: "ผู้จัดการเขตอีสานใต้ 2/2",
    region: "อีสานใต้ 2/2",
  },
  {
    id: "area-005",
    name: "นายครรทรง เชื้องาม",
    role: "area_manager",
    roleName: "ผู้จัดการเขตอีสานเหนือ 1",
    region: "อีสานเหนือ 1",
  },
  {
    id: "area-006",
    name: "นายอานนท์ พงศ์พีระ",
    role: "area_manager",
    roleName: "ผู้จัดการเขตอีสานเหนือ 2",
    region: "อีสานเหนือ 2",
  },
  {
    id: "area-007",
    name: "นายวุฒิพล นามทองใบ",
    role: "area_manager",
    roleName: "ผู้จัดการเขตภาคกลาง 1",
    region: "ภาคกลาง 1",
  },
  {
    id: "area-008",
    name: "นายสมปอง ชาวนา",
    role: "area_manager",
    roleName: "ผู้จัดการเขตภาคกลาง 2",
    region: "ภาคกลาง 2",
  },
  {
    id: "area-009",
    name: "นายวัฒนา สุทธิอาคาร",
    role: "area_manager",
    roleName: "ผู้จัดการเขตภาคเหนือ 1",
    region: "ภาคเหนือ 1",
  },
  {
    id: "area-010",
    name: "นายวราวุธ พูลสุวรรณ",
    role: "area_manager",
    roleName: "ผู้จัดการเขตภาคเหนือ 2",
    region: "ภาคเหนือ 2",
  },

  // =========================
  // 🏪 ผู้จัดการสาขา
  // =========================

  // อีสานใต้ 1/1
  {
    id: "branch-001",
    name: "นางสาวศิรัญญา เอี่ยมสะอาด",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ คำเขื่อนแก้ว",
    region: "อีสานใต้ 1/1",
    branch: "วารีเทพ คำเขื่อนแก้ว",
  },
  {
    id: "branch-002",
    name: "นายนันทวุฒิ คงศรี",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ เขื่องใน",
    region: "อีสานใต้ 1/1",
    branch: "วารีเทพ เขื่องใน",
  },
  {
    id: "branch-003",
    name: "นายสมพร สุโพธิ์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ มหาชนะชัย",
    region: "อีสานใต้ 1/1",
    branch: "วารีเทพ มหาชนะชัย",
  },
  {
    id: "branch-004",
    name: "นายธวัชชัย วันโท",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ มุกดาหาร",
    region: "อีสานใต้ 1/1",
    branch: "วารีเทพ มุกดาหาร",
  },
  {
    id: "branch-005",
    name: "นายวิทยา สืบสิมมา",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ กุฉินารายณ์",
    region: "อีสานใต้ 1/1",
    branch: "วารีเทพ กุฉินารายณ์",
  },
  {
    id: "branch-006",
    name: "นายปรีชา สารบูรณ์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ยางตลาด",
    region: "อีสานใต้ 1/1",
    branch: "วารีเทพ ยางตลาด",
  },

  // อีสานใต้ 1/2
  {
    id: "branch-007",
    name: "นายนายจิรศักดิ์ แสนสะอาด",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ศรีสะเกษ",
    region: "อีสานใต้ 1/2",
    branch: "วารีเทพ ศรีสะเกษ",
  },
  {
    id: "branch-008",
    name: "นางสาวไพลิน รองเมือง",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ยางชุมน้อย",
    region: "อีสานใต้ 1/2",
    branch: "วารีเทพ ยางชุมน้อย",
  },
  {
    id: "branch-009",
    name: "นางสาวจุฬารัตน์ ศรีลาชัย",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ขุขันธ์",
    region: "อีสานใต้ 1/2",
    branch: "วารีเทพ ขุขันธ์",
  },

  // อีสานใต้ 2/1
  {
    id: "branch-010",
    name: "นายวิรุฬห์ นามทองใบ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ สังขะ",
    region: "อีสานใต้ 2/1",
    branch: "วารีเทพ สังขะ",
  },
  {
    id: "branch-011",
    name: "นายวุฒิพงษ์ โลหะทิน",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ปราสาท",
    region: "อีสานใต้ 2/1",
    branch: "วารีเทพ ปราสาท",
  },
  {
    id: "branch-012",
    name: "นายสาคร ดีพาชู",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ สุรินทร์",
    region: "อีสานใต้ 2/1",
    branch: "วารีเทพ สุรินทร์",
  },
  {
    id: "branch-013",
    name: "นายสมชาย สงแดง",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ บุรีรัมย์",
    region: "อีสานใต้ 2/1",
    branch: "วารีเทพ บุรีรัมย์",
  },
  {
    id: "branch-014",
    name: "นายวรศาสตร์ สีหาวงษ์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ จอมพระ",
    region: "อีสานใต้ 2/1",
    branch: "วารีเทพ จอมพระ",
  },

  // อีสานใต้ 2/2
  {
    id: "branch-015",
    name: "นางสาวอรทัย แหลมทองหลาง",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ จักราช",
    region: "อีสานใต้ 2/2",
    branch: "วารีเทพ จักราช",
  },
  {
    id: "branch-016",
    name: "นายพีรศักดิ์ สอนอาจ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ครบุรี",
    region: "อีสานใต้ 2/2",
    branch: "วารีเทพ ครบุรี",
  },
  {
    id: "branch-017",
    name: "นางสาวนิตยา ตรงศูนย์ดี",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ แก้งคร้อ",
    region: "อีสานใต้ 2/2",
    branch: "วารีเทพ แก้งคร้อ",
  },
  {
    id: "branch-018",
    name: "นางสาวกาญจนา เพชรเลิศ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ นางรอง",
    region: "อีสานใต้ 2/2",
    branch: "วารีเทพ นางรอง",
  },

  // อีสานเหนือ 1
  {
    id: "branch-019",
    name: "นางวาสนา สมงาม",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ อุดรธานี",
    region: "อีสานเหนือ 1",
    branch: "วารีเทพ อุดรธานี",
  },
  {
    id: "branch-020",
    name: "นายเมฆเมฆิน ปิยะราช",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ บ้านผือ",
    region: "อีสานเหนือ 1",
    branch: "วารีเทพ บ้านผือ",
  },
  {
    id: "branch-021",
    name: "นางสาวเบญจวรรณ แก้วหาญ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ภูเรือ",
    region: "อีสานเหนือ 1",
    branch: "วารีเทพ ภูเรือ",
  },
  {
    id: "branch-022",
    name: "นายเมธี สมงาม",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ หนองบัวลำภู",
    region: "อีสานเหนือ 1",
    branch: "วารีเทพ หนองบัวลำภู",
  },
  {
    id: "branch-023",
    name: "นายสุรศักดิ์ เหลาผา",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ขอนแก่น",
    region: "อีสานเหนือ 1",
    branch: "วารีเทพ ขอนแก่น",
  },

  // อีสานเหนือ 2
  {
    id: "branch-024",
    name: "นางเกษร พงศ์พีระ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ สว่างแดนดิน",
    region: "อีสานเหนือ 2",
    branch: "วารีเทพ สว่างแดนดิน",
  },
  {
    id: "branch-025",
    name: "นางสาวมะลิวัน ฐานทองดี",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ สกลนคร",
    region: "อีสานเหนือ 2",
    branch: "วารีเทพ สกลนคร",
  },
  {
    id: "branch-026",
    name: "นายนัฐวุฒิ ฤทธิมาร",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ บ้านม่วง",
    region: "อีสานเหนือ 2",
    branch: "วารีเทพ บ้านม่วง",
  },
  {
    id: "branch-027",
    name: "นายพีรพล ห้วยน้อย",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ นครพนม",
    region: "อีสานเหนือ 2",
    branch: "วารีเทพ นครพนม",
  },
  {
    id: "branch-028",
    name: "นายไพโรจน์ เทพสุวรรณ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ เพ็ญ",
    region: "อีสานเหนือ 2",
    branch: "วารีเทพ เพ็ญ",
  },

  // ภาคกลาง 1
  {
    id: "branch-029",
    name: "นายอนันต์ รุ่งคลาลักษณ์กุล",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ อู่ทอง",
    region: "ภาคกลาง 1",
    branch: "วารีเทพ อู่ทอง",
  },
  {
    id: "branch-030",
    name: "นางสาววิมลรัตน์ ทัศเอี่ยม",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ โพธิ์ทอง",
    region: "ภาคกลาง 1",
    branch: "วารีเทพ โพธิ์ทอง",
  },
  {
    id: "branch-031",
    name: "นายอดิศร มณีรัตน์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ชัยนาท",
    region: "ภาคกลาง 1",
    branch: "วารีเทพ ชัยนาท",
  },
  {
    id: "branch-032",
    name: "นายประจักษ์ จอมชู",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ประจวบคีรีขันธ์",
    region: "ภาคกลาง 1",
    branch: "วารีเทพ ประจวบคีรีขันธ์",
  },
  {
    id: "branch-033",
    name: "นายฐิติโชติก์ สถานทรัพย์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ทับสะแก",
    region: "ภาคกลาง 1",
    branch: "วารีเทพ ทับสะแก",
  },

  // ภาคกลาง 2
  {
    id: "branch-034",
    name: "นายสุรศักดิ์ สมรรถพาพงษ์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ บางละมุง",
    region: "ภาคกลาง 2",
    branch: "วารีเทพ บางละมุง",
  },
  {
    id: "branch-035",
    name: "นายทินกร หัวดอน",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ มหานคร",
    region: "ภาคกลาง 2",
    branch: "วารีเทพ มหานคร",
  },
  {
    id: "branch-036",
    name: "นายบรรยวัสถ์ รุ่งคลาลักษณ์กุล",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ กาญจนบุรี",
    region: "ภาคกลาง 2",
    branch: "วารีเทพ กาญจนบุรี",
  },
  {
    id: "branch-037",
    name: "นายสุทิตย์ ประภาใส",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ทองผาภูมิ",
    region: "ภาคกลาง 2",
    branch: "วารีเทพ ทองผาภูมิ",
  },
  {
    id: "branch-038",
    name: "นายเชิด นิราศภัย",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ศรีราชา",
    region: "ภาคกลาง 2",
    branch: "วารีเทพ ศรีราชา",
  },
  {
    id: "branch-039",
    name: "นายฉันทพล วรรณเวช",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ พัทยา",
    region: "ภาคกลาง 2",
    branch: "วารีเทพ พัทยา",
  },

  // ภาคเหนือ 1
  {
    id: "branch-040",
    name: "นางสาวสุจิตรา มีศรี",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ เพชรบูรณ์",
    region: "ภาคเหนือ 1",
    branch: "วารีเทพ เพชรบูรณ์",
  },
  {
    id: "branch-041",
    name: "นายพรชัย ดาวท่าน",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ชุมแสง",
    region: "ภาคเหนือ 1",
    branch: "วารีเทพ ชุมแสง",
  },
  {
    id: "branch-042",
    name: "นายธงชัย หมื่นจันทร์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ คลองขลุง",
    region: "ภาคเหนือ 1",
    branch: "วารีเทพ คลองขลุง",
  },
  {
    id: "branch-043",
    name: "นางสาวดารินี หาบุญมี",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ วังทอง",
    region: "ภาคเหนือ 1",
    branch: "วารีเทพ วังทอง",
  },
  {
    id: "branch-044",
    name: "นายชยากร โพธิ์สำราญ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ สุโขทัย",
    region: "ภาคเหนือ 1",
    branch: "วารีเทพ สุโขทัย",
  },

  // ภาคเหนือ 2
  {
    id: "branch-045",
    name: "นายพิษณุ เรือนช้าง",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ เชียงใหม่",
    region: "ภาคเหนือ 2",
    branch: "วารีเทพ เชียงใหม่",
  },
  {
    id: "branch-046",
    name: "นายกิตติพงษ์ กันธิยะ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ ลำปาง",
    region: "ภาคเหนือ 2",
    branch: "วารีเทพ ลำปาง",
  },
  {
    id: "branch-047",
    name: "นางสาวพรพิมล คำปันศักดิ์",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ อุตรดิตถ์",
    region: "ภาคเหนือ 2",
    branch: "วารีเทพ อุตรดิตถ์",
  },
  {
    id: "branch-048",
    name: "นายธนภพ แก้วเทพ",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ เชียงแสน",
    region: "ภาคเหนือ 2",
    branch: "วารีเทพ เชียงแสน",
  },
  {
    id: "branch-049",
    name: "นายปรัชญา ณ พิกุล",
    role: "branch_manager",
    roleName: "ผู้จัดการสาขาวารีเทพ เชียงราย",
    region: "ภาคเหนือ 2",
    branch: "วารีเทพ เชียงราย",
  },
];

export const headquarters = [
  "ฝ่ายสำนักบริหารกลาง",
  "ฝ่ายบริหารทรัพยากรมนุษย์",
  "ฝ่ายพัฒนาทรัพยากรมนุษย์และการสื่อสาร",
  "ฝ่ายจัดซื้อจัดจ้าง",
  "ฝ่ายวิศวกรรม",
  "ฝ่ายคลังสินค้า",
  "ฝ่ายการขายและการตลาด",
  "ฝ่ายการเงิน",
  "ฝ่ายบัญชี",
  "ฝ่ายการภาษี",
  "ฝ่ายเทคโนโลยีสารสนเทศ",
  "ฝ่ายตรวจสอบภายใน",
  "ฝ่ายบริหารโครงการ",
];