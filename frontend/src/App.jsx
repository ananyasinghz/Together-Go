import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Together&GO
        </h1>
        <p className="text-gray-600 mb-6">
          Frontend initialized successfully! 🚀
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            React + Vite + Tailwind CSS
          </p>
          <button
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Count: {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
