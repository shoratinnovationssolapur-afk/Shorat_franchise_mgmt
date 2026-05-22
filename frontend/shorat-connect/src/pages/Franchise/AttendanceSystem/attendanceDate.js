export const attendanceYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
};

export const attendanceMonths = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

export const updateAttendanceMonth = (date, month) => {
  const [year, , day] = date.split("-");
  const safeDay = String(Math.min(Number(day), daysInMonth(Number(year), Number(month)))).padStart(2, "0");
  return `${year}-${month}-${safeDay}`;
};

export const updateAttendanceYear = (date, year) => {
  const [, month, day] = date.split("-");
  const safeDay = String(Math.min(Number(day), daysInMonth(Number(year), Number(month)))).padStart(2, "0");
  return `${year}-${month}-${safeDay}`;
};
