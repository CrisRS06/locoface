# ReHug - Architecture & Lessons Learned

> Documento técnico detallado de la arquitectura, decisiones de diseño, errores corregidos y mejores prácticas aprendidas durante el desarrollo de ReHug.

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Flujos de Usuario](#flujos-de-usuario)
5. [Base de Datos](#base-de-datos)
6. [Sistema de Pagos](#sistema-de-pagos)
7. [Sistema de Recovery](#sistema-de-recovery)
8. [Seguridad](#seguridad)
9. [Lecciones Aprendidas](#lecciones-aprendidas)
10. [Troubleshooting](#troubleshooting)

---

## Visión General

**ReHug** es una plataforma de tecnología emocional que usa IA para crear fotos realistas de abrazos fusionando dos imágenes separadas. Permite a usuarios reconectarse con seres queridos separados por distancia, tiempo o pérdida.

### URLs de Producción
- **Principal:** https://www.rehug.app
- **Alias Vercel:** https://again-hug.vercel.app

### Modelo de Negocio
- **Precio:** $1.99 USD por foto HD
- **Margen:** ~$1.26 por foto (después de fees de Lemon Squeezy + Gemini API)
- **Sin cuentas:** Flujo completamente anónimo

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool + dev server |
| TailwindCSS | 4.0 | Styling |
| Framer Motion | 12.x | Animaciones |
| Lucide React | - | Iconografía |

### Backend
| Tecnología | Propósito |
|------------|-----------|
| Vercel Edge Functions | API serverless |
| Supabase | PostgreSQL + Realtime + RLS |
| Google Gemini 3 Pro | Generación de imágenes AI |
| Lemon Squeezy | Procesador de pagos (MoR) |
| Sharp | Procesamiento de imágenes (watermark) |

### Testing
| Herramienta | Propósito |
|-------------|-----------|
| Vitest | Test runner |
| React Testing Library | Component testing |
| jsdom | DOM simulation |

---

## Arquitectura del Sistema

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    React     │  │  Supabase    │  │ LemonSqueezy │  │  localStorage│ │
│  │     App      │  │   Realtime   │  │     SDK      │  │   Recovery   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE FUNCTIONS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  /api/       │  │  /api/       │  │  /api/       │  │  /api/       │ │
│  │  generate-   │  │  orders/     │  │  webhooks/   │  │  preview/    │ │
│  │  preview     │  │  create      │  │  lemonsqueezy│  │  [id]        │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            SERVICIOS EXTERNOS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Google     │  │   Supabase   │  │ LemonSqueezy │                   │
│  │  Gemini 3    │  │  PostgreSQL  │  │   Payments   │                   │
│  │    Pro       │  │  + Realtime  │  │              │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Estructura de Archivos

```
Again/
├── api/                              # Vercel Edge Functions
│   ├── generate-preview.ts           # Generación de preview con watermark
│   ├── preview/
│   │   └── [id].ts                   # Status de preview (para recovery)
│   ├── orders/
│   │   ├── create.ts                 # Crear orden + checkout URL
│   │   └── [id].ts                   # Status de orden (polling)
│   ├── download/
│   │   └── [token].ts                # Descarga HD (24h expiry)
│   ├── webhooks/
│   │   └── lemonsqueezy.ts           # Webhook de pagos
│   ├── email/
│   │   └── send-hd.ts                # Email con imagen HD
│   ├── cron/
│   │   └── recover-stuck.ts          # Recovery de órdenes atascadas
│   └── health.ts                     # Health check
│
├── components/                        # React components
│   ├── Hero.tsx                       # Landing page hero
│   ├── UploadSection.tsx              # Upload de 2 fotos
│   ├── LoadingState.tsx               # Progreso de generación
│   ├── ResultView.tsx                 # Preview con watermark
│   ├── PaymentModal.tsx               # Modal de pago ($1.99)
│   ├── DeliveryView.tsx               # Entrega de foto HD
│   ├── LandingVariant.tsx             # Variantes de landing (/therapy, etc)
│   ├── SEOHead.tsx                    # Meta tags dinámicos
│   └── ScreenReaderAnnouncer.tsx      # Accesibilidad
│
├── contexts/
│   └── LanguageContext.tsx            # i18n (EN/ES)
│
├── hooks/
│   └── useFocusTrap.ts                # Trap focus en modales
│
├── lib/
│   └── supabase.ts                    # Cliente Supabase
│
├── utils/
│   └── imageProcessing.ts             # Watermark utilities
│
├── types/
│   ├── index.ts                       # App types
│   └── lemonsqueezy.d.ts              # SDK types
│
├── supabase/
│   └── migrations/                    # SQL migrations
│       ├── 20251129150000_token_system.sql
│       ├── 20251204000000_simplified_orders.sql
│       ├── 20251204060000_generation_recovery.sql
│       └── 20251204070000_fix_nullable_columns.sql
│
├── tests/                             # Test suites
│   ├── components/                    # Component tests
│   ├── unit/                          # Unit tests
│   ├── integration/                   # Integration tests
│   └── accessibility/                 # A11y tests
│
├── public/                            # Static assets
│   ├── logo.webp
│   ├── og-image.jpg
│   └── samples/                       # Landing images
│
├── App.tsx                            # Main app component
├── CLAUDE.md                          # AI assistant instructions
├── ARCHITECTURE.md                    # This file
└── vercel.json                        # Vercel config + crons
```

---

## Flujos de Usuario

### Flujo Principal: Generación + Compra

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 1: UPLOAD                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ Usuario sube 2 fotos → Validación client-side (tamaño, formato)         │
│ Click "Create" → handleGenerate() en App.tsx                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 2: GENERACIÓN (con Recovery)                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Cliente genera UUID: crypto.randomUUID()                              │
│ 2. Guarda en localStorage: { previewId, timestamp }                      │
│ 3. Activa Wake Lock API (pantalla no se apaga)                          │
│ 4. POST /api/generate-preview con generationId                          │
│    ├── Server crea record con status='generating'                       │
│    ├── Llama a Gemini 3 Pro (~30-60s)                                   │
│    ├── Aplica watermark server-side con Sharp                           │
│    └── Actualiza status='ready' con imagen                              │
│ 5. Respuesta: { previewId, previewUrl, status: 'ready' }                │
│ 6. Limpia localStorage, libera Wake Lock                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 3: PREVIEW (ResultView)                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ Muestra imagen 2K con watermark central                                  │
│ Botón "Get HD - $1.99" → openPaymentModal()                             │
│ Opción compartir preview (con watermark)                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 4: PAGO (Lemon Squeezy Overlay)                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. POST /api/orders/create { previewId }                                │
│    ├── Crea orden en DB (status='pending')                              │
│    ├── Llama Lemon Squeezy API para crear checkout                      │
│    └── Retorna { orderId, checkoutUrl }                                 │
│ 2. Frontend abre overlay: LemonSqueezy.Url.Open(checkoutUrl)            │
│ 3. Usuario paga (Apple Pay / Google Pay / Card)                         │
│ 4. Overlay cierra, frontend inicia polling + Realtime subscription      │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 5: WEBHOOK + FULFILLMENT                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ Lemon Squeezy → POST /api/webhooks/lemonsqueezy                         │
│ 1. Verifica firma HMAC-SHA256                                           │
│ 2. Extrae orderId de custom_data                                        │
│ 3. Transición atómica: pending → paid                                   │
│ 4. Copia preview_base64 → hd_base64                                     │
│ 5. Genera download_token (24h expiry)                                   │
│ 6. Transición atómica: paid → completed                                 │
│ 7. Supabase Realtime notifica al frontend                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 6: ENTREGA (DeliveryView)                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ Frontend recibe update via Realtime o polling                           │
│ Muestra DeliveryView con botón de descarga                              │
│ GET /api/download/{token} → Imagen HD sin watermark                     │
│ Token válido por 24 horas                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flujo de Recovery (Usuario Sale Durante Generación)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ESCENARIO: Usuario inicia generación, sale del navegador, regresa       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ ANTES (sin recovery):                                                    │
│ - Fetch se cancela cuando navegador suspende JS                         │
│ - Usuario pierde la generación completamente                            │
│ - Mala experiencia de usuario en móviles                                │
│                                                                          │
│ AHORA (con recovery):                                                    │
│                                                                          │
│ 1. Al montar App.tsx:                                                   │
│    - Lee localStorage[PENDING_GENERATION_KEY]                           │
│    - Si existe y tiene < 10 min de antigüedad:                          │
│      GET /api/preview/{previewId}                                       │
│                                                                          │
│ 2. Según status:                                                        │
│    - 'ready' → Mostrar ResultView con la imagen                         │
│    - 'generating' → Mostrar LoadingState + polling                      │
│    - 'failed' → Mostrar error, limpiar localStorage                     │
│    - 404 → Limpiar localStorage (expiró o no existía)                   │
│                                                                          │
│ 3. Polling cada 2s hasta completar o timeout (2 min)                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

DIAGRAMA:

Usuario inicia       Usuario sale       Usuario regresa
generación           del navegador      al navegador
    │                     │                   │
    ▼                     ▼                   ▼
┌─────────┐         ┌─────────┐         ┌─────────┐
│localStorage│       │ Server  │         │ App     │
│previewId  │       │ sigue   │         │ mounts  │
│guardado   │       │generando│         │         │
└─────────┘         └─────────┘         └────┬────┘
                                             │
                    ┌────────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │ Lee localStorage│
            │ previewId      │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │GET /api/preview│
            │    /{id}      │
            └───────┬───────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
  status='ready'          status='generating'
        │                       │
        ▼                       ▼
  ┌──────────┐            ┌──────────┐
  │ Mostrar  │            │ Mostrar  │
  │ResultView│            │ Loading  │
  │          │            │ + Poll   │
  └──────────┘            └──────────┘
```

---

## Base de Datos

### Schema Principal

#### Tabla: `preview_images`

```sql
CREATE TABLE public.preview_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidad (ahora opcional para flujo anónimo)
    fingerprint TEXT,                    -- Device fingerprint (nullable)
    user_id UUID,                        -- User ID si está logueado

    -- Imagen
    preview_base64 TEXT,                 -- HD image (nullable durante generating)
    watermarked_base64 TEXT,             -- Cached watermarked version

    -- Metadata
    config JSONB,                        -- { sceneId, relationship, etc }
    client_ip TEXT,                      -- Para rate limiting

    -- Estado
    status TEXT DEFAULT 'pending'
        CHECK (status IN (
            'generating',  -- En proceso de generación
            'ready',       -- Generación completada
            'pending',     -- Mostrado al usuario (legacy)
            'upgraded',    -- Pagado
            'expired',     -- Expirado sin pagar
            'failed'       -- Generación falló
        )),
    error_message TEXT,                  -- Mensaje si falló

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Indexes para queries comunes
CREATE INDEX idx_preview_status ON preview_images(status);
CREATE INDEX idx_preview_client_ip ON preview_images(client_ip, created_at);
```

#### Tabla: `orders`

```sql
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Estado
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',     -- Esperando pago
            'paid',        -- Pago recibido
            'generating',  -- Preparando HD
            'completed',   -- Listo para descarga
            'failed'       -- Error
        )),

    -- Relaciones
    preview_id UUID REFERENCES preview_images(id),

    -- Lemon Squeezy
    lemonsqueezy_order_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL DEFAULT 199,

    -- Entrega HD
    hd_base64 TEXT,                      -- Imagen HD sin watermark
    download_token TEXT UNIQUE,           -- Token de descarga
    download_expires_at TIMESTAMPTZ,      -- Expiración (24h)
    download_count INTEGER DEFAULT 0,     -- Contador de descargas

    -- Recovery
    webhook_received_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,

    -- Contacto opcional
    email TEXT,
    language TEXT DEFAULT 'en',

    -- Idempotency
    idempotency_key TEXT UNIQUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_download_token ON orders(download_token);
CREATE INDEX idx_orders_lemonsqueezy ON orders(lemonsqueezy_order_id);

-- Realtime habilitado para updates instantáneos
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### Row Level Security (RLS)

```sql
-- preview_images: Solo service role puede modificar
ALTER TABLE public.preview_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages previews"
ON public.preview_images FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- orders: Service role + lectura anónima con token
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages orders"
ON public.orders FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anyone can read order by download_token"
ON public.orders FOR SELECT
USING (download_token IS NOT NULL);
```

### Funciones RPC

```sql
-- Transición atómica de estado (previene race conditions)
CREATE OR REPLACE FUNCTION transition_order_state(
    p_order_id UUID,
    p_from_status TEXT,
    p_to_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.orders
    SET status = p_to_status, updated_at = NOW()
    WHERE id = p_order_id AND status = p_from_status;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Completar orden con HD
CREATE OR REPLACE FUNCTION complete_order(
    p_order_id UUID,
    p_hd_base64 TEXT,
    p_download_token TEXT,
    p_download_expires_at TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.orders
    SET
        status = 'completed',
        hd_base64 = p_hd_base64,
        download_token = p_download_token,
        download_expires_at = p_download_expires_at,
        updated_at = NOW()
    WHERE id = p_order_id AND status IN ('paid', 'generating');
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Sistema de Pagos

### Lemon Squeezy como Merchant of Record

**¿Por qué Lemon Squeezy?**
1. **MoR (Merchant of Record):** Ellos manejan VAT/GST en 135+ países
2. **Overlay Checkout:** Usuario nunca sale de rehug.app
3. **Apple Pay / Google Pay:** Integrado automáticamente
4. **PCI Compliance:** Manejado por ellos
5. **Simple Setup:** Sin KYC complejo como Stripe

**Fee Structure:**
- 5% + $0.50 por transacción
- En $1.99: ~$0.60 fee (~30%)
- Margen: $1.99 - $0.60 - $0.13 (Gemini) = $1.26

### Integración del SDK

```html
<!-- index.html -->
<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
```

```typescript
// PaymentModal.tsx
useEffect(() => {
  if (typeof window !== 'undefined' && window.createLemonSqueezy) {
    window.createLemonSqueezy();
  }
}, []);

const handlePayment = async () => {
  // Crear checkout
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({ previewId })
  });
  const { checkoutUrl, orderId } = await response.json();

  // Abrir overlay
  window.LemonSqueezy.Url.Open(checkoutUrl);

  // Iniciar tracking
  onSuccess(orderId);
};
```

### Webhook Handler

```typescript
// api/webhooks/lemonsqueezy.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Verificar firma HMAC-SHA256
  const signature = req.headers['x-signature'] as string;
  const payload = JSON.stringify(req.body);
  const expectedSig = crypto
    .createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  if (!crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  )) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Responder inmediatamente (webhook tiene timeout corto)
  res.status(200).json({ received: true });

  // 3. Procesar en background con waitUntil
  waitUntil((async () => {
    const { meta, data } = req.body;
    const orderId = meta.custom_data?.order_id;

    // Transición: pending → paid
    await supabase.rpc('transition_order_state', {
      p_order_id: orderId,
      p_from_status: 'pending',
      p_to_status: 'paid'
    });

    // Obtener imagen HD del preview
    const { data: order } = await supabase
      .from('orders')
      .select('preview_id')
      .eq('id', orderId)
      .single();

    const { data: preview } = await supabase
      .from('preview_images')
      .select('preview_base64')
      .eq('id', order.preview_id)
      .single();

    // Completar orden con token de descarga
    const downloadToken = crypto.randomUUID();
    await supabase.rpc('complete_order', {
      p_order_id: orderId,
      p_hd_base64: preview.preview_base64,
      p_download_token: downloadToken,
      p_download_expires_at: new Date(Date.now() + 24*60*60*1000)
    });
  })());
}
```

---

## Sistema de Recovery

### Wake Lock API

Mantiene la pantalla activa durante la generación para evitar que el OS suspenda el proceso.

```typescript
// App.tsx
const wakeLockRef = useRef<WakeLockSentinel | null>(null);

useEffect(() => {
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('[WakeLock] Screen wake lock acquired');
      } catch (err) {
        console.log('[WakeLock] Failed to acquire:', err);
      }
    }
  };

  if (state === AppState.PROCESSING) {
    requestWakeLock();
  } else if (wakeLockRef.current) {
    wakeLockRef.current.release();
    wakeLockRef.current = null;
  }
}, [state]);
```

**Soporte de navegadores:**
- Chrome/Edge: ✅
- Safari iOS 16.4+: ✅
- Firefox: ❌ (graceful degradation)

### localStorage Recovery

```typescript
// Constantes
const PENDING_GENERATION_KEY = 'rehug_pending_generation';
const RECOVERY_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutos

