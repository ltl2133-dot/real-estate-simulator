export default function StressTestPanel() {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-400">
      <h3 className="text-base font-semibold tracking-tight text-white">Stress testing roadmap</h3>
      <p className="mt-2 leading-relaxed">
        Future releases will add toggleable scenarios for rate shocks, price corrections, rent control, insurance spikes, and
        disaster events. Configure assumptions, rerun the engine, and compare before/after curves instantly.
      </p>
    </div>
  )
}
