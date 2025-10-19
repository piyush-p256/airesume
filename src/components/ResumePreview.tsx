import React from 'react';
import { ResumeData, Section } from '../pages/BuilderPage';
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  onDataChange: (data: ResumeData) => void;
}

const Editable = ({ value, onSave, className = '' }: { value: string, onSave: (v: string) => void, className?: string }) => (
  <span
    contentEditable
    suppressContentEditableWarning
    className={`hover:bg-blue-100 focus:bg-blue-100 focus:outline-none rounded px-1 ${className}`}
    onBlur={(e) => onSave(e.currentTarget.innerText)}
    dangerouslySetInnerHTML={{ __html: value || '' }}
  />
);

const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, onDataChange }, ref) => {

  const handleFieldChange = (field: keyof ResumeData, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    const newSections = data.sections.map(section => 
      section.id === sectionId ? { ...section, title: newTitle } : section
    );
    onDataChange({ ...data, sections: newSections });
  };

  const handleSectionContentChange = (sectionId: string, newContent: any) => {
    const newSections = data.sections.map(section =>
      section.id === sectionId ? { ...section, content: newContent } : section
    );
    onDataChange({ ...data, sections: newSections });
  };

  const renderSectionContent = (section: Section) => {
    switch (section.type) {
      case 'professional_summary':
        return (
          <Editable 
            value={section.content} 
            onSave={(v) => handleSectionContentChange(section.id, v)} 
          />
        );
      case 'education':
        return (
          <div>
            {section.content.map((edu: any, index: number) => (
              <div key={index} className="mb-2 relative group">
                 <div className="flex justify-between items-start">
                  <p className="font-bold"><Editable value={edu.school} onSave={(v) => {
                    const newContent = [...section.content];
                    newContent[index] = { ...newContent[index], school: v };
                    handleSectionContentChange(section.id, newContent);
                  }} /></p>
                  <p className="italic"><Editable value={edu.year} onSave={(v) => {
                    const newContent = [...section.content];
                    newContent[index] = { ...newContent[index], year: v };
                    handleSectionContentChange(section.id, newContent);
                  }} /></p>
                </div>
                <p className="italic"><Editable value={edu.degree} onSave={(v) => {
                  const newContent = [...section.content];
                  newContent[index] = { ...newContent[index], degree: v };
                  handleSectionContentChange(section.id, newContent);
                }} /></p>
                <button onClick={() => {
                  const newContent = section.content.filter((_: any, i: number) => i !== index);
                  handleSectionContentChange(section.id, newContent);
                }} className="absolute -top-2 -right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={() => {
              const newContent = [...section.content, { school: 'New University', degree: 'New Degree', year: 'Year' }];
              handleSectionContentChange(section.id, newContent);
            }} className="text-blue-500"><PlusCircle size={16} /></button>
          </div>
        );
      case 'skills':
        return (
          <div>
            <p><span className="font-bold">Programming Languages:</span> <Editable value={(section.content.programmingLanguages || []).join(', ')} onSave={(v) => handleSectionContentChange(section.id, { ...section.content, programmingLanguages: v.split(',').map(s => s.trim())})} /></p>
            <p><span className="font-bold">Frameworks & Libraries:</span> <Editable value={(section.content.frameworks || []).join(', ')} onSave={(v) => handleSectionContentChange(section.id, { ...section.content, frameworks: v.split(',').map(s => s.trim())})} /></p>
            <p><span className="font-bold">Database Management:</span> <Editable value={(section.content.databaseManagement || []).join(', ')} onSave={(v) => handleSectionContentChange(section.id, { ...section.content, databaseManagement: v.split(',').map(s => s.trim())})} /></p>
            <p><span className="font-bold">Developer Tools:</span> <Editable value={(section.content.versionControl || []).join(', ')} onSave={(v) => handleSectionContentChange(section.id, { ...section.content, versionControl: v.split(',').map(s => s.trim())})} /></p>
            <p><span className="font-bold">Cloud Platforms:</span> <Editable value={(section.content.cloudPlatforms || []).join(', ')} onSave={(v) => handleSectionContentChange(section.id, { ...section.content, cloudPlatforms: v.split(',').map(s => s.trim())})} /></p>
          </div>
        );
      case 'projects':
        return (
          <div>
            {section.content.map((proj: any, index: number) => (
              <div key={index} className="mb-3 relative group">
                <h3 className="font-bold"><Editable value={proj.name} onSave={(v) => {
                  const newContent = [...section.content];
                  newContent[index] = { ...newContent[index], name: v };
                  handleSectionContentChange(section.id, newContent);
                }} /> | <span className="font-normal italic"><Editable value={proj.tech} onSave={(v) => {
                  const newContent = [...section.content];
                  newContent[index] = { ...newContent[index], tech: v };
                  handleSectionContentChange(section.id, newContent);
                }} /></span></h3>
                <p>
                  <Editable value={proj.githubLink} onSave={(v) => {
                     const newContent = [...section.content];
                     newContent[index] = { ...newContent[index], githubLink: v };
                     handleSectionContentChange(section.id, newContent);
                  }} /> |{' '}
                  <Editable value={proj.liveLink} onSave={(v) => {
                     const newContent = [...section.content];
                     newContent[index] = { ...newContent[index], liveLink: v };
                     handleSectionContentChange(section.id, newContent);
                  }} />
                </p>
                <ul className="list-disc list-inside mt-1">
                  {Array.isArray(proj.description) && proj.description.map((desc: string, i: number) => (
                    <li key={i}><Editable value={desc} onSave={(v) => {
                      const newDescriptions = [...proj.description];
                      newDescriptions[i] = v;
                      const newContent = [...section.content];
                      newContent[index] = { ...newContent[index], description: newDescriptions };
                      handleSectionContentChange(section.id, newContent);
                    }} /></li>
                  ))}
                </ul>
                {/* Add new description point button */}
                <button onClick={() => {
                  const newDescriptions = Array.isArray(proj.description) ? [...proj.description, 'New description point'] : ['New description point'];
                  const newContent = [...section.content];
                  newContent[index] = { ...newContent[index], description: newDescriptions };
                  handleSectionContentChange(section.id, newContent);
                }} className="text-blue-500 flex items-center gap-1 mt-1"><PlusCircle size={16} /> Add Point</button>
                <button onClick={() => {
                  const newContent = section.content.filter((_: any, i: number) => i !== index);
                  handleSectionContentChange(section.id, newContent);
                }} className="absolute -top-2 -right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={() => {
              const newContent = [...section.content, { name: 'New Project', tech: 'Tech Stack', githubLink: 'github.com', liveLink: 'live.com', description: ['Description point 1'] }];
              handleSectionContentChange(section.id, newContent);
            }} className="text-blue-500"><PlusCircle size={16} /></button>
          </div>
        );
      case 'experience':
        return (
          <div>
            {section.content.map((exp: any, index: number) => (
              <div key={index} className="mb-3 relative group">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold"><Editable value={exp.company} onSave={(v) => {
                    const newContent = [...section.content];
                    newContent[index] = { ...newContent[index], company: v };
                    handleSectionContentChange(section.id, newContent);
                  }} /></h3>
                  <p className="italic"><Editable value={exp.duration} onSave={(v) => {
                    const newContent = [...section.content];
                    newContent[index] = { ...newContent[index], duration: v };
                    handleSectionContentChange(section.id, newContent);
                  }} /></p>
                </div>
                <p className="italic"><Editable value={exp.position} onSave={(v) => {
                  const newContent = [...section.content];
                  newContent[index] = { ...newContent[index], position: v };
                  handleSectionContentChange(section.id, newContent);
                }} /></p>
                <ul className="list-disc list-inside mt-1">
                  {Array.isArray(exp.description) && exp.description.map((desc, i) => (
                    <li key={i}><Editable value={desc} onSave={(v) => {
                      const newDescriptions = [...exp.description];
                      newDescriptions[i] = v;
                      const newContent = [...section.content];
                      newContent[index] = { ...newContent[index], description: newDescriptions };
                      handleSectionContentChange(section.id, newContent);
                    }} /></li>
                  ))}
                </ul>
                <button onClick={() => {
                  const newContent = section.content.filter((_: any, i: number) => i !== index);
                  handleSectionContentChange(section.id, newContent);
                }} className="absolute -top-2 -right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={() => {
              const newContent = [...section.content, { company: 'New Company', position: 'Position', duration: 'Date Range', description: ['Responsibility 1'] }];
              handleSectionContentChange(section.id, newContent);
            }} className="text-blue-500"><PlusCircle size={16} /></button>
          </div>
        );
      case 'achievements':
        return (
          <div>
            <ul className="list-disc list-inside">
              {section.content.map((item: any, index: number) => (
                <li key={index} className="relative group">
                  <Editable value={`${item.description} - ${item.name}`} onSave={(v) => {
                    const newContent = [...section.content];
                    const parts = v.split(' - ');
                    newContent[index] = { ...newContent[index], description: parts[0], name: parts[1] };
                    handleSectionContentChange(section.id, newContent);
                  }} />
                  <button onClick={() => {
                    const newContent = section.content.filter((_: any, i: number) => i !== index);
                    handleSectionContentChange(section.id, newContent);
                  }} className="absolute top-0 -right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            <button onClick={() => {
              const newContent = [...section.content, { name: 'New Achievement', description: 'Description' }];
              handleSectionContentChange(section.id, newContent);
            }} className="text-blue-500 mt-1"><PlusCircle size={16} /></button>
          </div>
        );
      case 'positionsOfResponsibility':
        return (
          <div>
            {section.content.map((pos: any, index: number) => (
              <div key={index} className="mb-3 relative group">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold"><Editable value={pos.position} onSave={(v) => {
                    const newContent = [...section.content];
                    newContent[index] = { ...newContent[index], position: v };
                    handleSectionContentChange(section.id, newContent);
                  }} /></h3>
                  <p className="italic"><Editable value={pos.duration} onSave={(v) => {
                    const newContent = [...section.content];
                    newContent[index] = { ...newContent[index], duration: v };
                    handleSectionContentChange(section.id, newContent);
                  }} /></p>
                </div>
                <p className="italic"><Editable value={pos.organization} onSave={(v) => {
                  const newContent = [...section.content];
                  newContent[index] = { ...newContent[index], organization: v };
                  handleSectionContentChange(section.id, newContent);
                }} /></p>
                <ul className="list-disc list-inside mt-1">
                  {Array.isArray(pos.description) && pos.description.map((desc, i) => (
                    <li key={i}><Editable value={desc} onSave={(v) => {
                      const newDescriptions = [...pos.description];
                      newDescriptions[i] = v;
                      const newContent = [...section.content];
                      newContent[index] = { ...newContent[index], description: newDescriptions };
                      handleSectionContentChange(section.id, newContent);
                    }} /></li>
                  ))}
                </ul>
                <button onClick={() => {
                  const newContent = section.content.filter((_: any, i: number) => i !== index);
                  handleSectionContentChange(section.id, newContent);
                }} className="absolute -top-2 -right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={() => {
              const newContent = [...section.content, { organization: 'New Organization', position: 'Position', duration: 'Date Range', description: ['Responsibility 1'] }];
              handleSectionContentChange(section.id, newContent);
            }} className="text-blue-500"><PlusCircle size={16} /></button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={ref} className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200 text-sm">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-wider"><Editable value={data.name} onSave={(v) => handleFieldChange('name', v)} /></h1>
        <p className="mt-2">
          <Editable value={data.phone} onSave={(v) => handleFieldChange('phone', v)} /> |{' '}
          <Editable value={data.email} onSave={(v) => handleFieldChange('email', v)} /> |{' '}
          <Editable value={data.linkedin} onSave={(v) => handleFieldChange('linkedin', v)} /> |{' '}
          <Editable value={data.github} onSave={(v) => handleFieldChange('github', v)} />
        </p>
      </header>

      {/* Professional Summary */}
      <section className="mb-4">
        <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
        <Editable value={data.professional_summary} onSave={(v) => handleFieldChange('professional_summary', v)} />
      </section>

      {/* Sections */}
      {data.sections.map((section, index) => (
        <section key={section.id} className="mb-4 relative group">
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-gray-100 rounded-md p-1">
            <button onClick={() => {}} disabled={index === 0} className="p-1 text-gray-600 hover:text-black disabled:opacity-20"><ArrowUp size={16} /></button>
            <button onClick={() => {}} disabled={index === data.sections.length - 1} className="p-1 text-gray-600 hover:text-black disabled:opacity-20"><ArrowDown size={16} /></button>
            <button onClick={() => {}} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
          </div>
          <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-2">
            <Editable value={section.title} onSave={(v) => handleSectionTitleChange(section.id, v)} />
          </h2>
          {renderSectionContent(section)}
        </section>
      ))}

    </div>
  );
});

export default ResumePreview;
