// ============================================================================
// MOTOR DE NAVEGACIÓN POR VOZ EN ESPAÑOL (SARA-FLETES TURN-BY-TURN AUDIO)
// Utiliza Web Speech API (window.speechSynthesis) con selección prioritaria
// de voz en español latinoamericano (es-EC / es-419 / es-MX / es-ES).
// ============================================================================

export type TipoManiobraVial =
  | 'depart'
  | 'straight'
  | 'turn-left'
  | 'turn-right'
  | 'slight-left'
  | 'slight-right'
  | 'uturn'
  | 'roundabout'
  | 'arrive';

export interface PasoNavegacionVial {
  indice: number;
  instruccion: string;
  calle: string;
  distanciaMetros: number;
  duracionSegundos: number;
  maniobra: TipoManiobraVial;
  coords: [number, number]; // [lat, lng]
}

class SaraVoiceNavigationEngine {
  private muted = false;
  private lastSpokenText = '';
  private lastSpokenAt = 0;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted && this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  private pickSpanishVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const priorities = ['es-EC', 'es-419', 'es-MX', 'es-CO', 'es-US', 'es-ES', 'es'];
    for (const lang of priorities) {
      const found = voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      if (found) return found;
    }
    return null;
  }

  speak(texto: string, options?: { force?: boolean; rate?: number }) {
    if (this.muted || !this.isSupported() || !texto.trim()) return;

    const now = Date.now();
    // Evitar repetir exactamente la misma frase en menos de 4 segundos salvo que force=true
    if (!options?.force && texto === this.lastSpokenText && now - this.lastSpokenAt < 4000) {
      return;
    }

    this.lastSpokenText = texto;
    this.lastSpokenAt = now;

    try {
      if (options?.force) {
        window.speechSynthesis.cancel();
      }
      const utter = new SpeechSynthesisUtterance(texto);
      const voice = this.pickSpanishVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = 'es-EC';
      }
      utter.rate = options?.rate ?? 1.02;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {
      // Silencioso en navegadores que bloquean autoplay sin gesto previo
    }
  }

  anunciarInicioViaje(destino: string, primeraInstruccion?: string) {
    const destLimpio = destino.split(',')[0].trim();
    const intro = primeraInstruccion
      ? `Viaje iniciado hacia ${destLimpio}. ${primeraInstruccion}.`
      : `Viaje iniciado hacia ${destLimpio}. Sigue la ruta marcada en pantalla.`;
    this.speak(intro, { force: true });
  }

  anunciarPaso(paso: PasoNavegacionVial) {
    if (paso.maniobra === 'arrive') {
      this.anunciarLlegadaFeliz();
      return;
    }
    const dist = paso.distanciaMetros >= 30
      ? `En ${Math.round(paso.distanciaMetros / 10) * 10} metros, `
      : '';
    this.speak(`${dist}${paso.instruccion}.`);
  }

  anunciarLlegadaFeliz() {
    this.speak('Hemos llegado con felicidad, que tenga un excelente día.', { force: true, rate: 0.96 });
  }

  stop() {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const saraVoiceNavigation = new SaraVoiceNavigationEngine();

/**
 * Traduce un paso OSRM (maneuver + name) a una instrucción natural en español
 */
export function traducirPasoOsrm(step: any, index: number): PasoNavegacionVial {
  const mType: string = step?.maneuver?.type || 'continue';
  const mod: string = step?.maneuver?.modifier || '';
  const rawName: string = (step?.name || '').trim();
  const calle = rawName || 'la vía actual';
  const distM = Math.round(Number(step?.distance || 0));
  const durS = Math.round(Number(step?.duration || 0));
  const loc = step?.maneuver?.location;
  const coords: [number, number] = Array.isArray(loc) && loc.length === 2 ? [loc[1], loc[0]] : [-4.328103, -79.561129];

  let maniobra: TipoManiobraVial = 'straight';
  let instruccion = `Continúa por ${calle}`;

  if (mType === 'arrive') {
    maniobra = 'arrive';
    instruccion = 'Has llegado a tu destino';
  } else if (mType === 'depart') {
    maniobra = 'depart';
    instruccion = rawName ? `Sal por ${rawName}` : 'Inicia el recorrido siguiendo la ruta';
  } else if (mType === 'roundabout' || mType === 'rotary') {
    maniobra = 'roundabout';
    const exitNum = step?.maneuver?.exit;
    instruccion = exitNum
      ? `En el redondel, toma la salida ${exitNum} hacia ${calle}`
      : `Toma el redondel hacia ${calle}`;
  } else if (mod.includes('uturn')) {
    maniobra = 'uturn';
    instruccion = `Haz giro en U hacia ${calle}`;
  } else if (mod === 'left' || mod === 'sharp left') {
    maniobra = 'turn-left';
    instruccion = rawName ? `Gira a la izquierda en ${rawName}` : 'Gira a la izquierda';
  } else if (mod === 'right' || mod === 'sharp right') {
    maniobra = 'turn-right';
    instruccion = rawName ? `Gira a la derecha en ${rawName}` : 'Gira a la derecha';
  } else if (mod === 'slight left') {
    maniobra = 'slight-left';
    instruccion = rawName ? `Mantente a la izquierda hacia ${rawName}` : 'Mantente ligeramente a la izquierda';
  } else if (mod === 'slight right') {
    maniobra = 'slight-right';
    instruccion = rawName ? `Mantente a la derecha hacia ${rawName}` : 'Mantente ligeramente a la derecha';
  } else {
    maniobra = 'straight';
    instruccion = rawName ? `Continúa recto por ${rawName}` : 'Continúa recto';
  }

  return {
    indice: index,
    instruccion,
    calle,
    distanciaMetros: distM,
    duracionSegundos: durS,
    maniobra,
    coords
  };
}
