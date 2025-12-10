import React, { useState, useEffect, useRef } from 'react';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { Mic, MicOff, Activity, BrainCircuit, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const JarvisWidget = () => {
    const [isActive, setIsActive] = useState(false);
    const [response, setResponse] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
    
    // --- INIT VOICE ENGINE ---
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Ưu tiên giọng Google Tiếng Việt hoặc giọng Microsoft Vietnamese
            const viVoice = voices.find(v => v.lang.includes('vi') && v.name.includes('Google')) 
                         || voices.find(v => v.lang.includes('vi'));
            
            if (viVoice) {
                setVoice(viVoice);
                console.log("✅ Jarvis Voice Loaded:", viVoice.name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // --- MOCK DATA ACCESS ---
    const getSystemData = () => {
        return {
            revenue: "3 triệu 720 nghìn đồng",
            occupancy: "16.8 phần trăm",
            bookings: 54,
            status: "Hoạt động bình thường"
        };
    };

    // --- ADVANCED NLP ENGINE ---
    const processCommand = (cmd: string) => {
        const command = cmd.toLowerCase();
        setProcessing(true);
        
        setTimeout(() => {
            let reply = "";
            const data = getSystemData();

            if (command.includes("doanh thu") || command.includes("tiền")) {
                reply = `Báo cáo sếp. Tổng doanh thu hiện tại là ${data.revenue}.`;
            } 
            else if (command.includes("tình hình") || command.includes("báo cáo")) {
                reply = `Hệ thống ${data.status}. Tỉ lệ lấp đầy là ${data.occupancy}. Camera an ninh đang trực tuyến.`;
            } 
            else if (command.includes("mở cổng") || command.includes("barrier")) {
                reply = "Xác nhận quyền Admin. Đang mở Barrier cổng A và B.";
            } 
            else if (command.includes("khóa") || command.includes("đóng")) {
                reply = "Kích hoạt giao thức an ninh. Toàn bộ cổng đã bị khóa.";
            } 
            else if (command.includes("xin chào") || command.includes("hello")) {
                reply = "Chào sếp. Tôi là Jarvis, hệ thống quản lý bãi đỗ xe thông minh. Sếp cần giúp gì?";
            }
            else {
                reply = "Tôi chưa hiểu lệnh này. Sếp hãy thử lại.";
            }

            if (reply) {
                setResponse(reply);
                speak(reply);
            }
            setProcessing(false);
        }, 800);
    };

    const { startListening, stopListening, transcript, resetTranscript } = useVoiceRecognition({
        continuous: true,
        onResult: (text) => {
            if (isActive && text.length > 2) {
                processCommand(text);
            }
        },
    });

    const speak = (text: string) => {
        // Hủy các câu đang nói dở
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        utterance.lang = 'vi-VN'; 
        utterance.rate = 1.1;     
        utterance.pitch = 1.0;    
        utterance.volume = 1.0;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setTimeout(() => setResponse(""), 5000); 
            resetTranscript();
        };
        utterance.onerror = (e) => console.error("Speech Error:", e);
        
        window.speechSynthesis.speak(utterance);
    };

    const toggleJarvis = () => {
        if (isActive) {
            stopListening();
            setIsActive(false);
            speak("Hệ thống nghỉ.");
        } else {
            // Kích hoạt AudioContext bằng user interaction đầu tiên
            window.speechSynthesis.resume();
            startListening();
            setIsActive(true);
            speak("Jarvis đã sẵn sàng.");
            toast.success("Voice Command Activated");
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
            {/* HOLOGRAPHIC MESSAGE BUBBLE */}
            {(transcript || response || processing) && (
                <div className="mb-6 mr-4 max-w-xs bg-slate-950/90 text-cyan-400 p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="flex justify-between items-center mb-2 border-b border-cyan-500/20 pb-1">
                        <p className="font-mono text-[10px] opacity-70 uppercase tracking-widest text-cyan-200 flex items-center gap-2">
                            {processing ? <><Activity className="w-3 h-3 animate-spin"/> PROCESSING</> : 
                             response ? <><Volume2 className="w-3 h-3 animate-pulse"/> JARVIS SPEAKING</> : 
                             <><Mic className="w-3 h-3 animate-pulse"/> LISTENING</>}
                        </p>
                    </div>
                    <p className="text-sm font-bold font-mono leading-relaxed text-shadow-glow typing-effect">
                        {response || transcript}
                    </p>
                </div>
            )}

            {/* ARC REACTOR CORE */}
            <div 
                onClick={() => { 
                    document.body.style.pointerEvents = 'auto'; 
                    toggleJarvis();
                }}
                className={`pointer-events-auto relative group cursor-pointer transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}`}
            >
                {/* Outer Rings (Spinning) */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 w-20 h-20 -ml-2 -mt-2 ${isActive ? 'animate-spin-slow opacity-100' : 'opacity-20'}`}></div>
                <div className={`absolute inset-0 rounded-full border border-cyan-400/20 w-24 h-24 -ml-4 -mt-4 ${isActive ? 'animate-reverse-spin opacity-100' : 'opacity-0'}`}></div>

                {/* Core Glow */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 backdrop-blur-sm border-2 transition-all duration-300
                    ${isActive 
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.8)] ring-4 ring-cyan-500/20' 
                        : 'bg-slate-900/90 border-slate-600 shadow-lg grayscale'}
                `}>
                    {isSpeaking ? (
                        <div className="flex gap-1 h-4 items-center">
                            <div className="w-1 bg-cyan-400 animate-sound-wave-1"></div>
                            <div className="w-1 bg-cyan-400 animate-sound-wave-2"></div>
                            <div className="w-1 bg-cyan-400 animate-sound-wave-3"></div>
                        </div>
                    ) : (
                        <BrainCircuit className={`w-8 h-8 ${isActive ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
                    )}
                </div>

                {/* Status Label */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 px-3 py-1 rounded border border-slate-800/50 backdrop-blur">
                    <span className={`text-[10px] font-mono font-bold tracking-[0.2em] ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
                        {isActive ? "AI ONLINE" : "OFFLINE"}
                    </span>
                </div>
            </div>
            
            <style>{`
                .animate-spin-slow { animation: spin 10s linear infinite; }
                .animate-reverse-spin { animation: spin 15s linear infinite reverse; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .text-shadow-glow { text-shadow: 0 0 10px rgba(34,211,238,0.5); }
                
                @keyframes sound-wave { 0%, 100% { height: 4px; } 50% { height: 16px; } }
                .animate-sound-wave-1 { animation: sound-wave 0.5s infinite ease-in-out; }
                .animate-sound-wave-2 { animation: sound-wave 0.5s infinite ease-in-out 0.1s; }
                .animate-sound-wave-3 { animation: sound-wave 0.5s infinite ease-in-out 0.2s; }
            `}</style>
        </div>
    );
};

export default JarvisWidget;