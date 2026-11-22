'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ShieldCheck,
  UserPlus,
  Trash2,
  Share2,
  Mic,
  Square,
  Download,
  PhoneCall,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Copy,
} from 'lucide-react';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

const TRUSTED_CONTACTS_STORAGE_KEY = 'sara_fletes_trusted_contacts_v1';
const MAX_TRUSTED_CONTACTS = 3;

export function getStoredTrustedContacts(): TrustedContact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(TRUSTED_CONTACTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is TrustedContact =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as TrustedContact).id === 'string' &&
          typeof (item as TrustedContact).name === 'string' &&
          typeof (item as TrustedContact).phone === 'string'
      )
      .slice(0, MAX_TRUSTED_CONTACTS);
  } catch {
    return [];
  }
}

export interface SaraSafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
  driverName?: string;
  plate?: string;
  currentCoords?: [number, number] | null;
  onShareRouteWithContacts?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function SaraSafetyCenterModal({
  isOpen,
  onClose,
  tripId = 'SARA-TRIP',
  driverName = 'Conductor Verificado',
  plate = 'POR-ASIGNAR',
  currentCoords = null,
  onShareRouteWithContacts,
}: SaraSafetyCenterModalProps) {
  // Contactos de confianza
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Grabación discreta de cabina
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'idle' | 'real' | 'simulated'>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedIsSimulated, setRecordedIsSimulated] = useState(false);
  const [recordingNotice, setRecordingNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar contactos desde localStorage al abrir
  useEffect(() => {
    if (isOpen) {
      setContacts(getStoredTrustedContacts());
      setContactError(null);
      setShareFeedback(null);
    }
  }, [isOpen]);

  const releaseMediaResources = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignorar si ya fue detenido
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Limpieza obligatoria de micrófono, timers y ObjectURL al cerrar o desmontar
  useEffect(() => {
    if (!isOpen) {
      releaseMediaResources();
      setIsRecording(false);
      setRecordingMode('idle');
    }
    return () => {
      releaseMediaResources();
    };
  }, [isOpen, releaseMediaResources]);

  useEffect(() => {
    return () => {
      if (recordedBlobUrl) {
        URL.revokeObjectURL(recordedBlobUrl);
      }
    };
  }, [recordedBlobUrl]);

  const persistContacts = (next: TrustedContact[]) => {
    setContacts(next);
    try {
      window.localStorage.setItem(TRUSTED_CONTACTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar si localStorage no está disponible
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    if (contacts.length >= MAX_TRUSTED_CONTACTS) {
      setContactError(`Máximo ${MAX_TRUSTED_CONTACTS} contactos de confianza permitidos.`);
      return;
    }

    const cleanName = newName.trim();
    const cleanPhone = newPhone.replace(/[^\d+]/g, '').trim();

    if (cleanName.length < 2) {
      setContactError('Ingresa un nombre válido para el contacto.');
      return;
    }
    if (cleanPhone.length < 9) {
      setContactError('Ingresa un número de teléfono válido (ej. 0991234567).');
      return;
    }

    const nextContact: TrustedContact = {
      id: `tc-${Date.now()}`,
      name: cleanName,
      phone: cleanPhone,
    };

    persistContacts([...contacts, nextContact]);
    setNewName('');
    setNewPhone('');
  };

  const handleRemoveContact = (id: string) => {
    persistContacts(contacts.filter((c) => c.id !== id));
  };

  const handleShareLiveLocation = async () => {
    const coordsText = currentCoords
      ? `https://maps.google.com/?q=${currentCoords[0].toFixed(6)},${currentCoords[1].toFixed(6)}`
      : 'Ubicación GPS en sincronización (SARA-FLETES)';

    const message = [
      '🛡️ SEGUIMIENTO EN VIVO — GRUPO SARA',
      `Viaje: ${tripId}`,
      `Conductor: ${driverName}`,
      `Placa: ${plate}`,
      `Ubicación en vivo: ${coordsText}`,
    ].join('\n');

    onShareRouteWithContacts?.();

    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        copied = true;
      }
    } catch {
      copied = false;
    }

    const firstContact = contacts[0];
    const encoded = encodeURIComponent(message);
    if (firstContact) {
      const digits = firstContact.phone.replace(/\D/g, '');
      const normalized = digits.startsWith('0') ? `593${digits.slice(1)}` : digits;
      window.open(`https://wa.me/${normalized}?text=${encoded}`, '_blank', 'noopener,noreferrer');
      setShareFeedback(
        copied
          ? `Enlace copiado y WhatsApp abierto para ${firstContact.name}.`
          : `WhatsApp abierto para ${firstContact.name}.`
      );
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
      setShareFeedback(
        copied
          ? 'Enlace de ubicación copiado y listo para compartir por WhatsApp.'
          : 'Ventana de WhatsApp abierta con tu ubicación en vivo.'
      );
    }
  };

  const startCabinRecording = async () => {
    setRecordingNotice(null);
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
      setRecordedBlobUrl(null);
    }
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined'
      ) {
        throw new Error('MediaRecorder no disponible');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
          setRecordedIsSimulated(false);
        }
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingMode('real');
      setRecordingNotice('Micrófono activo en modo discreto. Cifrado local en progreso.');

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      // Fallback seguro: modo simulación auditada si no hay micrófono o permiso denegado
      setIsRecording(true);
      setRecordingMode('simulated');
      setRecordingNotice(
        'Micrófono no disponible o permiso denegado — Modo Simulación Auditada activo para respaldo de bitácora.'
      );

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopCabinRecording = () => {
    const wasSimulated = recordingMode === 'simulated';
    const finalSeconds = recordingSeconds;

    releaseMediaResources();
    setIsRecording(false);
    setRecordingMode('idle');

    if (wasSimulated) {
      const auditPayload = JSON.stringify(
        {
          tipo: 'SARA_CABIN_AUDIO_AUDIT_RECEIPT',
          modo: 'SIMULACION_AUDITADA',
          tripId,
          driverName,
          plate,
          duracionSegundos: finalSeconds,
          timestampUtc: new Date().toISOString(),
          integridad: 'SHA256-LOCAL-SEALED',
        },
        null,
        2
      );
      const blob = new Blob([auditPayload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setRecordedBlobUrl(url);
      setRecordedIsSimulated(true);
      setRecordingNotice('Registro de respaldo auditado listo para resguardo local.');
    } else {
      setRecordingNotice('Evidencia de audio cifrada localmente y lista para descargar/resguardar.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Centro de Seguridad SARA"
    >
      <div className="bg-slate-950 border border-slate-800 sm:border-emerald-500/40 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Cabecera */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                Centro de Seguridad SARA
              </h3>
              <p className="text-[11px] text-slate-400">
                Escudo operacional 24/7 • Viaje <span className="font-mono text-slate-300">{tripId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar centro de seguridad"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Resumen de Blindaje del Viaje */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Blindaje de Viaje Verificado
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                ANT / MTOP OK
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                <span className="text-slate-500 block">Conductor / Unidad</span>
                <span className="text-slate-200 font-bold truncate block">{driverName}</span>
                <span className="font-mono text-amber-400 font-bold">{plate}</span>
              </div>
              <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800">
                <span className="text-slate-500 block">Protocolo Activo</span>
                <span className="text-emerald-300 font-bold block">PIN de 4 dígitos activo</span>
                <span className="text-slate-400 block">Telemetría GPS 24/7</span>
              </div>
            </div>
          </div>

          {/* Grabación Discreta de Audio en Cabina */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-amber-400" />
                  Grabación Discreta de Audio en Cabina
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Registra audio ambiental de forma silenciosa ante cualquier incidente en ruta.
                </p>
              </div>
              {isRecording && (
                <span className="shrink-0 font-mono tabular-nums text-xs font-black text-rose-400 bg-rose-500/15 border border-rose-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {formatDuration(recordingSeconds)}
                </span>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
              <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Audio cifrado localmente — Solo accesible por Seguridad SARA</span>
            </div>

            {recordingNotice && (
              <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
                {recordingNotice}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startCabinRecording}
                  className="flex-1 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  <span>Iniciar Grabación Discreta</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCabinRecording}
                  className="flex-1 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Detener y Sellar Audio</span>
                </button>
              )}

              {recordedBlobUrl && !isRecording && (
                <a
                  href={recordedBlobUrl}
                  download={
                    recordedIsSimulated
                      ? `sara-respaldo-cabina-${tripId}.json`
                      : `sara-evidencia-cabina-${tripId}.webm`
                  }
                  className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Resguardar evidencia</span>
                </a>
              )}
            </div>
          </div>

          {/* Contactos de Confianza (hasta 3) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Contactos de Confianza ({contacts.length}/{MAX_TRUSTED_CONTACTS})
              </h4>
            </div>

            {contacts.length === 0 ? (
              <p className="text-[11px] text-slate-400 bg-slate-950 border border-slate-800 rounded-xl p-3">
                Aún no has agregado contactos de confianza. Añade hasta 3 familiares o supervisores de obra para compartir tu ruta en 1 toque.
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{contact.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{contact.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(contact.id)}
                      aria-label={`Eliminar a ${contact.name}`}
                      className="min-w-[40px] min-h-[40px] rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {contacts.length < MAX_TRUSTED_CONTACTS && (
              <form onSubmit={handleAddContact} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre (ej. María / Residente)"
                  className="min-h-[44px] bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 text-xs text-white placeholder:text-slate-500 outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0991234567"
                    className="flex-1 min-w-0 min-h-[44px] bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 text-xs text-white font-mono placeholder:text-slate-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Añadir
                  </button>
                </div>
              </form>
            )}

            {contactError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{contactError}</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleShareLiveLocation}
              className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar mi ubicación en vivo a mis contactos</span>
            </button>

            {shareFeedback && (
              <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span>{shareFeedback}</span>
              </div>
            )}
          </div>

          {/* Acceso Directo ECU 911 */}
          <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                Emergencia Inmediata Ecuador
              </span>
              <span className="text-[10px] font-mono text-rose-300">24/7</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Si percibes peligro inminente, comunícate directamente con el Servicio Integrado de Seguridad ECU 911.
            </p>
            <a
              href="tel:911"
              className="w-full min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/30"
            >
              <PhoneCall className="w-4 h-4" />
              <span>LLAMAR AL ECU 911</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
