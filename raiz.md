PRP-002: PetWalkOS – Client + Walker Portal Architecture

Estado: READY FOR EXECUTION
Prioridad: CRITICAL (Core Product)
Role: SaaS Factory Architect

1. Executive Summary & Vision

PetWalkOS es una plataforma para conectar clientes con paseadores verificados, permitiendo agendar paseos, administrar mascotas, pagos y notificaciones, y operar un Marketplace complementario (collar QR, vet, pelu, comida, hoteles, etc.).

🎯 Objetivo principal:
Convertir el paseo de mascotas en un servicio confiable, ordenado y trazable, con experiencia tipo “Uber” pero para mascotas.

2. Roles & UX (Jerarquía Real)
1) ADMINISTRADOR (WEB)

Permisos:

Validar registros de paseadores (aprobación/rechazo)

Ver todo: clientes, paseadores, paseos, pagos

Configurar catálogo/marketplace/promos

Gestión de reglas (comunas habilitadas, horarios, tarifas base, etc.)

UX:

Panel Admin: “Pendientes de Validación”, “Servicios del día”, “Incidencias”, “Pagos”

2) PASEADOR

Menús:

HOME

REGISTRO (solo si es primera vez)

MIS AGENDAMIENTOS

Próximos (por hacer)

Historial (realizados)

NOTIFICACIONES

Nuevo paseo asignado, cancelado, modificado, pagado

AJUSTES

Preferencias (Comunas, días/horarios, tipos de mascotas)

Mi cuenta (contacto, mail, teléfono, nombre, rut)

Permisos:

Ver y gestionar solo los paseos asignados a él

Confirmar estados del paseo (in_progress / done)

Subir evidencia/entrega (foto o nota)

No ve otros paseadores ni otros clientes

3) CLIENTE

HOME

Dashboard (si no hay paseos: imagen de mascota + “Agenda tu primer paseo”)

Botón “Agendar paseo”

Promociones y beneficios (suscripción mensual)

Mapas

Marcas

Buscador

MARKETPLACE

Seguridad (Collar QR)

Vet

Pelu

Comidas

Hoteles

Juguetes

Entrenadores

NOTIFICACIONES

(definible: confirmación, paseador en camino, paseo finalizado, etc.)

AJUSTES

Mi cuenta (contacto, dirección, mail, etc.)

Métodos de pago

Mis mascotas (raza, tipo, fotos)

Preguntas frecuentes y ayuda + correo soporte

Permisos:

Solo ve sus mascotas y sus agendamientos

Puede cancelar/modificar dentro de reglas

Puede calificar y comentar

3. Data Architecture (Supabase Schema)

CRITICAL: RLS obligatorio.
Un cliente jamás puede ver datos de otro cliente, ni paseos de otro.

Tabla: profiles

id: uuid (PK → auth.users)

role: enum ('admin', 'walker', 'client')

full_name: text

email: text

phone: text

rut: text

avatar_url: text

created_at: timestamp

Tabla: walker_profiles

(Extensión del paseador)

user_id: uuid (PK/FK → profiles.id)

status: enum ('pending', 'approved', 'rejected')

communes: text[] (comunas donde trabaja)

available_days: text[] (ej: ["Mon","Tue"])

available_hours: jsonb (ej: { "from":"09:00", "to":"18:00" })

pet_types: text[] (ej: ["dog","cat"])

rating_avg: numeric

total_walks: int

✅ Esta tabla es la que el Admin valida

Tabla: pets

id: uuid (PK)

owner_id: uuid (FK → profiles.id) (cliente)

name: text

species: enum ('dog','cat','other')

breed: text

size: enum ('s','m','l')

notes: text

photo_url: text

created_at: timestamp

Tabla: walk_bookings (Agendamientos)

id: uuid (PK)

client_id: uuid (FK → profiles.id)

walker_id: uuid (FK → profiles.id, nullable hasta asignar)

pet_id: uuid (FK → pets.id)

status: enum (
'requested',
'assigned',
'scheduled',
'in_progress',
'completed',
'cancelled'
)

scheduled_at: timestamp

duration_minutes: int

pickup_address: text

pickup_lat: numeric

pickup_lng: numeric

price: numeric

created_at: timestamp

Tabla: booking_updates (Audit Log / Timeline)

id: uuid (PK)

booking_id: uuid (FK → walk_bookings.id)

actor_id: uuid (FK → profiles.id) (quién lo hizo)

type: enum ('system','status','note','delivery','payment')

content: text

created_at: timestamp

✅ Esto alimenta el timeline del cliente y también sirve para IA.

Tabla: notifications

id: uuid (PK)

user_id: uuid (FK → profiles.id)

title: text

body: text

type: enum ('booking','payment','system')

