import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, Download, Sparkles, Settings } from 'lucide-react'
import { jsPDF } from "jspdf";
import ResumePreview from '../components/ResumePreview'
import AIProviderSelector from '../components/AIProviderSelector'
import '../components/print-resume.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface Section {
  id: string;
  type: 'education' | 'skills' | 'projects' | 'achievements' | 'positionsOfResponsibility' | 'experience' | 'custom' | 'professional_summary';
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
  professional_summary: string;
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
    professional_summary: 'Software Developer with a strong foundation in backend systems, RESTful API development, and data-driven application design. Proficient in Java, Python, SQL, and modern frameworks like Spring Boot. Hands-on experience with relational and NoSQL databases, cloud platforms (AWS), and version control systems like Git. Adept at debugging, writing clean code, and collaborating in Agile development environments. Passionate about delivering reliable, scalable software that supports sustainable and impactful solutions.',
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
        id: 'experience',
        type: 'experience',
        title: 'EXPERIENCE',
        content: [
          {
            company: 'Company Name',
            position: 'Job Title',
            duration: 'Jan 2022 - Present',
            description: ['Responsibility 1', 'Responsibility 2'],
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
        content: [
          { name: 'Award Name', description: 'Brief description of achievement' },
        ],
      },
      {
        id: 'positionsOfResponsibility',
        type: 'positionsOfResponsibility',
        title: 'POSITIONS OF RESPONSIBILITY',
        content: [
          {
            organization: 'Organization Name',
            position: 'Your Role',
            duration: 'Year - Year',
            description: ['Responsibility 1', 'Responsibility 2'],
          },
        ],
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
      // Call backend API with complete current resume data
      const response = await fetch(`${BACKEND_URL}/ask-ai/${selectedProvider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentInput,
          user_api_key: apiKey || null,
          current_resume_data: resumeData, // Send full current data
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

        // Helper: snake_case to camelCase
        const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

        // Map all top-level keys to camelCase
        const parsedRaw = JSON.parse(jsonString);
        const parsedData: any = {};
        Object.keys(parsedRaw).forEach((key) => {
          parsedData[toCamel(key)] = parsedRaw[key];
        });

        // Validate that parsedData has at least one resume key
        const resumeKeys = ['name', 'title', 'email', 'phone', 'location', 'professional_summary', 'skills', 'experience', 'education', 'projects', 'positionsOfResponsibility'];
        const hasResumeData = Object.keys(parsedData).some(key => resumeKeys.includes(key));

        if (hasResumeData) {
          // Update resume data with AI response, merging skills arrays
          setResumeData(prev => {
            const newResumeData = { ...prev };

            const isAiValueEmpty = (value: any) => {
              if (value === null || value === undefined || value === '') return true;
              if (Array.isArray(value) && value.length === 0) return true;
              if (typeof value === 'object' && Object.keys(value).length === 0) return true;
              return false;
            };

            const knownSectionIds = prev.sections.map(s => s.id);
            const topLevelKeys = ['name', 'title', 'email', 'phone', 'location', 'professional_summary', 'linkedin', 'github'];

            for (const key in parsedData) {
              if (Object.prototype.hasOwnProperty.call(parsedData, key)) {
                const value = parsedData[key];
                if (isAiValueEmpty(value)) continue;

                if (topLevelKeys.includes(key)) {
                  newResumeData[key] = value;
                } else if (knownSectionIds.includes(key)) {
                  // It's an existing section
                  newResumeData.sections = newResumeData.sections.map(section => {
                    if (section.id === key) {
                      if (section.id === 'skills') {
                        // Merge skills arrays
                        const newSkillsContent = { ...section.content };
                        const skillsMapping = {
                          programming_languages: 'programmingLanguages',
                          frameworks_and_libraries: 'frameworks',
                          database_management: 'databaseManagement',
                          developer_tools: 'versionControl',
                          cloud_platforms: 'cloudPlatforms',
                        };
                        for (const aiKey in value) {
                          const frontendKey = skillsMapping[aiKey] || aiKey;
                          if (Object.prototype.hasOwnProperty.call(value, aiKey) && Array.isArray(value[aiKey])) {
                            // Merge arrays, remove duplicates
                            const prevArr = Array.isArray(newSkillsContent[frontendKey]) ? newSkillsContent[frontendKey] : [];
                            const aiArr = value[aiKey];
                            const mergedArr = Array.from(new Set([...prevArr, ...aiArr].filter(Boolean)));
                            newSkillsContent[frontendKey] = mergedArr;
                          } else if (Object.prototype.hasOwnProperty.call(value, aiKey) && !isAiValueEmpty(value[aiKey])) {
                            newSkillsContent[frontendKey] = value[aiKey];
                          }
                        }
                        return { ...section, content: newSkillsContent };
                      }
                      // Mergeable sections: experience, positionsOfResponsibility, projects, achievements
                      else if ([
                        'experience',
                        'positionsOfResponsibility',
                        'projects',
                        'achievements'
                      ].includes(section.id) && Array.isArray(value)) {
                        // Merge arrays, append new items
                        const prevArr = Array.isArray(section.content) ? section.content : [];
                        // Avoid duplicates by checking for identical objects (shallow)
                        const mergedArr = [...prevArr];
                        value.forEach(aiItem => {
                          // Check if aiItem already exists in prevArr (shallow compare)
                          const exists = prevArr.some(prevItem => {
                            // Compare by stringifying (simple, not perfect)
                            return JSON.stringify(prevItem) === JSON.stringify(aiItem);
                          });
                          if (!exists) mergedArr.push(aiItem);
                        });
                        return { ...section, content: mergedArr };
                      } else {
                        return { ...section, content: value };
                      }
                    }
                    return section;
                  });
                }
              }
            }
            return newResumeData;
          });

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
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    let y = margin;

    // Set fonts and colors
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);

    // Name
    doc.text(resumeData.name, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 30;

    // Contact Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactInfo = `${resumeData.phone} | ${resumeData.email} | ${resumeData.linkedin} | ${resumeData.github}`;
    doc.text(contactInfo, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 20;

    // Professional Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', margin, y);
    y += 5;
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
    y += 15;
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.professional_summary, doc.internal.pageSize.getWidth() - margin * 2);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 12 + 10;


    // Sections
    resumeData.sections.forEach(section => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title.toUpperCase(), margin, y);
      y += 5;
      doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
      y += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      switch (section.type) {
        case 'education':
          section.content.forEach((edu: any) => {
            doc.setFont('helvetica', 'bold');
            doc.text(edu.school, margin, y);
            doc.setFont('helvetica', 'italic');
            doc.text(edu.year, doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });
            y += 12;
            doc.setFont('helvetica', 'italic');
            doc.text(edu.degree, margin, y);
            y += 15;
          });
          break;
        case 'experience':
          section.content.forEach((exp: any) => {
            doc.setFont('helvetica', 'bold');
            doc.text(exp.company, margin, y);
            doc.setFont('helvetica', 'italic');
            doc.text(exp.duration, doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });
            y += 12;
            doc.setFont('helvetica', 'italic');
            doc.text(exp.position, margin, y);
            y += 12;
            doc.setFont('helvetica', 'normal');
            exp.description.forEach((desc: string) => {
              const descLines = doc.splitTextToSize(`• ${desc}`, doc.internal.pageSize.getWidth() - margin * 2 - 10);
              doc.text(descLines, margin + 10, y);
              y += descLines.length * 12;
            });
            y += 10;
          });
          break;
        case 'skills':
          const skills = Object.entries(section.content).map(([category, skills]) => {
            const formattedCategory = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return `${formattedCategory}: ${(skills as string[]).join(', ')}`;
          }).join('\n');
          const skillsLines = doc.splitTextToSize(skills, doc.internal.pageSize.getWidth() - margin * 2);
          doc.text(skillsLines, margin, y);
          y += skillsLines.length * 12 + 10;
          break;
        case 'projects':
          section.content.forEach((proj: any) => {
            doc.setFont('helvetica', 'bold');
            doc.text(proj.name, margin, y);
            y += 12;
            doc.setFont('helvetica', 'italic');
            doc.text(proj.tech, margin, y);
            y += 12;
            doc.setFont('helvetica', 'normal');
            const links = `${proj.githubLink} | ${proj.liveLink}`;
            doc.text(links, margin, y, {
            });
            y += 12;
            proj.description.forEach((desc: string) => {
              const descLines = doc.splitTextToSize(`• ${desc}`, doc.internal.pageSize.getWidth() - margin * 2 - 10);
              doc.text(descLines, margin + 10, y);
              y += descLines.length * 12;
            });
            y += 10;
          });
          break;
        case 'achievements':
          section.content.forEach((ach: any) => {
            const achievementText = `${ach.name} - ${ach.description}`;
            const achievementLines = doc.splitTextToSize(`• ${achievementText}`, doc.internal.pageSize.getWidth() - margin * 2 - 10);
            doc.text(achievementLines, margin + 10, y);
            y += achievementLines.length * 12;
          });
          y += 10;
          break;
        case 'positionsOfResponsibility':
          section.content.forEach((pos: any) => {
            doc.setFont('helvetica', 'bold');
            doc.text(pos.position, margin, y);
            doc.setFont('helvetica', 'italic');
            doc.text(pos.duration, doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });
            y += 12;
            doc.setFont('helvetica', 'italic');
            doc.text(pos.organization, margin, y);
            y += 12;
            doc.setFont('helvetica', 'normal');
            pos.description.forEach((desc: string) => {
              const descLines = doc.splitTextToSize(`• ${desc}`, doc.internal.pageSize.getWidth() - margin * 2 - 10);
              doc.text(descLines, margin + 10, y);
              y += descLines.length * 12;
            });
            y += 10;
          });
          break;
        default:
          break;
      }
    });


    doc.save(`${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`);
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
          />
        </div>
      </div>
    </div>
  )
}
