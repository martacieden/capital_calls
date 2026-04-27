import { useState, useEffect } from 'react'
import { TYPING_WORDS } from '@/lib/constants'
import fojoMascotSmall from '@/assets/fojo-mascot-small.svg'

export function FojoTypingIndicator() {
    const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * TYPING_WORDS.length))
    useEffect(() => {
        const interval = setInterval(() => {
            setWordIdx(i => (i + 1) % TYPING_WORDS.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])
    return (
        <div className="flex items-center gap-[7px] py-0.5">
            <img src={fojoMascotSmall} className="w-5 h-5 rounded-full shrink-0 opacity-90" alt="" />
            <span key={wordIdx} className="text-[13px] font-medium text-[var(--color-purple-text)] animate-[fojo-word-in_0.35s_ease-out_both]">{TYPING_WORDS[wordIdx]}</span>
            <span className="flex items-center gap-[3px] mt-px">
                <span className="fojo-typing-dot" />
                <span className="fojo-typing-dot" />
                <span className="fojo-typing-dot" />
            </span>
        </div>
    )
}
