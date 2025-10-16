import { motion } from 'framer-motion'
import { Sparkles, Zap, Users, Target } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Leverages cutting-edge AI models from OpenAI, Google Gemini, Mistral, and more to generate professional resume content.',
    },
    {
      icon: Zap,
      title: 'Real-Time Editing',
      description: 'Edit any section of your resume instantly with live preview. Changes are reflected immediately.',
    },
    {
      icon: Users,
      title: 'User-Friendly',
      description: 'Simple, intuitive interface designed for everyone. No technical knowledge required.',
    },
    {
      icon: Target,
      title: 'Professional Results',
      description: 'Export polished, ATS-friendly resumes ready for job applications.',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ResumeAI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering job seekers with AI technology to create outstanding resumes
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
        >
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            ResumeAI was built to democratize access to professional resume creation. We believe everyone deserves a chance to present their best self to potential employers, regardless of their writing skills or design expertise. By combining the power of AI with intuitive design, we make creating a standout resume accessible to all.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-8 rounded-2xl bg-card border border-border"
        >
          <h2 className="text-2xl font-bold mb-4">Technology Stack</h2>
          <div className="space-y-3 text-muted-foreground">
            <p><strong className="text-foreground">Frontend:</strong> React, TypeScript, Vite, Tailwind CSS, Framer Motion</p>
            <p><strong className="text-foreground">AI Integration:</strong> OpenAI, Google Gemini, Mistral, Groq, OpenRouter</p>
            <p><strong className="text-foreground">Backend:</strong> FastAPI (Python)</p>
            <p><strong className="text-foreground">PDF Generation:</strong> html2pdf.js</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
