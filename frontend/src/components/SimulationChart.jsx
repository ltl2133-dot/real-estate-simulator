import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const tooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  borderRadius: '0.75rem',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  color: '#e2e8f0',
  fontSize: '0.75rem',
  padding: '0.75rem',
  backdropFilter: 'blur(12px)',
}

export default function SimulationChart({ data, dataKey, label, p10Key, p90Key }) {
  const hasBand = Boolean(p10Key && p90Key)

  return (
    <div className="h-72">
      {hasBand ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={p90Key} stroke="rgba(56,189,248,0.4)" fill="rgba(56,189,248,0.1)" />
            <Area type="monotone" dataKey={p10Key} stroke="rgba(16,185,129,0.4)" fill="rgba(16,185,129,0.1)" />
            <Line type="monotone" dataKey={dataKey} stroke="#34d399" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={dataKey} stroke="#34d399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">{label}</div>
    </div>
  )
}
