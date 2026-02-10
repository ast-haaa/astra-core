import { ShieldCheck, Link2 } from "lucide-react";

export default function BlockchainVerifiedCard() {
  const mockHash = "0x8fa39d1c42ab7e91b3caa01e4d9a2f6c8";

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-100 p-3 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
        </div>

        <div>
          <p className="font-semibold text-emerald-900">Blockchain Verified Batch</p>
          <p className="text-xs font-mono text-emerald-700">{mockHash}</p>
        </div>
      </div>

      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
        <Link2 className="w-4 h-4" />
        Immutable
      </span>
    </div>
  );
}
