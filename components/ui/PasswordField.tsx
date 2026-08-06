"use client";

import {
  InputHTMLAttributes,
  useState,
} from "react";
import {
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { FaLock } from "react-icons/fa";

interface PasswordFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label: string;
}

export default function PasswordField({
  label,
  className = "",
  ...props
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="group relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" />

        <input
          {...props}
          type={show ? "text" : "password"}
          className={`h-12 w-full text-slate-900 rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition-all
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
          hover:border-slate-300 ${className}`}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </div>
  );
}