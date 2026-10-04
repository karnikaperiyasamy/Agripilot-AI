import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Mic, MicOff, Volume2, VolumeX, Send, X, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      return;
    }

    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setMicError(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setMicError(t.voice.micPermissionDenied);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.error('Speech recognition init failure', e);
      }
    } else {
      setMicError(t.voice.speechNotSupported);
    }
  }, [isOpen, language]);

  const startListening = () => {
    setResponse(null);
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition already active');
      }
    } else {
      setMicError(t.voice.speechNotSupported);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      stopSpeaking();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (queryText?: string) => {
    const q = queryText || transcript;
    if (!q.trim()) return;

    setLoading(true);
    stopListening();
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, language })
      });
      const data = await res.json();
      setResponse(data.reply);
      speakText(data.reply);
    } catch (e) {
      setResponse(
        language === 'ta'
          ? 'அக்ரிட்வின் AI இயந்திரத்துடன் இணைக்க முடியவில்லை. இணைய நிலையை சரிபார்க்கவும்.'
          : language === 'hi'
            ? 'एग्रीट्विन एआई इंजन से संपर्क नहीं हो पाया। कृपया नेटवर्क जांचें।'
            : 'Unable to connect to AgriTwin AI engine. Please verify network status.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <h2 className="font-bold text-lg">{t.voice.title}</h2>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Microphone Interactive Pulse Button */}
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white ring-8 ring-red-100 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105'
              }`}
              title={isListening ? t.voice.stopSpeaking : t.voice.speakNow}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <p className="text-sm font-semibold text-slate-700">
              {isListening ? t.voice.listening : t.voice.speakNow}
            </p>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              {t.voice.langLabel}: {t.voice.langDisplay}
            </span>
          </div>

          {/* Microphone Permission Warning / Feedback */}
          {micError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{micError}</span>
            </div>
          )}

          {/* Transcript Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-slate-500 mb-1">{t.voice.yourQuery}</div>
            <p className="text-sm text-slate-800 italic min-h-[2.5rem]">
              {transcript || t.voice.defaultQueryPrompt}
            </p>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-500">{t.voice.askPrompt}</div>
            <div className="flex flex-wrap gap-2">
              {[t.voice.sample1, t.voice.sample2, t.voice.sample3].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const clean = sample.replace(/"/g, '');
                    setTranscript(clean);
                    handleSubmit(clean);
                  }}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition-colors text-left"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Display */}
          {(response || loading) && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.voice.aiResponseTitle}</span>
                </span>
                {response && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(response)}
                    className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-medium"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? t.voice.stopSpeaking : t.voice.speakAnswer}</span>
                  </button>
                )}
              </div>
              {loading ? (
                <div className="flex items-center space-x-2 text-xs text-slate-500 py-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></div>
                  <span>{t.voice.synthesizing}</span>
                </div>
              ) : (
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {response}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer with Manual Input */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={t.voice.typeFallback}
              className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !transcript.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center space-x-1 transition-colors"
            >
              <span>{t.voice.send}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
