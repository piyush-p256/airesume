import { forwardRef, useState } from 'react'
import { Mail, Phone, MapPin, Edit2, Check, X } from 'lucide-react'
import type { ResumeData } from '../pages/BuilderPage'

interface ResumePreviewProps {
  data: ResumeData
  onDataChange: (data: ResumeData) => void
  theme: 'dark' | 'light'
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, onDataChange, theme }, ref) => {
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')

    const startEdit = (field: string, value: string) => {
      setEditingField(field)
      setEditValue(value)
    }

    const saveEdit = (field: string) => {
      const keys = field.split('.')
      const newData = { ...data }
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = editValue
      onDataChange(newData)
      setEditingField(null)
    }

    const cancelEdit = () => {
      setEditingField(null)
      setEditValue('')
    }

    const EditableText = ({
      field,
      value,
      className,
      multiline = false,
    }: {
      field: string
      value: string
      className?: string
      multiline?: boolean
    }) => {
      const isEditing = editingField === field

      if (isEditing) {
        return (
          <div className="flex items-start gap-2">
            {multiline ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 bg-background border border-primary rounded text-sm resize-none"
                rows={3}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 bg-background border border-primary rounded text-sm"
                autoFocus
              />
            )}
            <div className="flex gap-1">
              <button
                onClick={() => saveEdit(field)}
                className="p-1 hover:bg-primary/20 rounded"
              >
                <Check className="w-4 h-4 text-green-500" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 hover:bg-primary/20 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )
      }

      return (
        <div
          onClick={() => startEdit(field, value)}
          className={`cursor-pointer hover:bg-primary/10 rounded px-2 py-1 -mx-2 -my-1 group ${className}`}
        >
          {value}
          <Edit2 className="w-3 h-3 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={`${
          theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
        } shadow-2xl rounded-lg overflow-hidden`}
      >
        <div className="p-8 md:p-12 space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6" style={{ borderColor: theme === 'dark' ? '#333' : '#e5e7eb' }}>
            <EditableText
              field="name"
              value={data.name}
              className="text-4xl font-bold mb-2"
            />
            <EditableText
              field="title"
              value={data.title}
              className="text-xl text-gray-400 mb-4"
            />
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <EditableText field="email" value={data.email} />
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <EditableText field="phone" value={data.phone} />
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <EditableText field="location" value={data.location} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">Professional Summary</h2>
            <EditableText
              field="summary"
              value={data.summary}
              className="text-gray-300 leading-relaxed"
              multiline
            />
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Experience</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <EditableText
                      field={`experience.${index}.position`}
                      value={exp.position}
                      className="text-xl font-semibold"
                    />
                    <EditableText
                      field={`experience.${index}.company`}
                      value={exp.company}
                      className="text-gray-400"
                    />
                  </div>
                  <EditableText
                    field={`experience.${index}.duration`}
                    value={exp.duration}
                    className="text-gray-400 text-sm"
                  />
                </div>
                <EditableText
                  field={`experience.${index}.description`}
                  value={exp.description}
                  className="text-gray-300"
                  multiline
                />
              </div>
            ))}
          </section>

          {/* Education */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Education</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <EditableText
                      field={`education.${index}.degree`}
                      value={edu.degree}
                      className="text-lg font-semibold"
                    />
                    <EditableText
                      field={`education.${index}.school`}
                      value={edu.school}
                      className="text-gray-400"
                    />
                  </div>
                  <EditableText
                    field={`education.${index}.year`}
                    value={edu.year}
                    className="text-gray-400"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Projects</h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <EditableText
                  field={`projects.${index}.name`}
                  value={project.name}
                  className="text-xl font-semibold mb-1"
                />
                <EditableText
                  field={`projects.${index}.description`}
                  value={project.description}
                  className="text-gray-300 mb-1"
                  multiline
                />
                <EditableText
                  field={`projects.${index}.tech`}
                  value={project.tech}
                  className="text-sm text-gray-400"
                />
              </div>
            ))}
          </section>
        </div>
      </div>
    )
  }
)

ResumePreview.displayName = 'ResumePreview'

export default ResumePreview
