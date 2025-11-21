import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

export interface VoiceRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

// Định nghĩa lại Window để TS không báo lỗi linh tinh
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    isSupported: true,
    error: null,
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = options.lang || 'vi-VN';
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      
      setState(prev => ({ ...prev, transcript: currentTranscript }));
      
      if (finalTranscript && options.onResult) {
        options.onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      const errorMessage = getErrorMessage(event.error);
      setState(prev => ({ ...prev, isListening: false, error: errorMessage }));
      if (options.onError) options.onError(errorMessage);
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array để đảm bảo init 1 lần duy nhất (Singleton pattern cho hook)

  const startListening = useCallback(() => {
    if (!state.isSupported) {
      toast.error("Trình duyệt của bạn quá cũ, hãy nâng cấp để dùng tính năng này!");
      return;
    }
    if (recognitionRef.current && !state.isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Microphone busy", e);
      }
    }
  }, [state.isSupported, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    hasBrowserSupport: state.isSupported
  };
};

// Helper function để map lỗi chuẩn quốc tế
const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'no-speech': return 'Không nghe thấy giọng nói.';
    case 'audio-capture': return 'Không tìm thấy Microphone.';
    case 'not-allowed': return 'Bạn đã chặn quyền truy cập Microphone.';
    default: return 'Có lỗi xảy ra, vui lòng thử lại.';
  }
};