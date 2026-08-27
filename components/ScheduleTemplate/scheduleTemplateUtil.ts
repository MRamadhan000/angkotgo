export function getDayName(day: number) {
  const dayNames: Record<number, string> = {
    1: "Sen",
    2: "Sel",
    3: "Rab",
    4: "Kam",
    5: "Jum",
    6: "Sab",
    7: "Min",
  };

  return dayNames[day] ?? "-";
}


export function formatTime(time?: string) {
  if (!time) return "-";

  return time.slice(0, 5);
}