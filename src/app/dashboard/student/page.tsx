// ==========================================
// STUDENT DASHBOARD PAGE
// Route: /dashboard/student
// Shows: Active missions, student profile
// ==========================================
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LucideLogOut, LucideRocket, LucideOrbit, LucideBookOpen, LucideCheckCircle, LucideLock, LucideTrophy, Gamepad2 as LucideGamepad2 } from 'lucide-react'
import { LEARNING_MODULES } from '@/data/learning-modules'

// Initialize Supabase Client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Removed hardcoded missions data

export default function StudentDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    const [learningModules, setLearningModules] = useState<any[]>([])
    const [assignments, setAssignments] = useState<any[]>([])
    const [userAttempts, setUserAttempts] = useState<any[]>([])

    // Extracted fetch function for reuse (on mount and on window focus)
    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError) throw profileError
            if (profileData.role !== 'student') {
                router.push('/dashboard/admin')
                return
            }
            setProfile(profileData)

            // 2. Parallel Fetching
            const [
                { data: learningAccess },
                { data: quizAccess },
                { data: premadeQuizzes },
                { data: customQuizzes },
                { data: attempts }
            ] = await Promise.all([
                // A. Fetch Learning Access
                supabase.from('institute_learning_access')
                    .select('module_id')
                    .eq('institute_id', profileData.institute_id),

                // B. Fetch Quiz Access (Premade)
                supabase.from('institute_quiz_access')
                    .select('quiz_id')
                    .eq('institute_id', profileData.institute_id),

                // C. Fetch All Premade Quizzes (to filter locally)
                supabase.from('quizzes')
                    .select('*')
                    .eq('is_premade', true),

                // D. Fetch Custom Quizzes (Created by Institute)
                supabase.from('quizzes')
                    .select('*')
                    .eq('institute_id', profileData.institute_id)
                    .eq('is_premade', false),

                // E. Fetch User Attempts
                supabase.from('attempts')
                    .select('quiz_id, score, passed')
                    .eq('student_id', user.id)
            ])

            // 3. Process Learning Modules
            const enabledModuleIds = new Set(learningAccess?.map((m: any) => m.module_id))
            const activeModules = LEARNING_MODULES.filter(m => enabledModuleIds.has(m.id))
            setLearningModules(activeModules)

            // 4. Process Assignments (Quizzes)
            const enabledQuizIds = new Set(quizAccess?.map((q: any) => q.quiz_id))
            const activePremadeQuizzes = (premadeQuizzes || []).filter((q: any) => enabledQuizIds.has(q.id))
            const allAssignments = [...activePremadeQuizzes, ...(customQuizzes || [])]
            setAssignments(allAssignments)

            setUserAttempts(attempts || [])

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch on mount + refetch on window focus
    useEffect(() => {
        fetchDashboardData()

        // Refetch data when window regains focus (e.g., after completing a quiz)
        const handleFocus = () => {
            fetchDashboardData()
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/?menu=open')
    }

    const getAssignmentStatus = (quizId: string) => {
        // FIX: Force both sides to String to handle number/string type mismatch from DB
        const relevantAttempts = userAttempts.filter(a => String(a.quiz_id) === String(quizId))
        const isCompleted = relevantAttempts.some(a => a.passed)
        const bestScore = relevantAttempts.length > 0 ? Math.max(...relevantAttempts.map(a => a.score)) : null
        return { isCompleted, bestScore }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm tracking-wider opacity-50">LOADING MISSION DATA...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200">
                        Welcome, Cadet {profile?.full_name?.split(' ')[0]}
                    </h1>
                    <p className="text-white/50 text-sm mt-1">Ready for your next assignment?</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all text-sm"
                >
                    <LucideLogOut size={16} />
                    <span className="hidden md:inline">Sign Out</span>
                </button>
            </header>

            <main className="max-w-6xl mx-auto space-y-12">

                {/* Section 1: Academy Training (Learning Modules) */}
                <section>
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full" />
                        Academy Training
                    </h2>

                    {learningModules.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-8 text-center text-white/40">
                            No learning modules assigned yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {learningModules.map((module, index) => (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group border border-white/10 bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center justify-center shadow-lg">
                                            <LucideBookOpen size={20} />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                                    <p className="text-white/60 text-sm mb-6 line-clamp-2">{module.description}</p>

                                    <Link
                                        href={`/learn/${module.id}`}
                                        className="block w-full py-2 rounded-lg text-sm font-medium text-center border border-blue-500/30 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all"
                                    >
                                        Read Now
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Section 2: School Assignments (Quizzes) */}
                <section>
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full" />
                        School Assignments
                    </h2>

                    {assignments.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-8 text-center text-white/40">
                            No assignments active at the moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.map((quiz, index) => {
                                const { isCompleted, bestScore } = getAssignmentStatus(quiz.id)

                                return (
                                    <motion.div
                                        key={quiz.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`group border rounded-2xl p-6 transition-all relative overflow-hidden ${isCompleted
                                            ? 'bg-purple-500/5 border-purple-500/30 hover:bg-purple-500/10'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {!isCompleted && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        )}

                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border ${isCompleted
                                                ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                                                : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                                                }`}>
                                                {isCompleted ? <LucideCheckCircle size={20} /> : <LucideRocket size={20} />}
                                            </div>

                                            {isCompleted && (
                                                <div className="flex items-center gap-1 text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                                                    <LucideTrophy size={12} />
                                                    SCORE: {bestScore}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                                        <p className="text-white/60 text-sm mb-6 line-clamp-2">{quiz.description}</p>

                                        <Link
                                            href={`/assignment/${quiz.id}`}
                                            className={`block w-full py-2 rounded-lg text-sm font-medium text-center border transition-all ${isCompleted
                                                ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white'
                                                : 'border-purple-500/30 text-purple-300 group-hover:bg-purple-500 group-hover:text-white'
                                                }`}
                                        >
                                            {isCompleted ? 'Retry Assignment' : 'Start Assignment'}
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </section>

            </main>
        </div>
    )
}