// Al iniciar generación
const generationId = crypto.randomUUID();
localStorage.setItem(PENDING_GENERATION_KEY, JSON.stringify({
  previewId: generationId,
  timestamp: Date.now()
}));

// Al montar la app
useEffect(() => {
  const checkPendingGeneration = async () => {
    const pending = localStorage.getItem(PENDING_GENERATION_KEY);
    if (!pending) return;

    const { previewId, timestamp } = JSON.parse(pending);

    // Validar antigüedad
    if (Date.now() - timestamp > RECOVERY_MAX_AGE_MS) {
      localStorage.removeItem(PENDING_GENERATION_KEY);
      return;
    }

    // Verificar status en servidor
    const response = await fetch(`/api/preview/${previewId}`);
    const data = await response.json();

    switch (data.status) {
      case 'ready':
        setPreviewUrl(data.previewUrl);
        setState(AppState.RESULT);
        localStorage.removeItem(PENDING_GENERATION_KEY);
        break;
      case 'generating':
        setState(AppState.PROCESSING);
        pollForCompletion(previewId);
        break;
      case 'failed':
        setError('Generation failed');
        localStorage.removeItem(PENDING_GENERATION_KEY);
        break;
    }
  };

  checkPendingGeneration();
}, []);
```

---

## Seguridad

### 1. Watermark Server-Side

**Problema resuelto:** Usuarios podían hacer long-press en móvil para guardar imagen sin watermark.

**Solución:** El watermark se aplica en el servidor con Sharp antes de enviar al cliente.

```typescript
// api/generate-preview.ts
async function applyServerWatermark(base64Image: string): Promise<string> {
  const imageBuffer = Buffer.from(base64Data, 'base64');

  const watermarkSvg = `
    <svg width="${width}" height="${height}">
      <!-- Central badge -->
      <rect ... fill="rgba(0,0,0,0.75)"/>
      <text>ReHug.app</text>
      <!-- Diagonal watermarks anti-crop -->
      <text transform="rotate(-35)">ReHug.app</text>
      ...
    </svg>
  `;

  const watermarkedBuffer = await sharp(imageBuffer)
    .composite([{
      input: Buffer.from(watermarkSvg),
      blend: 'over'
    }])
    .jpeg({ quality: 85 })
    .toBuffer();

  return `data:image/jpeg;base64,${watermarkedBuffer.toString('base64')}`;
}
```

### 2. Rate Limiting

```typescript
// Por IP en generate-preview
const RATE_LIMITS = {
  maxPerMinute: 3,
  maxPerHour: 10
};

