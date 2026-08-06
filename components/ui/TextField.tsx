import { InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export default function TextField({
  label,
  icon,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="group relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600">
            {icon}
          </div>
        )}

        <input
          {...props}
          className={`h-12 w-full rounded-2xl border border-slate-200 bg-white ${
            icon ? "pl-11" : "pl-4"
          } pr-4 text-sm text-slate-900 outline-none transition-all
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
          hover:border-slate-300 ${className}`}
        />
      </div>
    </div>
  );
}