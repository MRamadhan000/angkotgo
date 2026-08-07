import { FiLoader } from "react-icons/fi";

// Select dengan ikon kiri dan indikator loading di kanan
export function FieldSelect({
  icon: Icon,
  loading,
  children,
  ...props
}: {
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      <select
        {...props}
        disabled={loading || props.disabled}
        className="w-full bg-gray-50 border border-gray-200 pl-10 pr-9 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {children}
      </select>
      {loading && (
        <FiLoader className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
      )}
    </div>
  );
}