async function checkRateLimit(ip: string) {
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count } = await supabase
    .from('preview_images')
    .select('*', { count: 'exact', head: true })
    .eq('client_ip', ip)
    .gte('created_at', oneMinuteAgo);

  return count < RATE_LIMITS.maxPerMinute;
}
```

### 3. Webhook Verification

```typescript
// Timing-safe HMAC comparison
const signature = req.headers['x-signature'] as string;
const expectedSig = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSig)
);
```

### 4. Origin Validation (CSRF)

```typescript
const ALLOWED_ORIGINS = [
  'https://www.rehug.app',
  'https://rehug.app',
  'https://again-hug.vercel.app'
];

function validateOrigin(req: VercelRequest): boolean {
  const origin = req.headers['origin'] || req.headers['referer'];
  return ALLOWED_ORIGINS.some(allowed => origin?.startsWith(allowed));
}
```

### 5. UUID Validation

```typescript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (!UUID_REGEX.test(previewId)) {
  return res.status(400).json({ error: 'Invalid preview ID' });
}
```

---

## Lecciones Aprendidas

### Error #1: Watermark Bypass via Long-Press

**Problema:** En móviles, usuarios podían hacer long-press en la imagen para guardarla sin watermark.

**Causa raíz:** El watermark se aplicaba solo en CSS/canvas del cliente.

**Solución:** Mover el watermark al servidor con Sharp.

**5 Whys:**
1. ¿Por qué podían guardar sin watermark? → Long-press accede a la imagen original
2. ¿Por qué la imagen original no tenía watermark? → Se aplicaba en el cliente
3. ¿Por qué en el cliente? → Era más rápido de implementar
4. ¿Por qué no funciona? → El navegador tiene acceso a la imagen base
5. **Raíz:** El watermark debe ser parte de la imagen, no un overlay

**Mejor práctica:** Cualquier protección visual debe aplicarse server-side antes de enviar al cliente.

---

### Error #2: Generación Perdida al Cambiar de App

**Problema:** Si el usuario cambiaba a otra app durante la generación (~60s), perdía todo.

**Causa raíz:** El navegador suspende JavaScript cuando la app está en background.

**Solución:** Sistema de recovery con localStorage + Wake Lock API.

**5 Whys:**
1. ¿Por qué se pierde la generación? → El fetch se cancela
2. ¿Por qué se cancela? → El OS suspende el proceso del navegador
3. ¿Por qué no hay recovery? → No había tracking del estado
4. ¿Por qué no había tracking? → El ID se generaba en el servidor
5. **Raíz:** Necesitamos tracking client-side + server-side status endpoint

**Mejor práctica:** Para operaciones largas, implementar:
1. ID generado en cliente (crypto.randomUUID())
2. Guardado en localStorage antes del request
3. Endpoint de status para verificar progreso
4. Wake Lock para prevenir suspensión
5. Recovery al montar la app

---

### Error #3: "Failed to initialize generation"

**Problema:** Después de implementar recovery, todas las generaciones fallaban.

**Causa raíz:** Columnas NOT NULL en la base de datos.

**5 Whys:**
1. ¿Por qué falla el INSERT? → Supabase rechaza valores NULL
2. ¿Qué columnas? → `preview_base64` y `fingerprint` son NOT NULL
3. ¿Por qué enviamos NULL? → El nuevo flujo crea record ANTES de generar
4. ¿Por qué no se actualizó el schema? → La migración no incluyó ALTER COLUMN
5. **Raíz:** Inconsistencia entre código nuevo y schema existente

**Solución:**
```sql
ALTER TABLE preview_images ALTER COLUMN preview_base64 DROP NOT NULL;
ALTER TABLE preview_images ALTER COLUMN fingerprint DROP NOT NULL;
```

**Mejor práctica:** Al cambiar el flujo de datos, SIEMPRE verificar:
1. Constraints de la base de datos (NOT NULL, CHECK, UNIQUE)
2. Valores por defecto
3. Orden de operaciones (INSERT vs UPDATE)

---

### Error #4: Supabase PromiseLike vs Promise

**Problema:** TypeScript error: "Property 'catch' does not exist on type 'PromiseLike'"

**Causa raíz:** PostgrestFilterBuilder de Supabase retorna PromiseLike, no Promise completo.

**Código problemático:**
```typescript
supabase.from('preview_images').update({...}).eq('id', id)
  .then(() => console.log('Done'))
  .catch(() => {});  // ERROR: .catch no existe
