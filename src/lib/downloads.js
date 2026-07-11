// Client-side CSV / template downloads (replaces former backend file endpoints).

const STUDENT_TEMPLATE_HEADERS = [
  "Student Name", "Register Number", "Department", "Year",
  "Email Address", "Mobile Number", "Gender", "Skills", "LinkedIn URL",
];

export function downloadStudentTemplate() {
  const csv = `${STUDENT_TEMPLATE_HEADERS.join(",")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadEnquiriesCsv(items) {
  const headers = ["Name", "Email", "Phone", "User Type", "Subject", "Message", "Status", "Created"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = (items || []).map((i) => [
    i.name, i.email, i.phone, i.user_type, i.subject, i.message, i.status, i.created_at,
  ].map(esc).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "enquiries.csv";
  a.click();
  URL.revokeObjectURL(url);
}
