import { useState, ReactNode } from "react";

export default function WhySection({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-center">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm underline text-slate-500"
      >
  View verification details
      </button>

      {open && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
}
