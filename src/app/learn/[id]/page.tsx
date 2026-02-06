
'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LucideArrowLeft, LucideBookOpen } from 'lucide-react'
import { LEARNING_MODULES } from '@/data/learning-modules'

export default function LearningModePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    // Find module locally
    const learningModule = LEARNING_MODULES.find(m => m.id === id)

    if (!learningModule) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-xl font-bold mb-4">Module not identified.</p>
                    <button
                        onClick={() => router.push('/dashboard/student')}
                        className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500"
                    >
                        Return to Base
                    </button>
                </div>
            </div>
        )
    }

    // Helper to get image path or default
    const getModuleImage = () => learningModule.imagePath ? `${learningModule.imagePath}/1.jpg` : '/images/nebula.jpg'

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md">
                <button
                    onClick={() => router.push('/dashboard/student')}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white flex items-center gap-2"
                >
                    <LucideArrowLeft size={20} />
                    <span className="hidden md:inline text-sm">Dashboard</span>
                </button>
                <div className="flex items-center gap-2 text-sm font-mono text-blue-400">
                    <LucideBookOpen size={16} />
                    <span>ACADEMY ARCHIVE: {learningModule.title.toUpperCase()}</span>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[21/9] group">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                            style={{ backgroundImage: `url(${getModuleImage()})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-8 md:p-12">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                                {learningModule.title}
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 max-w-2xl font-light leading-relaxed">
                                {learningModule.description}
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div>
                        <h2 className="text-xl font-mono text-blue-400 mb-4 flex items-center gap-2">
                            <LucideBookOpen size={20} />
                            TRANSMISSION DATA
                        </h2>
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8">
                            <div className="prose prose-invert prose-lg max-w-none text-white/80 leading-loose whitespace-pre-wrap">
                                {learningModule.content}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => router.push('/dashboard/student')}
                            className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-mono text-blue-300"
                        >
                            {/* END TRANSMISSION */}
                            END TRANSMISSION
                        </button>
                    </div>

                </motion.div>
            </main>
        </div>
    )
}

