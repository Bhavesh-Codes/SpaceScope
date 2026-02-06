'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { LucideBook, LucideLoader2, LucideCheckCircle, LucideXCircle } from 'lucide-react'
import { LEARNING_MODULES } from '@/data/learning-modules'

// Initialize Supabase Client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CurriculumManagerProps {
    instituteId: string
}

export default function CurriculumManager({ instituteId }: CurriculumManagerProps) {
    const [loading, setLoading] = useState(true)
    const [premadeQuizzes, setPremadeQuizzes] = useState<any[]>([])

    // Authorization States
    const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set())
    const [enabledQuizzes, setEnabledQuizzes] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Premade Quizzes
                const { data: quizzesData, error: quizzesError } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('is_premade', true)

                if (quizzesError) console.error('Error fetching quizzes:', quizzesError)
                else setPremadeQuizzes(quizzesData || [])

                // 2. Fetch Enabled Modules (Academy Training)
                const { data: modulesData, error: modulesError } = await supabase
                    .from('institute_learning_access')
                    .select('module_id')
                    .eq('institute_id', instituteId)

                if (modulesError) console.error('Error fetching module access:', modulesError)
                else {
                    const moduleIds = new Set(modulesData?.map((m: any) => m.module_id) || [])
                    setEnabledModules(moduleIds)
                }

                // 3. Fetch Enabled Quizzes (School Assignments)
                const { data: quizAccessData, error: quizAccessError } = await supabase
                    .from('institute_quiz_access')
                    .select('quiz_id')
                    .eq('institute_id', instituteId)

                if (quizAccessError) console.error('Error fetching quiz access:', quizAccessError)
                else {
                    const quizIds = new Set(quizAccessData?.map((q: any) => q.quiz_id) || [])
                    setEnabledQuizzes(quizIds)
                }

            } catch (error) {
                console.error('Error in CurriculumManager:', error)
            } finally {
                setLoading(false)
            }
        }

        if (instituteId) {
            fetchData()
        }
    }, [instituteId])

    const handleToggleModule = async (moduleId: string, currentState: boolean) => {
        // Optimistic Update
        const newState = !currentState
        setEnabledModules(prev => {
            const next = new Set(prev)
            if (newState) next.add(moduleId)
            else next.delete(moduleId)
            return next
        })

        try {
            if (newState) {
                // Insert
                const { error } = await supabase
                    .from('institute_learning_access')
                    .insert({ institute_id: instituteId, module_id: moduleId })
                if (error) throw error
            } else {
                // Delete
                const { error } = await supabase
                    .from('institute_learning_access')
                    .delete()
                    .match({ institute_id: instituteId, module_id: moduleId })
                if (error) throw error
            }
        } catch (error) {
            console.error('Error toggling module:', error)
            // Revert on error
            setEnabledModules(prev => {
                const next = new Set(prev)
                if (currentState) next.add(moduleId)
                else next.delete(moduleId)
                return next
            })
            alert('Failed to update status. Please try again.')
        }
    }

    const handleToggleQuiz = async (quizId: string, currentState: boolean) => {
        // Optimistic Update
        const newState = !currentState
        setEnabledQuizzes(prev => {
            const next = new Set(prev)
            if (newState) next.add(quizId)
            else next.delete(quizId)
            return next
        })

        try {
            if (newState) {
                // Insert
                const { error } = await supabase
                    .from('institute_quiz_access')
                    .insert({ institute_id: instituteId, quiz_id: quizId })
                if (error) throw error
            } else {
                // Delete
                const { error } = await supabase
                    .from('institute_quiz_access')
                    .delete()
                    .match({ institute_id: instituteId, quiz_id: quizId })
                if (error) throw error
            }
        } catch (error) {
            console.error('Error toggling quiz:', error)
            // Revert
            setEnabledQuizzes(prev => {
                const next = new Set(prev)
                if (currentState) next.add(quizId)
                else next.delete(quizId)
                return next
            })
            alert('Failed to update status. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LucideLoader2 className="animate-spin text-white/30 w-8 h-8" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
        >
            {/* Section 1: Academy Training (Learning Modules) */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" />
                    Academy Training
                </h2>
                <p className="text-white/50 mb-6">
                    Manage access to interactive learning modules for your cadets.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {LEARNING_MODULES.map((module) => {
                        const isEnabled = enabledModules.has(module.id)
                        return (
                            <div key={module.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${isEnabled ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}>
                                        <LucideBook size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{module.title}</h3>
                                        <p className="text-white/60 text-sm max-w-xl">{module.description}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggleModule(module.id, isEnabled)}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black ${isEnabled ? 'bg-green-500' : 'bg-white/10'}`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Section 2: School Assignments (Quizzes) */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full" />
                    School Assignments
                </h2>
                <p className="text-white/50 mb-6">
                    Assign standardized missions and quizzes to your class.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {premadeQuizzes.map((quiz) => {
                        const isEnabled = enabledQuizzes.has(quiz.id)
                        return (
                            <div key={quiz.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${isEnabled ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}>
                                        <LucideCheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{quiz.title}</h3>
                                        <p className="text-white/60 text-sm max-w-xl">{quiz.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40 uppercase tracking-wider">
                                            <span>{quiz.topic}</span>
                                            <span>•</span>
                                            <span>Standard Mission</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleToggleQuiz(quiz.id, isEnabled)}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black ${isEnabled ? 'bg-green-500' : 'bg-white/10'}`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        )
                    })}

                    {premadeQuizzes.length === 0 && (
                        <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl">
                            <LucideLoader2 className="w-8 h-8 text-white/30 animate-spin mx-auto mb-2" />
                            <p className="text-white/40">Loading assessments...</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
