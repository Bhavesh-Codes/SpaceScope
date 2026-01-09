'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface KineticHeaderProps {
    text: string;
    subtext?: string;
    align?: 'left' | 'center' | 'right';
    color?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function KineticHeader({ text, subtext, align = 'center', color = 'text-white', size = 'lg' }: KineticHeaderProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { y: 100, opacity: 0, rotateX: 45 },
        show: {
            y: 0,
            opacity: 1,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    };

    const alignClass = align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';

    const textSize = size === 'lg' ? 'text-6xl md:text-8xl lg:text-9xl' : size === 'md' ? 'text-4xl md:text-6xl lg:text-7xl' : 'text-3xl md:text-5xl lg:text-6xl';
    const padding = size === 'lg' ? 'py-12 md:py-24' : 'py-8 md:py-16';

    return (
        <div className={`flex flex-col ${alignClass} ${padding} overflow-hidden`}>
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-wrap gap-x-4 max-w-5xl justify-center"
            >
                {text.split(' ').map((word, i) => (
                    <motion.h2
                        key={i}
                        variants={item}
                        className={`${textSize} font-bold font-orbitron uppercase tracking-tighter ${color} drop-shadow-2xl`}
                    >
                        {word}
                    </motion.h2>
                ))}
            </motion.div>

            {subtext && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="text-xl md:text-3xl text-slate-400 font-inter font-light tracking-[0.5em] mt-6 uppercase border-l-4 border-cyan-500 pl-4"
                >
                    {subtext}
                </motion.p>
            )}
        </div>
    );
}
