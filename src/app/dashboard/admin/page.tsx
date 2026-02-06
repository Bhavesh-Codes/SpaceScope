// ==========================================
// ADMIN DASHBOARD PAGE
// Route: /dashboard/admin
// Shows: Institute stats, student roster, payment gate
// ==========================================
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LucideLayoutDashboard, LucideUsers, LucideLogOut, LucideActivity, LucideShield, LucideCheckCircle, LucideLoader2, LucideCopy, LucideCalendar, LucideBook, LucideGraduationCap, LucideTrophy, LucideTrendingUp } from 'lucide-react'
import CurriculumManager from '@/components/dashboard/CurriculumManager'

// Initialize Supabase Client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [institute, setInstitute] = useState<any>(null)
    const [studentCount, setStudentCount] = useState(0)
    const [students, setStudents] = useState<any[]>([])
    const [attempts, setAttempts] = useState<any[]>([])
    const [studentStats, setStudentStats] = useState<Record<string, { completed: number, avgScore: string }>>({})

    // Curriculum State
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'students'>('overview')

    // Payment State
    const [isActivating, setIsActivating] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }

                // Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profileError) throw profileError
                if (profileData.role !== 'admin') {
                    router.push('/dashboard/student') // fallback protection
                    return
                }
                setProfile(profileData)

                // Fetch Institute
                const { data: instituteData, error: instError } = await supabase
                    .from('institutes')
                    .select('*')
                    .eq('id', profileData.institute_id)
                    .single()

                if (instError) throw instError
                setInstitute(instituteData)

                // Fetch Student Count & List
                const { data: studentsData, count, error: studentError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact' })
                    .eq('institute_id', profileData.institute_id)
                    .eq('role', 'student')
                    .order('created_at', { ascending: false })

                if (studentError) throw studentError
                setStudentCount(count || 0)
                setStudents(studentsData || [])

                // Calculate Stats for Students
                if (studentsData && studentsData.length > 0) {
                    const studentIds = studentsData.map((s: any) => s.id)
                    const { data: allAttempts } = await supabase
                        .from('attempts')
                        .select('student_id, score, passed, quiz_id')
                        .in('student_id', studentIds)

                    const stats: Record<string, { completed: number, avgScore: string }> = {}
                    studentsData.forEach((student: any) => {
                        const studentAttempts = (allAttempts || []).filter((a: any) => a.student_id === student.id)
                        const passedQuizzes = new Set(studentAttempts.filter((a: any) => a.passed).map((a: any) => a.quiz_id))
                        const scores = studentAttempts.map((a: any) => a.score)
                        const avg = scores.length > 0 ? (scores.reduce((a: any, b: any) => a + b, 0) / scores.length).toFixed(1) : '0.0'

                        stats[student.id] = { completed: passedQuizzes.size, avgScore: avg }
                    })
                    setStudentStats(stats)
                }

                // Fetch Recent Quiz Attempts
                const { data: attemptsData, error: attemptsError } = await supabase
                    .from('attempts')
                    .select('*, student_email, quiz_title, score, passed, created_at')
                    .order('created_at', { ascending: false })
                    .limit(10)

                if (attemptsError) {
                    console.error('Error fetching attempts:', attemptsError)
                } else {
                    setAttempts(attemptsData || [])
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/?menu=open')
    }



    const handlePayment = async () => {
        setIsActivating(true)

        // Simulate Stripe API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
            const { error } = await supabase
                .from('institutes')
                .update({ status: 'active' })
                .eq('id', institute.id)

            if (error) throw error

            // Update local state to reflect change immediately
            setInstitute({ ...institute, status: 'active' })
        } catch (err) {
            console.error('Payment failed:', err)
            // Ideally show an error toast here
        } finally {
            setIsActivating(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm tracking-wider opacity-50">INITIALIZING COMMAND CENTER...</p>
                </div>
            </div>
        )
    }

    // --- PAYMENT GATE ---
    if (institute?.status !== 'active') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                            <LucideShield className="text-purple-400 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Activation Required</h1>
                        <p className="text-white/60">Your institute account needs to be activated to access the dashboard.</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/10 rounded-xl p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <LucideActivity size={64} />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Standard Plan</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-bold text-white">$99</span>
                            <span className="text-white/50">/month</span>
                        </div>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li className="flex items-center gap-2"><LucideCheckCircle size={16} className="text-green-400" /> Unlimited Students</li>
                            <li className="flex items-center gap-2"><LucideCheckCircle size={16} className="text-green-400" /> Advanced Analytics</li>
                            <li className="flex items-center gap-2"><LucideCheckCircle size={16} className="text-green-400" /> 24/7 Priority Support</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handlePayment}
                            disabled={isActivating}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                        >
                            {isActivating ? <LucideLoader2 className="animate-spin" /> : 'Activate Now'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full text-white/40 hover:text-white text-sm py-2 transition-colors"
                        >
                            Sign Out & Return Later
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-md hidden md:flex flex-col p-6">
                <div className="flex items-center gap-2 mb-10 text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                    <LucideLayoutDashboard className="text-purple-400" />
                    SpaceScope
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LucideActivity size={18} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('curriculum')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'curriculum' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LucideBook size={18} />
                        Curriculum Manager
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'students' ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LucideUsers size={18} />
                        Students
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/admin/create-quiz')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white rounded-lg transition-all"
                    >
                        <LucideActivity size={18} />
                        Create Quiz
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all mt-auto"
                >
                    <LucideLogOut size={18} />
                    Sign Out
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto w-full">
                <header className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Welcome to {institute?.name}</h1>
                        <p className="text-white/40 text-sm">Commander {profile?.full_name}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-right">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Your Student Code</p>
                        <p className="text-2xl font-mono text-green-400 font-bold tracking-wider">{institute?.code}</p>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Stats Card */}
                            <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <LucideUsers size={48} />
                                    </div>
                                    <h3 className="text-white/50 text-sm uppercase tracking-wider mb-2">Total Students</h3>
                                    <p className="text-5xl font-bold text-white mb-4">{studentCount}</p>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[60%]" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Student Roster Section */}
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full" />
                            Cadet Roster
                        </h2>

                        {students.length === 0 ? (
                            // Empty State
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LucideUsers className="text-white/30" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No cadets registered yet</h3>
                                <p className="text-white/50 text-sm max-w-sm mx-auto mb-8">
                                    Share your institute access code with your students. Once they register using this code, they will appear here.
                                </p>

                                <div className="inline-flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-4 pr-6">
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-widest text-white/30">Access Code</p>
                                        <p className="text-xl font-mono text-green-400 font-bold">{institute?.code}</p>
                                    </div>
                                    <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors text-white/60 hover:text-white" title="Copy Code">
                                        <LucideCopy size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            // Student Table
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 font-medium">Cadet Name</th>
                                            <th className="p-4 font-medium">Email</th>
                                            <th className="p-4 font-medium">Joined Date</th>
                                            <th className="p-4 font-medium text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {students.map((student) => (
                                            <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 font-medium text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {student.full_name?.charAt(0) || 'C'}
                                                    </div>
                                                    {student.full_name}
                                                </td>
                                                <td className="p-4 text-white/60 text-sm">{student.email || 'N/A'}</td>
                                                <td className="p-4 text-white/60 text-sm font-mono flex items-center gap-2">
                                                    <LucideCalendar size={14} className="opacity-50" />
                                                    {new Date(student.created_at || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}

                        {/* Recent Activity Section */}
                        <h2 className="text-xl font-bold mb-4 mt-12 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full" />
                            Recent Activity
                        </h2>

                        {attempts.length === 0 ? (
                            // Empty State
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LucideActivity className="text-white/30" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No quiz attempts yet</h3>
                                <p className="text-white/50 text-sm max-w-sm mx-auto">
                                    Once students start taking quizzes, their attempts will appear here.
                                </p>
                            </motion.div>
                        ) : (
                            // Activity Table
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 font-medium">Student Email</th>
                                            <th className="p-4 font-medium">Quiz</th>
                                            <th className="p-4 font-medium">Score</th>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {attempts.map((attempt, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 font-medium text-white/80 text-sm">
                                                    {attempt.student_email || 'N/A'}
                                                </td>
                                                <td className="p-4 text-white/60 text-sm">
                                                    {attempt.quiz_title || 'Unknown Quiz'}
                                                </td>
                                                <td className="p-4 text-white/60 text-sm font-mono">
                                                    {attempt.score}/7
                                                </td>
                                                <td className="p-4 text-white/60 text-sm font-mono flex items-center gap-2">
                                                    <LucideCalendar size={14} className="opacity-50" />
                                                    {new Date(attempt.created_at || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${attempt.passed
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                        {attempt.passed ? (
                                                            <>
                                                                <LucideCheckCircle size={12} />
                                                                Passed
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                Failed
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </>
                )}

                {activeTab === 'curriculum' && (
                    <CurriculumManager instituteId={institute?.id} />
                )}

                {activeTab === 'students' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full" />
                            Cadet Directory
                        </h2>
                        <p className="text-white/50 mb-8">
                            Manage and track progress of your registered cadets.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Cadet Name</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Missions Completed</th>
                                        <th className="p-4 font-medium">Avg Score</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {students.map((student) => {
                                        const stats = studentStats[student.id] || { completed: 0, avgScore: '0.0' }
                                        return (
                                            <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 font-medium text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {student.full_name?.charAt(0) || 'C'}
                                                    </div>
                                                    {student.full_name}
                                                </td>
                                                <td className="p-4 text-white/60 text-sm">{student.email || 'N/A'}</td>
                                                <td className="p-4 text-white/60 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <LucideCheckCircle size={14} className={stats.completed > 0 ? "text-green-400" : "text-white/20"} />
                                                        <span className="font-mono">{stats.completed}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-white/60 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <LucideTrendingUp size={14} className="text-blue-400" />
                                                        <span className="font-mono">{stats.avgScore}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button className="text-xs font-medium text-blue-300 hover:text-white px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-500 transition-all">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-white/40">
                                                No cadets found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
