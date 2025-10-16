import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './pages/HomePage'
import BuilderPage from './pages/BuilderPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import Navbar from './components/Navbar'

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return newTheme
    })
  }

  return (
    <Router>
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/builder" element={<BuilderPage theme={theme} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
