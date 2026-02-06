// ==========================================
// LOGIN / AUTHENTICATION PAGE
// Route: /login
// Handles: Login, Admin Registration, Student Registration
// ==========================================
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { LucideShield, LucideGraduationCap, LucideLoader2, LucideCheckCircle, LucideArrowLeft, LucideRocket } from 'lucide-react'

// Initialize Supabase Client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type View = 'login' | 'register-admin' | 'register-student'

export default function LoginPage() {
    const router = useRouter()
    const [view, setView] = useState<View>('login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Forms
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        code: '' // Used for both Institute Code (join) and New Institute Code (create)
    })

    // --- Helpers ---
    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        setError(null)
    }

    // --- Logic ---

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            })
            if (error) throw error

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Auth failed')

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'admin') router.push('/dashboard/admin')
            else if (profile?.role === 'student') router.push('/dashboard/student')
            else router.push('/') // Fallback

        } catch (err: any) {
            setError(err.message || 'Login failed')
            setLoading(false)
        }
    }

    const handleRegisterAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Check if Code Exists
            const { data: existing } = await supabase
                .from('institutes')
                .select('id')
                .eq('code', formData.code)
                .single()

            if (existing) throw new Error('Institute Code already taken. Please choose another.')

            // 2. SignUp
            const { data: auth, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.name, role: 'admin' } }
            })
            if (authError) throw authError
            if (!auth.user) throw new Error('Signup failed')

            // 3. Create Institute
            const { data: institute, error: instError } = await supabase
                .from('institutes')
                .insert({
                    name: formData.name, // Using Name field as Institute Name here
                    code: formData.code,
                    admin_email: formData.email // Admin email
                })
                .select()
                .single()

            if (instError) throw instError

            // 4. Create Profile
            const { error: profError } = await supabase
                .from('profiles')
                .insert({
                    id: auth.user.id,
                    full_name: formData.name, // Using Name as Admin Name/Institute Name rep
                    role: 'admin',
                    institute_id: institute.id
                })

            if (profError) throw profError

            router.push('/dashboard/admin')
        } catch (err: any) {
            setError(err.message || 'Registration failed')
            setLoading(false)
        }
    }

    const handleRegisterStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Validate Code
            const { data: institute } = await supabase
                .from('institutes')
                .select('id')
                .eq('code', formData.code)
                .single()

            if (!institute) throw new Error('Invalid Institute Code')

            // 2. SignUp
            const { data: auth, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.name, role: 'student' } }
            })
            if (authError) throw authError
            if (!auth.user) throw new Error('Signup failed')

            // 3. Create Profile
            const { error: profError } = await supabase
                .from('profiles')
                .insert({
                    id: auth.user.id,
                    full_name: formData.name,
                    role: 'student',
                    institute_id: institute.id
                })

            if (profError) throw profError

            router.push('/dashboard/student')
        } catch (err: any) {
            setError(err.message || 'Registration failed')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Back to Main Menu Button */}
                    <button
                        onClick={() => router.push('/?menu=open')}
                        className="mb-4 text-white/50 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto"
                    >
                        <LucideArrowLeft size={16} />
                        Back to Main Menu
                    </button>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200 tracking-tighter cursor-pointer" onClick={() => setView('login')}>
                        SpaceScope
                    </h1>
                    <p className="text-white/50 text-sm mt-2 font-light">
                        {view === 'login' && 'Authentication Portal'}
                        {view === 'register-admin' && 'Register New Institute'}
                        {view === 'register-student' && 'Cadet Registration'}
                    </p>
                </div>

                {/* Main Card */}
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                >
                    {/* Back Button for Register Views */}
                    {view !== 'login' && (
                        <button
                            onClick={() => setView('login')}
                            className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors"
                        >
                            <LucideArrowLeft size={20} />
                        </button>
                    )}

                    <AnimatePresence mode="wait">

                        {/* --- VIEW 1: LOGIN --- */}
                        {view === 'login' && (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleLogin}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Email</label>
                                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="user@example.com" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Password</label>
                                    <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" value={formData.password} onChange={e => updateForm('password', e.target.value)} />
                                </div>

                                {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/20">{error}</div>}

                                <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-all flex justify-center">{loading ? <LucideLoader2 className="animate-spin" /> : 'Sign In'}</button>

                                <div className="pt-6 border-t border-white/10 space-y-3">
                                    <button type="button" onClick={() => setView('register-admin')} className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 hover:border-purple-500/50 transition-all group">
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-white group-hover:text-purple-300">New Institute?</p>
                                            <p className="text-xs text-white/40">Register your organization</p>
                                        </div>
                                        <LucideShield className="text-white/20 group-hover:text-purple-400" />
                                    </button>
                                    <button type="button" onClick={() => setView('register-student')} className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 hover:border-blue-500/50 transition-all group">
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-white group-hover:text-blue-300">Student?</p>
                                            <p className="text-xs text-white/40">Join an existing institute</p>
                                        </div>
                                        <LucideGraduationCap className="text-white/20 group-hover:text-blue-400" />
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {/* --- VIEW 2: REGISTER ADMIN --- */}
                        {view === 'register-admin' && (
                            <motion.form
                                key="reg-admin"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRegisterAdmin}
                                className="space-y-4 pt-2"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Institute Name</label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Galactic Academy" value={formData.name} onChange={e => updateForm('name', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Create Institute Code</label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono tracking-widest" placeholder="NASA-1" value={formData.code} onChange={e => updateForm('code', e.target.value.toUpperCase())} />
                                    <p className="text-[10px] text-white/40">This code will be used by students to join.</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Admin Email</label>
                                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="admin@institute.edu" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Password</label>
                                    <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="••••••••" value={formData.password} onChange={e => updateForm('password', e.target.value)} />
                                </div>

                                {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/20">{error}</div>}

                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-900/20 transition-all flex justify-center gap-2">
                                    {loading ? <LucideLoader2 className="animate-spin" /> : <>Register Institute <LucideRocket size={18} /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* --- VIEW 3: REGISTER STUDENT --- */}
                        {view === 'register-student' && (
                            <motion.form
                                key="reg-student"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRegisterStudent}
                                className="space-y-4 pt-2"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Full Name</label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" value={formData.name} onChange={e => updateForm('name', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Institute Code</label>
                                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono tracking-widest" placeholder="NASA-1" value={formData.code} onChange={e => updateForm('code', e.target.value.toUpperCase())} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Email</label>
                                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="student@example.com" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Password</label>
                                    <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" value={formData.password} onChange={e => updateForm('password', e.target.value)} />
                                </div>

                                {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/20">{error}</div>}

                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex justify-center gap-2">
                                    {loading ? <LucideLoader2 className="animate-spin" /> : <>Join Academy <LucideGraduationCap size={18} /></>}
                                </button>
                            </motion.form>
                        )}

                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    )
}
