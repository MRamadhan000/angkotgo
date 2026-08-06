export const formatDateLabel = (dateStr: string) => {
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
  } catch {
    return dateStr;
  }
};
