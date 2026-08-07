export const formatDateLabel = (dateStr?: string | Date | null) => {
  if (!dateStr) return "-";
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
  } catch {
    return String(dateStr);
  }
};

export const formatFullDate = (dateStr?: string | Date | null) => {
  if (!dateStr) return "-";
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
  } catch {
    return String(dateStr);
  }
};