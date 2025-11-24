import React, { useEffect, useState, useRef } from 'react';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { toast } from 'sonner';
import { Mic, MicOff, Activity } from 'lucide-react';

const JarvisWidget = () => {
    const [isActive, setIsActive] = useState(false);
    const [response, setResponse] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // --- VOICE LOGIC ---
    const { startListening, stopListening, isListening, transcript } = useVoiceRecognition({
        continuous: true,
        onResult: (text) => processCommand(text),
    });

    const processCommand = (cmd: string) => {
        const command = cmd.toLowerCase();
        let reply = "";

        if (command.includes("doanh thu")) {
            reply = "Doanh thu đang tăng trưởng tốt, thưa sếp. Đạt mức 120% so với hôm qua.";
        } else if (command.includes("báo cáo") || command.includes("tình hình")) {
            reply = "Hệ thống ổn định. Tất cả cảm biến IoT đang hoạt động bình thường.";
        } else if (command.includes("mở cổng") || command.includes("barrier")) {
            reply = "Đã kích hoạt mở cổng khẩn cấp. Cảnh báo an ninh đã được ghi lại.";
        } else if (command.includes("khóa") || command.includes("đóng")) {
            reply = "Kích hoạt chế độ phong tỏa. Không xe nào được phép ra vào.";
        } else if (command.includes("xin chào") || command.includes("hello")) {
            reply = "Chào ngài. Tôi là Jarvis, hệ thống quản lý bãi đỗ xe thông minh.";
        }

        if (reply) {
            setResponse(reply);
            speak(reply);
        }
    };

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.1;
        utterance.pitch = 0.9;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setResponse("");
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const toggleJarvis = () => {
        if (isActive) {
            stopListening();
            setIsActive(false);
            speak("Hệ thống nghỉ.");
        } else {
            startListening();
            setIsActive(true);
            speak("Jarvis đã sẵn sàng phục vụ.");
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
            {/* HOLOGRAPHIC MESSAGE BUBBLE */}
            {(transcript || response) && (
                <div className="mb-4 mr-2 max-w-xs bg-slate-900/90 text-cyan-400 p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <p className="font-mono text-xs opacity-70 mb-1 uppercase tracking-widest">
                        {response ? "J.A.R.V.I.S REPLY:" : "LISTENING..."}
                    </p>
                    <p className="text-sm font-bold typing-effect">
                        {response || transcript}
                    </p>
                </div>
            )}

            {/* ARC REACTOR CORE */}
            <div 
                onClick={() => { 
                    // Hack để enable click trong thẻ cha pointer-events-none
                    document.body.style.pointerEvents = 'auto'; 
                    toggleJarvis();
                }}
                className={`pointer-events-auto relative group cursor-pointer transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}`}
            >
                {/* Outer Rings (Spinning) */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 w-20 h-20 -ml-2 -mt-2 ${isActive ? 'animate-spin-slow' : ''}`}></div>
                <div className={`absolute inset-0 rounded-full border border-cyan-400/20 w-24 h-24 -ml-4 -mt-4 ${isActive ? 'animate-reverse-spin' : ''}`}></div>

                {/* Core Glow */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 backdrop-blur-sm border-2 transition-all duration-300
                    ${isActive ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.6)]' : 'bg-slate-900/80 border-slate-600 shadow-lg'}
                `}>
                    {/* Inner Icon Animation */}
                    {isSpeaking ? (
                        <Activity className="w-8 h-8 text-cyan-300 animate-bounce" />
                    ) : isActive ? (
                        <div className="relative">
                            <Mic className="w-6 h-6 text-cyan-400" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        </div>
                    ) : (
                        <MicOff className="w-6 h-6 text-slate-500" />
                    )}
                </div>

                {/* Status Label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className={`text-[10px] font-mono font-bold tracking-[0.2em] ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`}>
                        {isActive ? "SYSTEM ONLINE" : "OFFLINE"}
                    </span>
                </div>
            </div>
            
            <style>{`
                .animate-spin-slow { animation: spin 10s linear infinite; }
                .animate-reverse-spin { animation: spin 15s linear infinite reverse; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default JarvisWidget;