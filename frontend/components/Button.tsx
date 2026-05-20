import * as React from "react";

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }
) {
  const { variant = "primary", className, ...rest } = props;
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-500/40";
  const styles =
    variant === "primary"
      ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300"
      : "bg-slate-100 text-slate-900 hover:bg-slate-200";

  return <button {...rest} className={[base, styles, className ?? ""].join(" ")} />;
}

