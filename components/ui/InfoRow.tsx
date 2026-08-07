export function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 p-2.5 sm:gap-3 sm:p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase text-gray-400">
          {label}
        </span>
        <span
          className={`break-words font-medium text-gray-800 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
