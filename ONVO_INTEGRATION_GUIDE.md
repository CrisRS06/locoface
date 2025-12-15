# Guia Completa de Integracion ONVO Pay - Locoface

Esta guia documenta detalladamente como Locoface integra ONVO Pay como pasarela de pagos. Sirve como referencia para implementar ONVO Pay en otros servicios.

## Tabla de Contenidos

1. [Resumen de la Arquitectura](#resumen-de-la-arquitectura)
2. [Variables de Entorno](#variables-de-entorno)
3. [Flujo de Pago Completo](#flujo-de-pago-completo)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Implementacion Detallada](#implementacion-detallada)
6. [Webhooks](#webhooks)
7. [Manejo de Estados](#manejo-de-estados)
8. [Tarjetas de Prueba](#tarjetas-de-prueba)
9. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## Resumen de la Arquitectura

Locoface utiliza una arquitectura cliente-servidor para procesar pagos con ONVO:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │     │   ONVO API      │
│   (Next.js)     │────▶│   (API Routes)  │────▶│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ONVO SDK      │     │   Supabase      │     │   Webhook       │
│   (Cliente)     │     │   (Database)    │     │   Callback      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Archivos Clave de la Integracion

| Archivo | Proposito |
|---------|-----------|
| `src/hooks/useOnvoPay.ts` | Hook de React para cargar y usar el SDK de ONVO |
| `src/app/api/orders/create/route.ts` | Crea ordenes y PaymentIntents para stickers individuales |
| `src/app/api/orders/confirm/route.ts` | Verifica el estado del pago con ONVO API |
| `src/app/api/checkout/starter/route.ts` | Crea PaymentIntents para paquetes de stickers |
| `src/app/api/packs/confirm/route.ts` | Confirma pagos de paquetes |
| `src/app/api/webhooks/onvopay/route.ts` | Recibe notificaciones de pagos de ONVO |
| `src/components/ui/CheckoutCard.tsx` | Componente UI de checkout |

---

## Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```bash
# Onvo Pay (Payment Gateway)
NEXT_PUBLIC_ONVO_PUBLIC_KEY=onvo_live_publishable_key_your_public_key
ONVO_SECRET_KEY=onvo_live_secret_key_your_secret_key
ONVO_WEBHOOK_SECRET=your_webhook_secret_from_onvo_dashboard
ONVO_API_URL=https://api.onvopay.com/v1
```

### Descripcion de Variables

| Variable | Tipo | Uso | Referencia API Doc |
|----------|------|-----|-------------------|
| `NEXT_PUBLIC_ONVO_PUBLIC_KEY` | Publishable Key | Cliente (frontend) - Renderizar formulario de pago | [ONVOapidoc.md:62-74](ONVOapidoc.md) - Las Publishable Keys tienen prefijo `onvo_test_publishable_key_` o `onvo_live_publishable_key_` |
| `ONVO_SECRET_KEY` | Secret Key | Servidor (backend) - Crear PaymentIntents | [ONVOapidoc.md:77-91](ONVOapidoc.md) - Las Secret Keys tienen prefijo `onvo_test_secret_key_` o `onvo_live_secret_key_` |
| `ONVO_WEBHOOK_SECRET` | Webhook Secret | Verificar autenticidad de webhooks | [ONVOapidoc.md:4843](ONVOapidoc.md) - Se obtiene del Dashboard de ONVO al crear el webhook |
| `ONVO_API_URL` | Base URL | URL base del API | [ONVOapidoc.md:31-33](ONVOapidoc.md) - `https://api.onvopay.com/v1` |

### Modo Test vs Live

- **Test Mode**: Usa keys con prefijo `onvo_test_` - No interactua con redes bancarias reales
- **Live Mode**: Usa keys con prefijo `onvo_live_` - Procesa transacciones reales

> **Referencia**: [ONVOapidoc.md:36-45](ONVOapidoc.md)

---

## Flujo de Pago Completo

### Diagrama de Secuencia

```
Usuario          Frontend           Backend           ONVO API         Webhook
   │                 │                 │                 │                │
   │ Click Comprar   │                 │                 │                │
   │────────────────▶│                 │                 │                │
   │                 │ POST /orders/create               │                │
   │                 │────────────────▶│                 │                │
   │                 │                 │ POST /payment-intents            │
   │                 │                 │────────────────▶│                │
   │                 │                 │◀────────────────│                │
   │                 │                 │ {paymentIntentId}                │
   │                 │◀────────────────│                 │                │
   │                 │ Render SDK Form │                 │                │
   │                 │────────────────▶│                 │                │
   │ Ingresa Tarjeta │                 │                 │                │
   │────────────────▶│                 │                 │                │
   │                 │ SDK confirma pago con ONVO        │                │
   │                 │─────────────────────────────────▶│                │
   │                 │◀─────────────────────────────────│                │
   │                 │ onSuccess callback               │                │
   │                 │                 │                 │                │
   │                 │ POST /orders/confirm              │                │
   │                 │────────────────▶│                 │                │
   │                 │                 │ GET /payment-intents/{id}        │
   │                 │                 │────────────────▶│                │
   │                 │                 │◀────────────────│                │
   │                 │                 │ status: succeeded                │
   │                 │                 │ Update Order DB │                │
   │                 │◀────────────────│                 │                │
   │                 │                 │                 │                │
   │                 │                 │                 │ POST /webhooks │
   │                 │                 │◀────────────────────────────────│
   │                 │                 │ payment-intent.succeeded         │
   │                 │                 │ Process Order   │                │
   │◀────────────────│                 │                 │                │
   │ Descarga Disponible              │                 │                │
```

---

## Componentes del Sistema

### 1. Hook useOnvoPay (Frontend)

**Archivo**: `src/hooks/useOnvoPay.ts`

Este hook maneja la carga del SDK de ONVO y proporciona funciones para renderizar el formulario de pago.

```typescript
// Declaracion global del objeto ONVO
declare global {
  interface Window {
    onvo?: {
      pay: (config: {
        publicKey: string;
        paymentIntentId: string;
        paymentType: string;
        customerId?: string;
        onSuccess: (data: unknown) => void;
        onError: (error: unknown) => void;
        locale?: 'es' | 'en';
      }) => {
        render: (selector: string) => void;
      };
    };
  }
}
```

#### Funcionalidades Clave:

1. **Carga del SDK**: Inyecta el script `https://sdk.onvopay.com/sdk.js` en el `<head>`
2. **Estado de Carga**: Expone `isReady` e `isLoading` para UI feedback
3. **Renderizado del Formulario**: `renderPaymentForm(paymentIntentId, containerId)`

```typescript
// Uso del hook
const { isReady, isLoading, renderPaymentForm } = useOnvoPay({
  onSuccess: (data) => {
    // Pago exitoso - verificar y entregar producto
  },
  onError: (error) => {
    // Manejar error
  },
});

// Renderizar formulario cuando este listo
if (isReady && paymentIntentId) {
  renderPaymentForm(paymentIntentId, '#payment-container');
}
```

> **Referencia SDK**: [ONVOapidoc.md:374-431](ONVOapidoc.md) - Documentacion completa del SDK

#### Manejo de Estados de Respuesta

El SDK devuelve diferentes estados que deben manejarse:

| Estado | Significado | Accion |
|--------|-------------|--------|
| `succeeded` | Pago exitoso | Entregar producto |
| `requires_payment_method` | Pago declinado | Mostrar error, pedir otra tarjeta |
| `requires_action` | Requiere 3DS | SDK lo maneja automaticamente |

> **Referencia**: [ONVOapidoc.md:1673-1683](ONVOapidoc.md) - Estados de PaymentIntent

---

### 2. Crear Orden y PaymentIntent (Backend)

**Archivo**: `src/app/api/orders/create/route.ts`

Este endpoint crea una orden en la base de datos y un PaymentIntent en ONVO.

#### Flujo:

1. Recibe `previewId` del producto
2. Crea registro `pending` en tabla `orders`
3. Llama a ONVO API para crear PaymentIntent
4. Actualiza orden con `paymentIntentId`
5. Retorna `orderId` y `paymentIntentId` al frontend

```typescript
// Crear PaymentIntent en ONVO
const paymentIntentResponse = await fetch(`${ONVO_API_URL}/payment-intents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ONVO_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: STICKER_PRICE_CENTS, // Monto en centavos (199 = $1.99)
    currency: 'USD',
    description: 'Locoface Sticker',
    metadata: {
      order_id: order.id,  // Para identificar la orden en webhooks
      type: 'individual',   // Tipo de compra
    },
  }),
});
```

> **Referencia API**: [ONVOapidoc.md:1736-1844](ONVOapidoc.md) - Crear una Intencion de Pago

#### Parametros del PaymentIntent

| Parametro | Tipo | Descripcion | Referencia |
|-----------|------|-------------|------------|
| `amount` | integer | Monto en centavos (150 = $1.50) | [ONVOapidoc.md:1630-1632](ONVOapidoc.md) |
| `currency` | string | `USD` o `CRC` | [ONVOapidoc.md:1650-1653](ONVOapidoc.md) |
| `description` | string | Descripcion del cobro | [ONVOapidoc.md:1660-1662](ONVOapidoc.md) |
| `metadata` | object | Datos personalizados (max 50 pares) | [ONVOapidoc.md:1687-1689](ONVOapidoc.md) |
| `captureMethod` | string | `automatic` (default) o `manual` | [ONVOapidoc.md:1646-1649](ONVOapidoc.md) |

---

### 3. Confirmar Orden (Backend)

**Archivo**: `src/app/api/orders/confirm/route.ts`

Despues de que el usuario completa el pago en el SDK, el frontend llama a este endpoint para verificar el estado.

#### Flujo:

1. Recibe `paymentIntentId` y `previewId`
2. Busca orden en base de datos
3. Si ya esta pagada, retorna inmediatamente
4. Verifica estado con ONVO API
5. Si `succeeded`, actualiza orden y genera token de descarga

```typescript
// Verificar estado del PaymentIntent con ONVO
const verifyResponse = await fetch(
  `${ONVO_API_URL}/payment-intents/${paymentIntentId}`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${ONVO_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  }
);

const paymentIntent = await verifyResponse.json();

if (paymentIntent.status === 'succeeded') {
  // Actualizar orden como pagada
  // Generar token de descarga
  // Retornar URL de descarga
}
```

> **Referencia API**: [ONVOapidoc.md:1932-1991](ONVOapidoc.md) - Obtener una Intencion de Pago

---

### 4. Checkout de Paquetes (Starter Pack)

**Archivo**: `src/app/api/checkout/starter/route.ts`

Similar al flujo individual, pero para paquetes de multiples stickers.

```typescript
const paymentIntentResponse = await fetch(`${ONVO_API_URL}/payment-intents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ONVO_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: STARTER_PACK_PRICE_CENTS, // 999 = $9.99
    currency: 'USD',
    description: 'Locoface Starter Pack (10 stickers)',
    metadata: {
      pack_id: pack.id,
      type: 'starter_pack',
    },
  }),
});
```

---

## Webhooks

**Archivo**: `src/app/api/webhooks/onvopay/route.ts`

Los webhooks permiten recibir notificaciones asincronas de ONVO cuando ocurren eventos de pago.

### Configuracion del Webhook

1. Crear endpoint en tu servidor (POST)
2. Registrar URL en Dashboard de ONVO (seccion Desarrolladores)
3. Guardar el `Webhook Secret` generado

> **Referencia**: [ONVOapidoc.md:4832-4839](ONVOapidoc.md) - Requisitos del webhook

### Estructura del Webhook Handler

```typescript
interface OnvoWebhookPayload {
  type: string;  // Tipo de evento
  data: {
    id: string;              // PaymentIntent ID
    amount: number;          // Monto en centavos
    currency: string;        // USD o CRC
    status: string;          // Estado del pago
    metadata?: {             // Metadata enviada al crear el PaymentIntent
      order_id?: string;
      pack_id?: string;
      type?: string;
    };
    customer?: {
      id?: string;
      email?: string;
      name?: string;
    };
    createdAt: string;
  };
}

export async function POST(req: Request) {
  // 1. Validar webhook secret
  const webhookSecret = req.headers.get('x-webhook-secret');
  if (webhookSecret !== process.env.ONVO_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }

  const payload: OnvoWebhookPayload = await req.json();
  const { type, data } = payload;

  // 2. Procesar segun tipo de evento
  if (type === 'payment-intent.succeeded') {
    // Procesar pago exitoso
  }

  if (type === 'payment-intent.failed') {
    // Marcar orden como fallida
  }

  // 3. Siempre retornar 200 para confirmar recepcion
  return NextResponse.json({ received: true });
}
```

### Tipos de Eventos

| Evento | Descripcion | Referencia |
|--------|-------------|------------|
| `payment-intent.succeeded` | Pago procesado exitosamente | [ONVOapidoc.md:4812-4813](ONVOapidoc.md) |
| `payment-intent.failed` | Pago fallido | [ONVOapidoc.md:4815-4816](ONVOapidoc.md) |
| `payment-intent.deferred` | Pago en espera (SINPE) | [ONVOapidoc.md:4818-4819](ONVOapidoc.md) |
| `subscription.renewal.succeeded` | Suscripcion renovada | [ONVOapidoc.md:4821-4822](ONVOapidoc.md) |
| `subscription.renewal.failed` | Renovacion fallida | [ONVOapidoc.md:4824-4825](ONVOapidoc.md) |
| `checkout-session.succeeded` | Checkout session exitoso | [ONVOapidoc.md:4827-4828](ONVOapidoc.md) |

### Seguridad del Webhook

El header `X-Webhook-Secret` debe validarse para asegurar que la solicitud proviene de ONVO:

```typescript
const webhookSecret = req.headers.get('x-webhook-secret');
if (!webhookSecret || webhookSecret !== process.env.ONVO_WEBHOOK_SECRET) {
  return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
}
```

> **Referencia**: [ONVOapidoc.md:4841-4843](ONVOapidoc.md) - Seguridad de Webhooks

### Idempotencia

Es importante manejar la idempotencia para evitar procesar el mismo pago multiples veces:

```typescript
// Verificar si ya fue procesado
const { data: existingOrder } = await supabaseAdmin
  .from('orders')
  .select('status')
  .eq('id', orderId)
  .single();

if (existingOrder?.status === 'paid') {
  return NextResponse.json({ received: true, message: 'Already processed' });
}
```

---

## Manejo de Estados

### Estados del PaymentIntent

| Estado | Descripcion | Accion Recomendada |
|--------|-------------|-------------------|
| `requires_confirmation` | Recien creado, esperando confirmacion | Mostrar formulario de pago |
| `requires_payment_method` | Pago declinado | Pedir otra tarjeta/metodo |
| `requires_action` | Requiere autenticacion 3DS | SDK lo maneja automaticamente |
| `succeeded` | Pago exitoso | Entregar producto |
| `refunded` | Reembolsado | N/A |
| `canceled` | Cancelado | N/A |

> **Referencia**: [ONVOapidoc.md:1673-1683](ONVOapidoc.md)

### Flujo de Estados Tipico

```
requires_confirmation ──▶ [SDK Confirm] ──▶ requires_action ──▶ [3DS] ──▶ succeeded
                                │                                           │
                                └──────────▶ requires_payment_method ◀──────┘
                                                    (declinado)
```

---

## Tarjetas de Prueba

Usa estas tarjetas en modo test (`onvo_test_` keys):

### Tarjetas Exitosas

| Marca | Numero | Descripcion |
|-------|--------|-------------|
| Visa | `4242424242424242` | Aprobada |
| Visa | `4000000000003220` | Requiere 3DS |
| Mastercard | `5555555555554444` | Aprobada |
| AMEX | `378282246310005` | Aprobada |

### Tarjetas de Error

| Marca | Numero | Descripcion |
|-------|--------|-------------|
| Visa | `4000000000000002` | Declinada |
| Visa | `4000000000000127` | Verificacion invalida |
| Visa | `4000000000000119` | Error en procesador |

> **Nota**: Usar cualquier fecha futura (ej: 12/26) y cualquier CVV de 3 digitos (4 para AMEX)

> **Referencia**: [ONVOapidoc.md:542-579](ONVOapidoc.md) - Metodos de pago de prueba

---

## Consideraciones de Seguridad

### 1. Proteccion de API Keys

```typescript
// CORRECTO: Secret Key solo en servidor
// src/app/api/orders/create/route.ts
const ONVO_SECRET_KEY = process.env.ONVO_SECRET_KEY;

// CORRECTO: Public Key puede estar en cliente
// src/hooks/useOnvoPay.ts
const publicKey = process.env.NEXT_PUBLIC_ONVO_PUBLIC_KEY;
```

> **Advertencia**: [ONVOapidoc.md:79-81](ONVOapidoc.md) - "Tus Secret API keys tienen muchos privilegios, mantenelas de forma segura. No compartas tus Secret API Keys ni las uses en codigo client-side."

### 2. Validacion de Webhooks

Siempre validar el `X-Webhook-Secret` header antes de procesar webhooks.

### 3. Verificacion de Pagos

Nunca confiar solo en el callback del SDK. Siempre verificar el estado con la API de ONVO:

```typescript
// Doble verificacion: SDK callback + API verification
const verifyResponse = await fetch(
  `${ONVO_API_URL}/payment-intents/${paymentIntentId}`,
  { headers: { 'Authorization': `Bearer ${ONVO_SECRET_KEY}` } }
);
```

### 4. HTTPS Obligatorio

Todas las solicitudes deben hacerse mediante HTTPS.

> **Referencia**: [ONVOapidoc.md:60-61](ONVOapidoc.md)

---

## Esquema de Base de Datos

### Tabla `orders` (Stickers Individuales)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  preview_id UUID REFERENCES preview_images(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
  amount_cents INTEGER NOT NULL,
  onvo_payment_intent_id VARCHAR(100),
  hd_base64 TEXT,
  download_token UUID,
  download_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla `credit_packs` (Paquetes)

```sql
CREATE TABLE credit_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_email VARCHAR(255),
  pack_type VARCHAR(50) DEFAULT 'starter',
  total_codes INTEGER DEFAULT 10,
  codes_generated INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
  onvo_payment_intent_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Checklist de Implementacion

- [ ] Obtener API Keys de ONVO Dashboard (test y/o live)
- [ ] Configurar variables de entorno
- [ ] Implementar endpoint para crear PaymentIntents
- [ ] Integrar SDK de ONVO en frontend
- [ ] Implementar endpoint de confirmacion de pagos
- [ ] Configurar webhook en ONVO Dashboard
- [ ] Implementar handler de webhooks
- [ ] Probar con tarjetas de prueba
- [ ] Probar flujo 3DS con tarjeta `4000000000003220`
- [ ] Probar manejo de errores con tarjeta `4000000000000002`
- [ ] Cambiar a modo live para produccion

---

## Referencias Adicionales

- **Documentacion API ONVO**: [ONVOapidoc.md](ONVOapidoc.md)
- **SDK JavaScript**: `https://sdk.onvopay.com/sdk.js`
- **API Base URL**: `https://api.onvopay.com/v1`
- **Dashboard ONVO**: Para obtener API Keys y configurar webhooks

---

*Documento generado basado en la implementacion de Locoface y la documentacion oficial de ONVO Pay.*
