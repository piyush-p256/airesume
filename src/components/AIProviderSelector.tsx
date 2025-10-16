import { Key, Lock, Check } from 'lucide-react'

interface AIProviderSelectorProps {
  selectedProvider: string
  onProviderChange: (provider: string) => void
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export default function AIProviderSelector({
  selectedProvider,
  onProviderChange,
  apiKey,
  onApiKeyChange,
}: AIProviderSelectorProps) {
  const providers = [
    { id: 'mistral', name: 'Mistral', hasFallback: true },
    { id: 'groq', name: 'Groq', hasFallback: true },
    { id: 'openai', name: 'OpenAI', hasFallback: false },
    { id: 'gemini', name: 'Google Gemini', hasFallback: false },
    { id: 'openrouter', name: 'OpenRouter', hasFallback: false },
  ]

  const selectedProviderInfo = providers.find(p => p.id === selectedProvider)
  const requiresKey = !selectedProviderInfo?.hasFallback

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">AI Provider</label>
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name} {provider.hasFallback ? '✓ Available' : '🔑 Key Required'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          {requiresKey ? <Lock className="w-4 h-4 text-amber-500" /> : <Key className="w-4 h-4" />}
          API Key {requiresKey && <span className="text-amber-500">(Required)</span>}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={requiresKey ? "Enter your API key" : "Optional: Use your own key"}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {selectedProviderInfo?.hasFallback ? (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" />
            Fallback key available - leave empty to use it
          </p>
        ) : (
          <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            You must provide your own API key for {selectedProviderInfo?.name}
          </p>
        )}
      </div>
    </div>
  )
}
