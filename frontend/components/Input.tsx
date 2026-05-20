import * as React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...rest}
        className={[
          "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
          "outline-none ring-offset-2 focus:ring-2 focus:ring-red-500/40",
          className ?? "",
        ].join(" ")}
      />
    </label>
  );
}

