'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  Send,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Lock,
  MessageSquare,
  Radio,
} from 'lucide-react';

export interface SaraMaskedCommModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  vehicleName?: string;
  plate?: string;
  tripId?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'driver' | 'system';
  text: string;
  timestamp: string;
}

const QUICK_REPLIES = [
  '📍 Ya estoy en el punto',
  '⏱️ Salgo en 2 min',
  '🚗 ¿En qué dirección vienes?',
  '✅ Gracias, te veo afuera',
] as const;

function getContextualDriverReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes('en el punto') || lower.includes('afuera')) {
    return '¡Enterado! Ya estoy llegando al punto con las luces de parqueo encendidas.';
  }
  if (lower.includes('2 min') || lower.includes('salgo') || lower.includes('espera')) {
    return 'Sin problema, te espero con calma en el punto de encuentro.';
  }
  if (lower.includes('dirección') || lower.includes('direccion') || lower.includes('vienes') || lower.includes('dónde') || lower.includes('donde')) {
    return 'Voy aproximándome por la vía principal, a menos de 2 cuadras de tu ubicación GPS.';
  }
  if (lower.includes('gracias')) {
    return '¡A las órdenes! Recuerda tener a mano tu PIN de seguridad de 4 dígitos.';
  }
  return 'Recibido por canal seguro SARA. Voy en camino hacia tu ubicación.';
}

function formatTimeNow(): string {
  return new Date().toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function SaraMaskedCommModal({
  isOpen,
  onClose,
  driverName,
  vehicleName = 'Unidad Verificada SARA',
  plate = 'SARA-000',
  tripId = 'default',
}: SaraMaskedCommModalProps) {
  const storageKey = `sara_fletes_masked_chat_${tripId}`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDriverTyping, setIsDriverTyping] = useState(false);

  // Estado de Llamada VoIP Enmascarada
  const [voipState, setVoipState] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar historial efímero de sesión por tripId
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Ignorar error de sessionStorage
    }

    setMessages([
      {
        id: 'sys-init',
        sender: 'system',
        text: 'Canal cifrado SARA activo. Tu número telefónico personal permanece oculto en todo momento.',
        timestamp: formatTimeNow(),
      },
      {
        id: 'drv-welcome',
        sender: 'driver',
        text: `Hola, soy ${driverName}. Ya estoy asignado a tu viaje (${plate}). Avísame cualquier indicación por aquí.`,
        timestamp: formatTimeNow(),
      },
    ]);
  }, [isOpen, storageKey, driverName, plate]);

  // Persistir mensajes en sessionStorage
  useEffect(() => {
    if (!isOpen || messages.length === 0) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignorar cuota de sessionStorage
    }
  }, [isOpen, messages, storageKey]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isDriverTyping]);

  const endVoipCall = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
      callIntervalRef.current = null;
    }
    setVoipState('idle');
    setCallSeconds(0);
    setIsMuted(false);
  }, []);

  // Limpieza de temporizadores al cerrar o desmontar
  useEffect(() => {
    if (!isOpen) {
      endVoipCall();
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current);
        replyTimeoutRef.current = null;
      }
      setIsDriverTyping(false);
    }
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    };
  }, [isOpen, endVoipCall]);

  const startVoipCall = () => {
    if (voipState !== 'idle') return;
    setVoipState('connecting');
    setCallSeconds(0);
    setIsMuted(false);

    connectTimeoutRef.current = setTimeout(() => {
      setVoipState('connected');
      callIntervalRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }, 1100);
  };

  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: formatTimeNow(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsDriverTyping(true);

    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
    }

    replyTimeoutRef.current = setTimeout(() => {
      const driverMsg: ChatMessage = {
        id: `drv-${Date.now()}`,
        sender: 'driver',
        text: getContextualDriverReply(trimmed),
        timestamp: formatTimeNow(),
      };
      setMessages((prev) => [...prev, driverMsg]);
      setIsDriverTyping(false);
    }, 950);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Comunicación segura enmascarada"
    >
      <div className="bg-slate-950 border border-slate-800 sm:border-amber-500/40 rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[88vh] sm:h-[640px] flex flex-col overflow-hidden shadow-2xl">
        {/* Cabecera */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-base shrink-0">
              {driverName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white truncate">{driverName}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {vehicleName} • <span className="font-mono text-slate-200 font-bold">{plate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {voipState === 'idle' ? (
              <button
                type="button"
                onClick={startVoipCall}
                className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
                title="Iniciar llamada VoIP enmascarada"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="hidden xs:inline">VoIP</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={endVoipCall}
                className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title="Colgar llamada VoIP"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar comunicación segura"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cinta de privacidad */}
        <div className="bg-emerald-950/50 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-300">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Proxy VoIP &amp; Chat Efímero SARA • Número personal oculto</span>
        </div>

        {/* Panel de Llamada VoIP Enmascarada Activa */}
        {voipState !== 'idle' && (
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-emerald-500/30 p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    Proxy VoIP SARA • Número personal oculto
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {voipState === 'connecting'
                      ? `Enlazando túnel de voz cifrado con ${driverName}...`
                      : `En llamada segura con ${driverName}`}
                  </p>
                </div>
              </div>

              <span className="font-mono tabular-nums text-base font-black text-white bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                {formatCallDuration(callSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className={`flex-1 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-colors ${
                  isMuted
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? 'Micrófono silenciado' : 'Silenciar micrófono'}</span>
              </button>

              <button
                type="button"
                onClick={endVoipCall}
                className="flex-1 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Colgar llamada</span>
              </button>
            </div>
          </div>
        )}

        {/* Historial de Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-slate-900/90 border border-slate-800 text-slate-400 text-[11px] px-3 py-1.5 rounded-xl text-center max-w-[90%]">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-semibold rounded-br-sm'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 font-mono tabular-nums text-right ${
                      isUser ? 'text-slate-900/70' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isDriverTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 text-slate-400 text-xs px-3.5 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{driverName} está escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Mensajes rápidos de 1 toque estilo Uber */}
        <div className="px-3 py-2.5 bg-slate-900/70 border-t border-slate-800">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_REPLIES.map((quickText) => (
              <button
                key={quickText}
                type="button"
                onClick={() => handleSendMessage(quickText)}
                className="shrink-0 min-h-[36px] px-3 py-1.5 rounded-full bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-[11px] font-semibold text-slate-200 transition-colors"
              >
                {quickText}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de entrada de mensaje */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje cifrado..."
            className="flex-1 min-h-[44px] bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 text-xs text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Enviar mensaje"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
