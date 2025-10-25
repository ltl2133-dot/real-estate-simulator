import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Simulator from './pages/Simulator'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Real Estate Portfolio Simulator</h1>
          <nav className="flex gap-2">
            <button onClick={() => setTab('dashboard')} className={`px-3 py-1.5 rounded-lg border ${tab==='dashboard'?'bg-slate-900 text-white':'bg-white'}`}>Dashboard</button>
            <button onClick={() => setTab('sim')} className={`px-3 py-1.5 rounded-lg border ${tab==='sim'?'bg-slate-900 text-white':'bg-white'}`}>Simulator</button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab==='dashboard' ? <Dashboard/> : <Simulator/>}
      </main>
    </div>
  )
}
