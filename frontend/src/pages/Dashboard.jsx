import { useEffect, useState } from 'react'
import { listPortfolio, clearPortfolio } from '../utils/api'
import PropertyCard from '../components/PropertyCard'

export default function Dashboard(){
  const [items, setItems] = useState([])
  const refresh = async () => setItems(await listPortfolio())
  useEffect(() => { refresh() }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Portfolio</h2>
        <button onClick={async()=>{await clearPortfolio(); await refresh();}} className="px-3 py-1.5 rounded-lg border">Clear</button>
      </div>
      {items.length===0 && <p className="text-slate-600">No properties yet. Add one in the Simulator tab.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((p, idx) => <PropertyCard key={idx} p={p} />)}
      </div>
    </div>
  )
}