```

**Solución:**
```typescript
(async () => {
  try {
    await supabase.from('preview_images').update({...}).eq('id', id);
    console.log('Done');
  } catch { /* ignore */ }
})();
```

**Mejor práctica:** Con Supabase, usar async/await en lugar de .then()/.catch().

---

### Error #5: Webhook Timeout

**Problema:** Webhooks de Lemon Squeezy tienen timeout de 5s, pero el fulfillment tarda más.

**Causa raíz:** Procesábamos todo sincrónicamente antes de responder.

**Solución:** Usar `waitUntil` de Vercel:
```typescript
// Responder inmediatamente
res.status(200).json({ received: true });

// Procesar en background
waitUntil((async () => {
  // ... todo el fulfillment
})());
```

**Mejor práctica:** Webhooks deben responder < 5s. Usar background processing para trabajo pesado.

---

## Troubleshooting

### Problema: "Failed to initialize generation"

**Diagnóstico:**
```bash
# Ver logs de Vercel
vercel logs https://www.rehug.app

# Verificar migraciones aplicadas
supabase migration list
```

**Causas comunes:**
1. Migración no aplicada → `supabase db push`
2. Columna NOT NULL → Crear migración con ALTER COLUMN DROP NOT NULL
3. Constraint CHECK inválido → Verificar valores permitidos

---

### Problema: Webhook no llega

**Diagnóstico:**
1. Verificar URL en Lemon Squeezy Dashboard
2. Verificar que el evento `order_created` está habilitado
3. Revisar logs de Vercel para errores 401/500

**Causas comunes:**
1. WEBHOOK_SECRET incorrecto → Verificar en Vercel env vars
2. Signature mismatch → Verificar que el body no se modifica
3. Timeout → Usar waitUntil para responder rápido

---

### Problema: Realtime no actualiza

**Diagnóstico:**
```sql
-- Verificar que la tabla está en la publicación
SELECT * FROM pg_publication_tables WHERE tablename = 'orders';
```

**Causas comunes:**
1. Tabla no está en publicación → `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`
2. RLS bloqueando → Verificar policies
3. Client desconectado → Verificar subscription status

---

### Problema: Descarga falla (403/404)

**Diagnóstico:**
1. Verificar que download_token existe
2. Verificar que no expiró (24h)
3. Verificar que hd_base64 no es NULL

**Causas comunes:**
1. Token expirado → Usuario debe pagar de nuevo
2. HD no se copió → Bug en webhook handler
3. RLS bloqueando → Verificar policy de SELECT

---

## Variables de Entorno Requeridas

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google AI
GEMINI_API_KEY=AI...

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=eyJ...
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=secret...
LEMONSQUEEZY_VARIANT_SINGLE=123456

# Vercel
CRON_SECRET=random-secret-for-cron-auth
```

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar dev server
npm run build            # Build de producción
npm run test:run         # Correr tests

# Base de datos
supabase db push         # Aplicar migraciones
supabase migration list  # Ver estado de migraciones
supabase db diff         # Ver diferencias (requiere Docker)

# Deployment
vercel --prod            # Deploy a producción
vercel logs              # Ver logs en tiempo real

# Debug
vercel env pull          # Bajar env vars localmente
```

---

## Contacto y Recursos

- **Repositorio:** https://github.com/CrisRS06/Again
- **Producción:** https://www.rehug.app
- **Supabase Dashboard:** https://supabase.com/dashboard/project/emypozjbqdceuwftytvu
- **Lemon Squeezy Dashboard:** https://app.lemonsqueezy.com
