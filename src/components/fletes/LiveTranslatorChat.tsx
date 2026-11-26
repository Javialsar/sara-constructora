'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Globe2, Loader2, Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ChatMessageItem {
  id: string;
  sender_role: 'customer' | 'driver';
  original_text: string;
  source_lang: string;
  translated_text: string;
  target_lang: string;
  created_at: string;
}

interface LiveTranslatorChatProps {
  orderId?: string | null;
  role: 'customer' | 'driver';
  peerLanguage?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'es-EC', label: 'Español (EC)' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
];

export function LiveTranslatorChat({ orderId, role, peerLanguage }: LiveTranslatorChatProps) {
  const [myLang, setMyLang] = useState<string>(role === 'driver' ? 'es-EC' : 'en');
  const [targetLang, setTargetLang] = useState<string>(
    peerLanguage || (role === 'driver' ? 'en' : 'es-EC')
  );
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(role === 'driver');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  // Detectar idioma nativo del cliente automáticamente desde navigator.language
  useEffect(() => {
    if (role === 'customer' && typeof navigator !== 'undefined' && navigator.language) {
      const base = navigator.language.split('-')[0].toLowerCase();
      if (base === 'es') {
        setMyLang('es-EC');
        setTargetLang(peerLanguage || 'en');
      } else if (['en', 'fr', 'pt', 'de'].includes(base)) {
        setMyLang(base);
        setTargetLang('es-EC');
      }
    }
  }, [role, peerLanguage]);

  const speakText = (text: string, langCode: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode;
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {
      // Navegador sin síntesis de voz
    }
  };

  // Suscripción Supabase Realtime a fletes_chat_messages
  useEffect(() => {
    if (!orderId) return;
    const supabase = createClient();

    supabase
      .from('fletes_chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessageItem[]);
      });

    const channel = supabase
      .channel(`chat:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fletes_chat_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const next = payload.new as ChatMessageItem;
          setMessages((prev) => (prev.some((m) => m.id === next.id) ? prev : [...prev, next]));
          if (next.sender_role !== role && autoSpeak) {
            speakText(next.translated_text, myLang);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, role, autoSpeak, myLang]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean) return;
    setErrorMsg(null);
    setSending(true);
    try {
      const res = await fetch('/api/fletes/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || undefined,
          text: clean,
          sourceLang: myLang,
          targetLang,
          senderRole: role,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || 'Error traduciendo mensaje.');
        return;
      }

      if (!orderId) {
        const localMsg: ChatMessageItem = {
          id: `live-${Date.now()}`,
          sender_role: role,
          original_text: clean,
          source_lang: data.sourceLang || myLang,
          translated_text: data.translatedText,
          target_lang: data.targetLang || targetLang,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, localMsg]);
        if (autoSpeak) {
          speakText(data.translatedText, targetLang);
        }
      }
      setInputText('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error de red en traductor.');
    } finally {
      setSending(false);
    }
  };

  const handleWalkieTalkie = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setErrorMsg('Tu navegador no soporta Web Speech API para dictado por voz.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = myLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setErrorMsg(null);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setErrorMsg('No se detectó voz clara. Intenta de nuevo.');
    };
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript) {
        sendMessage(transcript);
      }
    };
    recognition.start();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-sky-400" />
          <span className="font-display text-sm font-bold text-white">
            Intérprete Simultáneo en Cabina
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={myLang}
            onChange={(e) => setMyLang(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-slate-200"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                Yo: {l.label}
              </option>
            ))}
          </select>
          <span className="text-slate-500">➔</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-slate-200"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                Destino: {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setAutoSpeak((v) => !v)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
              autoSpeak
                ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
                : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 inline mr-1" />
            Voz
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2.5 max-h-60 overflow-y-auto bg-slate-950/40">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Escribe o presiona <strong>🎙️ Hablar / Speak</strong> para traducir al instante entre cliente y conductor.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_role === role;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                  isMine
                    ? 'ml-auto bg-amber-500/20 border border-amber-500/30 text-white'
                    : 'mr-auto bg-slate-800 border border-slate-700 text-slate-100'
                }`}
              >
                <div className="font-semibold text-sm">
                  {isMine ? m.original_text : m.translated_text}
                </div>
                <div className="mt-1 pt-1 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                  <span>{isMine ? `➔ ${m.translated_text}` : `Original (${m.source_lang}): ${m.original_text}`}</span>
                  <button
                    type="button"
                    onClick={() => speakText(m.translated_text, m.target_lang)}
                    className="text-sky-400 hover:text-sky-300 shrink-0 cursor-pointer"
                    title="Reproducir en voz alta"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>

      {errorMsg && (
        <div className="px-4 py-2 bg-rose-950/60 text-rose-200 text-xs border-t border-rose-500/30">
          {errorMsg}
        </div>
      )}

      <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex items-center gap-2">
        <button
          type="button"
          onClick={handleWalkieTalkie}
          disabled={sending}
          className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            listening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
          }`}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {listening ? 'Escuchando...' : '🎙️ Hablar / Speak'}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage(inputText);
          }}
          placeholder="Escribe tu mensaje..."
          className="flex-1 min-h-[44px] rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
        />

        <button
          type="button"
          disabled={sending || !inputText.trim()}
          onClick={() => sendMessage(inputText)}
          className="min-w-[44px] min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 flex items-center justify-center cursor-pointer"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
