// ==========================================
// CREATE QUIZ PAGE (Admin Only)
// Route: /dashboard/admin/create-quiz
// Admin can build custom quizzes/missions
// ==========================================
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LucidePlus, LucideTrash2, LucideSave, LucideArrowLeft,
    LucideLoader2, LucideCheckCircle, LucideRocket, LucideEye
} from 'lucide-react'

// Initialize Supabase Client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Question = {
    id: string
    text: string
    options: string[]
    correctAnswer: number // 0, 1, 2, 3
}

export default function CreateQuizPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [questions, setQuestions] = useState<Question[]>([
        { id: '1', text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ])
    const [previewIndex, setPreviewIndex] = useState(0)
    const [leftWidth, setLeftWidth] = useState(60) // Percentage
    const [isResizing, setIsResizing] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [instituteId, setInstituteId] = useState<string | null>(null)

    // Fetch User & Institute
    useEffect(() => {
        const fetchContext = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            const { data: profile } = await supabase
                .from('profiles')
                .select('institute_id, role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                router.push('/')
                return
            }
            setInstituteId(profile.institute_id)
        }
        fetchContext()
    }, [router])

    // --- Resize Handler ---
    const handleMouseDown = () => {
        setIsResizing(true)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return
        const newWidth = (e.clientX / window.innerWidth) * 100
        if (newWidth > 20 && newWidth < 80) { // Limits: 20% to 80%
            setLeftWidth(newWidth)
        }
    }

    const handleMouseUp = () => {
        setIsResizing(false)
    }

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove as any)
            window.addEventListener('mouseup', handleMouseUp)
            return () => {
                window.removeEventListener('mousemove', handleMouseMove as any)
                window.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isResizing])

    // --- Actions ---

    const handleAddQuestion = () => {
        const newId = Date.now().toString()
        setQuestions([
            ...questions,
            { id: newId, text: '', options: ['', '', '', ''], correctAnswer: 0 }
        ])
        setPreviewIndex(questions.length) // Switch preview to new question
    }

    const handleRemoveQuestion = (id: string, index: number) => {
        if (questions.length === 1) return
        const newQuestions = questions.filter(q => q.id !== id)
        setQuestions(newQuestions)
        // Adjust preview index if needed
        if (previewIndex >= newQuestions.length) {
            setPreviewIndex(newQuestions.length - 1)
        }
    }

    const updateQuestionText = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
    }

    const updateOption = (qId: string, optIndex: number, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options]
                newOptions[optIndex] = text
                return { ...q, options: newOptions }
            }
            return q
        }))
    }

    const updateCorrectAnswer = (qId: string, answerIndex: number) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, correctAnswer: answerIndex } : q))
    }

    const handlePublish = async () => {
        if (!title.trim() || !description.trim()) {
            alert('Please provide a Mission Title and Briefing.')
            return
        }

        // Validation
        for (const q of questions) {
            if (!q.text.trim()) {
                alert('All questions must have text.')
                return
            }
            if (q.options.some(opt => !opt.trim())) {
                alert('All options must be filled for every question.')
                return
            }
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('quizzes')
                .insert({
                    title,
                    description,
                    topic: 'Custom Mission',
                    questions_json: questions,
                    institute_id: instituteId,
                    created_by: userId
                })

            if (error) throw error

            alert('Mission Launched Successfully!')
            router.push('/dashboard/admin')
        } catch (error: any) {
            console.error('Launch failed:', error)
            alert('Launch Aborted: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Render ---

    return (
        <div className="min-h-screen bg-black text-white flex flex-col h-screen overflow-hidden">

            {/* Top Bar */}
            <header className="flex-none h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        title="Back to Command Center"
                    >
                        <LucideArrowLeft size={20} />
                    </button>
                    <span className="text-sm font-mono text-white/30 uppercase tracking-widest border-l border-white/10 pl-4">Mission Builder</span>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {title || 'New Untitled Mission'}
                </h1>
                <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-green-900/20 transition-all text-sm"
                >
                    {loading ? <LucideLoader2 className="animate-spin w-4 h-4" /> : <><LucideSave size={16} /> Publish Quiz</>}
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* LEFT: Builder Panel */}
                <div className="overflow-y-auto p-8 space-y-8 bg-black" style={{ width: `${leftWidth}%` }}>

                    {/* Meta Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-base font-semibold text-purple-300 uppercase tracking-wider mb-2">Mission Parameters</h2>
                        <div>
                            <label className="block text-sm text-white/50 mb-2 font-medium">Mission Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Operation: Stellar Dust"
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-xl font-bold text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/50 mb-2 font-medium">Briefing</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe the objectives..."
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-base text-white/80 focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                            />
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-blue-300 uppercase tracking-wider">Flight Checks (Questions)</h2>
                            <span className="text-sm text-white/40">{questions.length} Total</span>
                        </div>

                        <AnimatePresence mode='popLayout'>
                            {questions.map((q, idx) => (
                                <motion.div
                                    key={q.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => setPreviewIndex(idx)}
                                    className={`relative rounded-xl border p-5 transition-all cursor-pointer group ${previewIndex === idx ? 'bg-white/10 border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-mono px-2 py-1 rounded ${previewIndex === idx ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'}`}>Q{idx + 1}</span>
                                            {q.text ? <span className="text-base font-medium truncate max-w-[250px]">{q.text}</span> : <span className="text-base text-white/20 italic">Empty Question</span>}
                                        </div>
                                        {questions.length > 1 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(q.id, idx); }}
                                                className="text-white/20 hover:text-red-400 p-1"
                                            >
                                                <LucideTrash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={q.text}
                                            onChange={e => updateQuestionText(q.id, e.target.value)}
                                            placeholder="Enter question text..."
                                            className="w-full bg-black/30 border border-white/5 rounded px-4 py-3 text-base focus:outline-none focus:border-blue-500/50 transition-colors"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={q.correctAnswer === optIdx}
                                                        onChange={() => updateCorrectAnswer(q.id, optIdx)}
                                                        className="accent-green-500 w-3 h-3"
                                                        title="Mark as Correct Answer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={e => updateOption(q.id, optIdx, e.target.value)}
                                                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                        className={`w-full bg-black/30 border rounded px-3 py-2 text-sm focus:outline-none transition-colors ${q.correctAnswer === optIdx ? 'border-green-500/30 text-green-300' : 'border-white/5 text-white/70'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Visual Indicator of Correct Answer */}
                                        <div className="text-xs text-white/40 flex justify-end">
                                            Correct Answer: <span className="text-green-400 font-mono ml-1">{String.fromCharCode(65 + q.correctAnswer)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button
                            onClick={handleAddQuestion}
                            className="w-full py-5 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-base font-medium"
                        >
                            <LucidePlus size={18} /> Add Question Segment
                        </button>
                    </div>
                </div>

                {/* Resizable Divider */}
                <div
                    className={`w-1 bg-white/10 hover:bg-blue-500/50 transition-colors cursor-col-resize flex-shrink-0 relative group ${isResizing ? 'bg-blue-500' : ''}`}
                    onMouseDown={handleMouseDown}
                >
                    <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
                </div>

                {/* RIGHT: Live Preview */}
                <div className="bg-black/50 relative flex items-center justify-center p-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 to-transparent" style={{ width: `${100 - leftWidth}%` }}>
                    <div className="absolute top-6 right-6 flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest font-mono pointer-events-none">
                        <LucideEye size={14} /> Live Preview
                    </div>

                    <div className="w-full max-w-lg">
                        {questions[previewIndex] && (
                            <motion.div
                                key={previewIndex} // Re-animate on switch
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-blue-900/20"
                            >
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                                            QUESTION {previewIndex + 1} OF {questions.length}
                                        </span>
                                        <span className="text-xs text-white/40">100 Points</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white leading-tight">
                                        {questions[previewIndex].text || <span className="opacity-30 italic">Question text will appear here...</span>}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {questions[previewIndex].options.map((opt, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border transition-all ${questions[previewIndex].correctAnswer === idx
                                                ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                                : 'bg-white/5 border-white/10 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${questions[previewIndex].correctAnswer === idx ? 'bg-green-400 text-black' : 'bg-white/10 text-white/50'
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className={`text-sm ${questions[previewIndex].correctAnswer === idx ? 'text-green-100' : 'text-white/70'}`}>
                                                        {opt || "Option text..."}
                                                    </span>
                                                </div>
                                                {questions[previewIndex].correctAnswer === idx && <LucideCheckCircle size={18} className="text-green-400" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        <p className="text-center text-white/20 text-xs mt-8 font-light">
                            Students will see this exact card during the mission.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
