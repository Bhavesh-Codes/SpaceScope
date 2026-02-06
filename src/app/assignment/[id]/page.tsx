'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams, useRouter } from 'next/navigation'
import CosmicQuiz from '@/components/CosmicQuiz'

// Initialize Supabase
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AssignmentPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [loading, setLoading] = useState(true)
    const [fetchedQuiz, setFetchedQuiz] = useState<any>(null)

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                // Fetch Quiz Data (Questions)
                const { data, error } = await supabase
                    .from('quizzes')
                    .select('title, questions_json, institute_id')
                    .eq('id', id)
                    .single()

                if (error) throw error
                setFetchedQuiz(data)
            } catch (err) {
                console.error('Error fetching quiz:', err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchQuiz()
    }, [id])

    // Callback when quiz is completed
    const handleSave = async (score: number, passed: boolean) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Record Attempt
            const { error } = await supabase
                .from('attempts')
                .insert({
                    student_id: user.id,
                    student_email: user.email,
                    quiz_id: id,
                    score,
                    passed,
                    created_at: new Date().toISOString()
                })

            if (error) throw error

            // Redirect back to dashboard after 2 seconds
            setTimeout(() => {
                router.push('/dashboard/student');
            }, 2000);

        } catch (err) {
            console.error('Error recording attempt:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm tracking-wider opacity-50 font-orbitron">DOWNLOADING MISSION PARAMETERS...</p>
                </div>
            </div>
        )
    }

    if (!fetchedQuiz) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <p className="text-red-400 font-orbitron">MISSION PARAMETERS NOT FOUND.</p>
            </div>
        )
    }

    return (
        <CosmicQuiz
            dbQuizData={fetchedQuiz.questions_json}
            quizTitle={fetchedQuiz.title}
            onSaveResult={handleSave}
            onBack={() => router.push('/dashboard/student')}
        />
    )
}
