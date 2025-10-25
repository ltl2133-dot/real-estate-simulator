import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function SimulationChart({ data, dataKey, label, p10Key, p90Key }){
  const hasBand = p10Key && p90Key
  return (
    <div className="h-72">
      {hasBand ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey={p90Key} strokeOpacity={0} fillOpacity={0.15} />
            <Area type="monotone" dataKey={p10Key} strokeOpacity={0} fillOpacity={0.15} />
            <Line type="monotone" dataKey={dataKey} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div className="text-xs text-slate-600 mt-1">{label}</div>
    </div>
  )
}
