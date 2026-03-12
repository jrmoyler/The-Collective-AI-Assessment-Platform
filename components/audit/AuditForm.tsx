'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sections, questions } from '@/lib/questions';
import { AuditAnswers } from '@/types';
import QuestionRenderer from './QuestionRenderer';
import LoadingAssessment from './LoadingAssessment';

const STORAGE_KEY = 'collective_audit_answers';

export default function AuditForm() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [answers, setAnswers] = useState<Partial<AuditAnswers>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved answers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  const sectionQuestions = questions.filter((q) => q.section === currentSection);
  const totalSections = sections.length;
  const progress = ((currentSection - 1) / totalSections) * 100;

  const validateSection = () => {
    const newErrors: Record<string, string> = {};
    sectionQuestions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id as keyof AuditAnswers];
        if (val === undefined || val === null || val === '') {
          newErrors[q.id] = 'This field is required';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) return;
    if (currentSection < totalSections) {
      setCurrentSection((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentSection > 1) {
      setCurrentSection((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnswer = (id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateSection()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok || !data.assessment) {
        throw new Error(data.error || 'Assessment failed');
      }

      // Store results in sessionStorage
      sessionStorage.setItem('audit_result', JSON.stringify(data.assessment));
      sessionStorage.setItem('audit_answers', JSON.stringify(answers));
      localStorage.removeItem(STORAGE_KEY);

      router.push('/results');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      alert('Something went wrong. Please try again.');
    }
  };

  if (isLoading) return <LoadingAssessment />;

  const section = sections[currentSection - 1];

  return (
    <div style={{ backgroundColor: '#0B0F1C', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#D4A843' }}>C</div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>THE COLLECTIVE</span>
        </div>
        <div style={{ fontSize: 13, color: '#8B9BAE' }}>
          Section {currentSection} of {totalSections}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: 'rgba(139,155,174,0.15)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress + (100 / totalSections)}%`,
            background: 'linear-gradient(90deg, #D4A843, #f0c866)',
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* Section header */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {sections.map((s) => (
              <div
                key={s.id}
                style={{
                  width: 28,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: s.id <= currentSection ? '#D4A843' : 'rgba(139,155,174,0.2)',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#D4A843', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>
          {section.icon} SECTION {currentSection}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{section.title}</h1>
        <p style={{ color: '#8B9BAE', fontSize: 16, lineHeight: 1.6, marginBottom: 48 }}>{section.description}</p>
      </div>

      {/* Questions */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px' }}>
        {sectionQuestions.map((q, idx) => (
          <div key={q.id} style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 13, color: '#D4A843', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>
              Q{idx + 1}
            </div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 17, marginBottom: 12, lineHeight: 1.5 }}>
              {q.label}
              {q.required && <span style={{ color: '#D4A843', marginLeft: 4 }}>*</span>}
            </label>
            <QuestionRenderer
              question={q}
              value={answers[q.id as keyof AuditAnswers]}
              onChange={(val) => handleAnswer(q.id, val)}
            />
            {errors[q.id] && (
              <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{errors[q.id]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {currentSection > 1 ? (
          <button
            onClick={handleBack}
            style={{ background: 'rgba(139,155,174,0.1)', border: '1px solid rgba(139,155,174,0.2)', color: '#8B9BAE', padding: '14px 28px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
          >
            ← Back
          </button>
        ) : <div />}

        <button
          onClick={handleNext}
          style={{ background: '#D4A843', color: '#0B0F1C', padding: '14px 40px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', fontSize: 16, border: 'none' }}
        >
          {currentSection === totalSections ? 'Get My AI Readiness Score →' : 'Continue →'}
        </button>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
}
