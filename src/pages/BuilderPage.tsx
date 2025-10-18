import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, Download, Sparkles, Settings } from 'lucide-react'
import html2pdf from 'html2pdf.js'
import ResumePreview from '../components/ResumePreview'
import AIProviderSelector from '../components/AIProviderSelector'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface Section {
  id: string;
  type: 'education' | 'skills' | 'projects' | 'achievements' | 'positionsOfResponsibility' | 'experience' | 'custom';
  title: string;
  content: any;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  sections: Section[];
}

interface BuilderPageProps {
  theme: 'dark' | 'light'
}

export default function BuilderPage({ theme }: BuilderPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI resume assistant. Tell me about yourself, your experience, skills, and projects, and I'll help you create a professional resume. You can be as vague as you like!",
    },
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('mistral')
  const [apiKey, setApiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState('')
  const resumeRef = useRef<HTMLDivElement>(null)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

  const initialResumeData: ResumeData = {
    name: 'Your Name',
    title: 'Professional Title',
    email: 'email@example.com',
    phone: '(123) 456-7890',
    location: 'City, State',
    linkedin: 'linkedin.com/in/yourname',
    github: 'github.com/yourname',
    summary: 'A brief professional summary highlighting your key qualifications and career objectives.',
    sections: [
      {
        id: 'education',
        type: 'education',
        title: 'EDUCATION',
        content: [
          {
            school: 'University Name',
            degree: 'Degree Name',
            year: '2020',
          },
        ],
      },
      {
        id: 'skills',
        type: 'skills',
        title: 'TECHNICAL SKILLS',
        content: {
          programmingLanguages: ['JavaScript', 'Python'],
          frameworks: ['React', 'Node.js'],
          databaseManagement: ['MongoDB', 'PostgreSQL'],
          versionControl: ['Git', 'GitHub'],
          cloudPlatforms: ['AWS', 'Firebase'],
        },
      },
      {
        id: 'projects',
        type: 'projects',
        title: 'PROJECTS',
        content: [
          {
            name: 'Project Name',
            description: ['Bullet point 1', 'Bullet point 2'],
            tech: 'Technologies used',
            githubLink: 'github.com/yourname/project',
            liveLink: 'yourproject.com',
          },
        ],
      },
      {
        id: 'achievements',
        type: 'achievements',
        title: 'ACHIEVEMENTS',
        content: ['Achievement 1', 'Achievement 2'],
      },
      {
        id: 'positionsOfResponsibility',
        type: 'positionsOfResponsibility',
        title: 'POSITIONS OF RESPONSIBILITY',
        content: ['Position of Responsibility 1'],
      },
    ],
  };

  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing resume data from localStorage", e);
        return initialResumeData;
      }
    }
    return initialResumeData;
  });

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  const handleSend = async () => {
    if (!input.trim()) return

    // Check if provider requires API key
    const userKeyProviders = ['openai', 'gemini', 'openrouter']
    if (userKeyProviders.includes(selectedProvider) && !apiKey.trim()) {
      setError(`${selectedProvider} requires your API key. Please add it in settings.`)
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsGenerating(true)
    setError('')

    try {
      // Call backend API
      const response = await fetch(`${BACKEND_URL}/ask-ai/${selectedProvider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentInput,
          user_api_key: apiKey || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get AI response')
      }

      const data = await response.json()
      const aiContent = data.response

      // Try to parse JSON response
      try {
        // Improved JSON parsing: handles markdown code blocks
        let jsonString = aiContent
        const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          jsonString = jsonMatch[1]
        } else {
          const looseJsonMatch = aiContent.match(/\{[\s\S]*\}/)
          if (looseJsonMatch) {
            jsonString = looseJsonMatch[0]
          }
        }

        const parsedData = JSON.parse(jsonString)
        
        // Validate that parsedData has at least one resume key
        const resumeKeys = ['name', 'title', 'email', 'phone', 'location', 'summary', 'skills', 'experience', 'education', 'projects'];
        const hasResumeData = Object.keys(parsedData).some(key => resumeKeys.includes(key));

        if (hasResumeData) {
          // Update resume data with AI response (only update provided fields)
          setResumeData((prev) => {
            const newSections = prev.sections.map(section => {
              if (parsedData[section.id]) {
                return { ...section, content: parsedData[section.id] };
              }
              return section;
            });

            return {
              ...prev,
              name: parsedData.name || prev.name,
              title: parsedData.title || prev.title,
              email: parsedData.email || prev.email,
              phone: parsedData.phone || prev.phone,
              location: parsedData.location || prev.location,
              linkedin: parsedData.linkedin || prev.linkedin,
              github: parsedData.github || prev.github,
              summary: parsedData.summary || prev.summary,
              sections: newSections,
            };
          })

          const aiResponse: Message = {
            role: 'assistant',
            content: "Great! I've updated your resume with the information you provided. You can continue adding more details or click on any section in the resume to edit it directly.",
          }
          setMessages((prev) => [...prev, aiResponse])
        } else {
          // If JSON is not in the expected resume format, treat as plain text
          throw new Error("JSON response did not contain resume data.");
        }
      } catch (parseError) {
        // If not valid JSON or not in expected format, just show the raw response
        const aiResponse: Message = {
          role: 'assistant',
          content: aiContent,
        }
        setMessages((prev) => [...prev, aiResponse])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to AI service'
      setError(errorMessage)
      const errorResponse: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again or check your API key.`,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!resumeRef.current) return

    const opt = {
      margin: 0,
      filename: `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }

    html2pdf().set(opt).from(resumeRef.current).save()
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      {/* Left Panel - AI Chat */}
      <div className="w-full lg:w-2/5 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="p-4 border-b border-border bg-muted/50"
          >
            <AIProviderSelector
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
            />
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-2xl flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <p className="text-sm">AI is thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          {error && (
            <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleSend()}
              placeholder="Tell me about yourself..."
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={isGenerating || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Resume Preview */}
      <div className="flex-1 overflow-y-auto bg-muted/30 p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          {/* Resume */}
          <ResumePreview
            ref={resumeRef}
            data={resumeData}
            onDataChange={setResumeData}
            theme={theme}
          />
        </div>
      </div>
    </div>
  )
}
