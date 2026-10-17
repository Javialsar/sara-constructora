---
name: sara-field-inspection-geolog
description: >-
  Bitácora electrónica diaria de obra (Libro de Obra) con geolocalización satelital GPS inviolable,
  estampilla de tiempo UTC, registro climático INAMHI y evidencia fotográfica con marca de agua para PWA Offline-First.
---

# sara-field-inspection-geolog

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-field-inspection-geolog`
- **Unidad de Negocio:** SARA Fiscaliza & Supervisión Técnica de Obra
- **Objetivo Estratégico:**
  Gobernar la captura, registro y certificación probatoria de las bitácoras diarias de campo (*Libro de Obra*) en la aplicación web progresiva (PWA) de fiscalizadores y residentes técnicos. Opera con arquitectura *Offline-First* garantizando el registro sin señal celular en zonas rurales o subsuelos, captura coordenadas geodésicas satelitales obligatorias, sella condiciones meteorológicas oficiales para justificación de plazos y estampa marcas de agua criptográficas en las fotografías de avance para impedir fraudes o adulteración de fechas.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP) - Arts. 119 al 125 del RGLOSNCP:**
   - Obligatoriedad del Libro de Obra como instrumento legal público suscrito entre Contratista y Fiscalizador.
   - Anotación diaria de personal, maquinaria en funcionamiento vs paralizada, rubros ejecutados y eventos extraordinarios.
   - Justificación de prórrogas de plazo por lluvias o causas de fuerza mayor registradas el mismo día de su ocurrencia.
2. **Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos del Ecuador:**
   - Validez legal de los registros electrónicos, marcas de tiempo (*Timestamping*) y firmas desmaterializadas.
3. **Código Orgánico General de Procesos (COGEP) - Prueba Digital:**
   - Requisitos de admisibilidad probatoria de fotografías y bitácoras georreferenciadas con cadena de custodia inalterada.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Operación en Modo Offline-First y Captura Sensorial
1. Detectar el estado de red del dispositivo móvil (Online / Offline).
2. Si el dispositivo está sin conexión:
   - Almacenar los registros de bitácora y metadatos en IndexedDB local (`sara_offline_log`).
   - Comprimir las fotografías en formato WebP con resolución balanceada ($1920 \times 1080\,\text{px}$) y calidad del 85% para optimizar almacenamiento local.
3. Exigir la activación del GPS de alta precisión (`navigator.geolocation.getCurrentPosition` con `enableHighAccuracy: true`):
   - Capturar latitud, longitud, altitud y precisión ($\pm \text{metros}$).
   - Si la precisión es $> 25\,\text{metros}$, alertar al usuario para que se mueva a un área despejada.
   - Cotejar que las coordenadas correspondan al polígono geocercado (*Geofence*) del proyecto registrado en `proyectos`.

### Paso 2: Registro Meteorológico y Control de Jornada
1. Registrar el clima diario en tres jornadas (Mañana, Tarde, Noche):
   - Seco / Despejado.
   - Nublado.
   - Lluvia Ligera (sin paralización).
   - Lluvia Torrencial / Inundación (con paralización obligatoria de actividades al aire libre).
2. En caso de paralización:
   - Registrar la hora exacta de inicio y fin del evento climático.
   - Cuantificar las horas no trabajadas y los rubros directamente afectados (ej. vaciado de hormigón, excavación).
   - Cruzar opcionalmente con la API meteorológica del INAMHI para respaldo institucional.

### Paso 3: Estampado Criptográfico de Marca de Agua en Fotografías
1. Procesar la imagen en el canvas del cliente antes de persistirla:
   - Insertar una banda inferior semitransparente (`rgba(15, 23, 42, 0.85)`).
   - Renderizar en tipografía monoespaciada de alta nitidez:
     - `PROYECTO: [Nombre del Proyecto] - COD: [Código]`
     - `RUBRO: [Código y Nombre del Rubro Fiscalizado]`
     - `GPS: Lat [xx.xxxx°], Lng [yy.yyyy°] (± [z] m)`
     - `FECHA/HORA: [YYYY-MM-DD HH:mm:ss UTC-5]`
     - `FISCALIZADOR: [Nombre y Cédula Profesional]`
2. Generar el hash SHA-256 de la imagen resultante para garantizar su inmutabilidad.

### Paso 4: Sincronización Automática con Supabase
1. Al restablecerse la conectividad a internet:
   - Enviar las imágenes al bucket protegido de Supabase Storage (`fiscaliza-evidencias`).
   - Registrar la entrada en la tabla `bitacora_obra` mediante el endpoint `/api/fiscaliza/reporte-diario`.
   - Limpiar el almacenamiento local temporal en IndexedDB tras recibir la confirmación `HTTP 201`.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Interfaz Móvil de Campo de Alto Contraste:**
   - Diseñada para legibilidad óptima bajo sol directo en obra (modo de alto contraste con texto oscuro nítido y fondos blancos puros o modo nocturno para turnos de hormigonado).
   - Tipografía `--font-display` en títulos de rubros y `--font-mono` para coordenadas y sellos de tiempo.
2. **Controles Táctiles Adaptados a Guantes:**
   - Botón gigante de "Capturar Evidencia Fotográfica" con altura mínima de `56px` (`h-14`) y feedback táctil de vibración.
   - Selector climático con iconos ilustrados grandes y áreas de toque generosas de `48x48px`.
3. **Indicador de Sincronización Flotante:**
   - Badge discreto en la esquina superior derecha:
     - Verde: Sincronizado en la Nube.
     - Ámbar parpadeante: 3 reportes pendientes de sincronizar (Offline).

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `bitacora_obra`: Registro maestro de folios de campo diarios, cuadrillas y maquinaria activa.
  - `bitacora_fotos`: Enlaces seguros a fotografías con coordenadas, rubro y hash SHA-256.
  - `proyectos`: Polígonos de geocerca del predio.
  - `src/app/dashboard/fiscaliza`: Frontend PWA de supervisión.
- **Eventos del Bus:**
  - **Consume:** `OBRA_INICIADA`.
  - **Emite:** `BITACORA_REGISTRADA`, `PARALIZACION_CLIMATICA_DETECTADA`.
- **SharedMemory Key:** `fiscaliza:project:<proyectoId>:daily_log:<fecha>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Bitácora Diaria
```json
{
  "folioId": "fol-2026-10-16-042",
  "proyectoId": "sara-proj-2026-042",
  "fecha": "2026-10-16",
  "fiscalizador": {
    "nombre": "Ing. Patricio Cárdenas",
    "cedula": "1718293041",
    "registroProfesional": "SENESCYT-1005-09-12345"
  },
  "geolocalizacion": {
    "latitud": -0.178214,
    "longitud": -78.472108,
    "altitudMetros": 2814.5,
    "precisionMetros": 4.2,
    "dentroDeGeocerca": true
  },
  "condicionesClimaticas": {
    "jornadaManana": "DESPEJADO",
    "jornadaTarde": "LLUVIA_TORRENCIAL",
    "horasParalizacion": 3.5,
    "rubrosAfectados": ["CIV-001 (Excavación de cimientos)", "EST-012 (Vaciado de losa)"]
  },
  "recursosEnObra": {
    "personalPresente": 24,
    "maquinariaActiva": ["CAT-320D", "VOLQUETA-PBA4892", "CONCRETERA-02"]
  },
  "evidenciasFotograficas": [
    {
      "fotoId": "foto-8819",
      "urlStorage": "https://sara.supabase.co/storage/v1/object/public/fiscaliza-evidencias/obra-042/2026-10-16_01.webp",
      "rubroCodigo": "EST-015",
      "hashSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "marcaAguaAplicada": true
    }
  ]
}
```

### 6.2 Folio Oficial del Libro de Obra (PDF)
- Formato normado SERCOP / Contraloría General del Estado.
- Cuadro de actividades y personal, reporte climático detallado y galería fotográfica con marcas de agua legibles.
- Firmas conjuntas del Superintendente Contratista y del Fiscalizador de Obra.
