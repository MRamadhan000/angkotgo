import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, icon, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </label>

        <div className="group relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            className={`h-12 w-full rounded-2xl border bg-white ${
              icon ? "pl-11" : "pl-4"
            } pr-4 text-sm text-slate-900 outline-none transition-all ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
            } ${className}`}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";

export default TextField;
