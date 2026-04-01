
import { useState } from 'preact/hooks'

export function App() {
  const [status, setStatus] = useState<string>('pret')

  async function envoyerCommande(payload: string): Promise<void> {
    setStatus(`envoi: ${payload}`)
    try {
      const response = await fetch('/api/servo', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: payload,
      })
      const text = await response.text()
      if (!response.ok) {
        setStatus(`erreur ${response.status}: ${text}`)
        return
      }
      setStatus(`ok: ${text}`)
    } catch (error) {
      setStatus(`erreur reseau: ${String(error)}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center items-center gap-4 p-10">
      <button
        className="btn btn-primary transition-all duration-500 ease-in-out hover:bg-blue-500 hover:text-white"
        onClick={() => void envoyerCommande('bras:100:2000')}
      >
        Bras +360deg (2000ms)
      </button>
      <button
        className="btn btn-secondary transition-all duration-500 ease-in-out"
        onClick={() => void envoyerCommande('pince:100:2000')}
      >
        Pince +360deg (2000ms)
      </button>
      <p className="text-sm opacity-80">Statut: {status}</p>
    </div>
  )
}