data: jsonb

read_at: timestamp (nullable)

created_at: timestamp

Tabla: payments

id: uuid (PK)

client_id: uuid

booking_id: uuid (nullable si es suscripción)

type: enum ('single_walk','subscription')

provider: enum ('stripe','mercadopago','manual')

status: enum ('pending','paid','failed','refunded')

amount: numeric

created_at: timestamp

Tabla: marketplace_items

id: uuid (PK)

category: enum ('security','vet','grooming','food','hotels','toys','training')

name: text

description: text

image_url: text

link_url: text

is_active: boolean

created_at: timestamp

4. RLS Rules (Core Security)

✅ Resumen de políticas (alto nivel):

CLIENT

pets: solo owner_id = auth.uid()

walk_bookings: client_id = auth.uid()

booking_updates: solo si booking pertenece al cliente

payments: solo client_id = auth.uid()

notifications: solo user_id = auth.uid()

WALKER

walker_profiles: solo su user_id

walk_bookings: solo walker_id = auth.uid()

booking_updates: solo de bookings asignados a él

notifications: solo user_id = auth.uid()

ADMIN

acceso total a todo

5. Tech Stack (Golden Path)

Sin desviaciones (igual al estándar pro):

Next.js 16 (App Router + Turbopack)

TypeScript Strict

Supabase (Auth + Postgres + Realtime)

Tailwind v3.4 + shadcn/ui + lucide-react

Dark Mode + Glassmorphism + Inter

Realtime para notificaciones + cambios de estado

Server Components + Server Actions

(IA opcional en fase avanzada)

6. Blueprint – The Assembly Line
FASE 1: Foundation & Security (Bunker)

Objetivo: proyecto listo + tablas + RLS + login.

Tareas

Scaffold Next.js + Supabase

SQL migrations: schema completo + enums

RLS por rol (admin/walker/client)

Middleware para proteger rutas:

/admin/*

/walker/*

/client/*

Auth UI (Glassmorphism, full responsive)

✅ Entregable: “Login funcional + DB blindada”

FASE 2: Core Scheduling (El Motor)

Objetivo: agendar y operar paseos.

Cliente

Dashboard

Crear agendamiento (seleccionar mascota + fecha/hora + dirección)

Ver estado + timeline

Paseador

Mis agendamientos: próximos / historial

Cambiar estados: scheduled → in_progress → completed

Notas / evidencia

Admin

Ver todos los bookings del día

Asignar paseador manualmente (si se requiere)

FASE 3: Validación de Paseadores (Control Tower)

Objetivo: onboarding paseador + aprobación.

Paseador

Registro primera vez (walker_profiles status = pending)

Ajustes de disponibilidad (comunas/días/horarios)

Admin

Bandeja “Pendientes de Validación”

Aprobar / Rechazar paseadores

Solo aprobados pueden recibir asignaciones

FASE 4: Notificaciones & Realtime

Objetivo: sensación de app viva.

Notificación en:

booking asignado

booking cancelado/modificado

pago confirmado

Realtime con Supabase subscriptions:

cambios en walk_bookings.status

nuevas filas en notifications

FASE 5: Pagos & Suscripción Mensual

Objetivo: monetización real.

Pago por paseo

Suscripción mensual (beneficios y promos)

Historial de pagos

Reglas de cancelación/reembolso (por políticas)

FASE 6: Marketplace

Objetivo: revenue extra + ecosistema.

Categorías y items gestionados por Admin

Cliente ve marketplace, puede abrir links externos

Posible tracking de clicks después

7. IA (Opcional Avanzado)

AIWalkReport

Botón “Resumen de paseos del mes”

Lee booking_updates y genera resumen tipo “estado + historial + recomendaciones”

Tono: claro, breve, profesional

8. Execution Command (Como lo construiríamos ya)

Scaffold proyecto

Primero SQL migrations + RLS

Luego Login + middleware de roles

Después Scheduling + Notificaciones

Si necesitas que te haga preguntas (las mínimas)

Para dejarlo PERFECTO, estas 6 son las más importantes:

¿Los paseadores se asignan automático (match por comuna/horario) o admin asigna al inicio?

¿El cliente agenda “para ahora” o solo con anticipación?

¿Cada booking es 1 mascota o puede ser “2 mascotas juntas”?

¿El paseador marca inicio/fin manualmente o quieres GPS tracking real?

¿Pagos por MercadoPago, Stripe, o ambos? (Chile normalmente MP)

¿El marketplace es solo links o quieres comprar dentro?

Si me respondes eso, te lo dejo en modo listo para ejecución con:
✅ SQL completo + enums + RLS reales
✅ Estructura de carpetas Next.js
✅ Rutas /admin /walker /client con layouts por rol