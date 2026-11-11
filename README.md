# BidZone — Plataforma de Subastas Online en Tiempo Real

Plataforma web de subastas en línea orientada a la compra y venta de artículos mediante pujas competitivas en tiempo real. El sistema integra un motor de ofertas en vivo, finalización automatizada mediante temporizador, liberación de datos de contacto entre partes para coordinación directa y un esquema de reputación, reportes y penalizaciones por incumplimiento.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Integrantes (Grupo 8)](#-integrantes-grupo-8)
3. [Características Principales](#-características-principales)
4. [Reglas de Negocio](#-reglas-de-negocio)
5. [Arquitectura General y Estructura del Repositorio](#️-arquitectura-general-y-estructura-del-repositorio)
6. [Stack Tecnológico](#️-stack-tecnológico)
7. [Instalación y Puesta en Marcha](#️-instalación-y-puesta-en-marcha)
8. [Scripts Disponibles](#-scripts-disponibles)
9. [Convenciones y Buenas Prácticas](#-convenciones-y-buenas-prácticas)

---

## 📖 Descripción General

En las transacciones informales de compra y venta a través de redes sociales o medios tradicionales, la falta de transparencia, la superposición de ofertas y la falta de seriedad en las propuestas generan disputas y desconfianza.

**BidZone** soluciona esta problemática proporcionando:

- **Transparencia total:** Historial cronológico de pujas auditable y visible para todos los participantes en tiempo real.
- **Cierre automatizado e imparcial:** Finalización estricta por tiempo que bloquea pujas posteriores y adjudica el producto de forma autónoma al postor con la mayor oferta.
- **Liberación bilateral de contacto:** Al finalizar la subasta, se habilitan mutuamente los canales de comunicación entre vendedor y ganador para que coordinen el pago y la entrega del artículo de forma particular.
- **Compromiso vinculante y penalizaciones:** Toda oferta genera una obligación de compra; el incumplimiento o falta de pago es reportable ante la plataforma y deriva en infracciones, suspensión temporal o cierre definitivo de la cuenta.
- **Confianza comunitaria:** Sistema de calificación mutua (1 a 5 estrellas) tras concretar la operación para fomentar una reputación confiable.

---

## 👥 Integrantes (Grupo 8)

- **Mario Matías Moussa**
- **Luciano Medina**
- **Leandro Agustín Quipildor**

**Cátedra:** Análisis, Modelado y Diseño de Sistemas

---

## 🚀 Características Principales

- **Exploración y Búsqueda:** Catálogo público de subastas activas y finalizadas con filtros por categorías, estado y ordenamiento por tiempo restante o precio actual.
- **Sala de Pujas en Vivo (Live Bidding):** Actualización inmediata de ofertas, cronómetro de cuenta regresiva monoespaciado e indicadores de estado dinámicos (_"Postor líder"_ vs _"Oferta superada"_).
- **Publicación Guiada (Rol Vendedor):** Flujo de creación de subastas en pasos (datos del producto, precio base, incremento mínimo y fecha/hora de cierre).
- **Adjudicación y Contacto Directo:** Al cerrar la subasta, la plataforma provee una vista privada exclusiva para el vendedor y el ganador con sus datos de contacto (teléfono, email, mensajería) para coordinar el pago y la entrega fuera de la app.
- **Centro de Reportes y Mediación:** Interfaz para notificar incumplimientos de pago o entrega, adjuntar evidencia y solicitar la intervención administrativa para aplicar sanciones o cierres de cuenta.
- **Panel de Usuario Centralizado:** Seguimiento de subastas publicadas, pujas activas, subastas ganadas y estado de coordinación.
- **Centro de Notificaciones:** Alertas inmediatas cuando la oferta de un usuario es superada, cuando se adjudica una subasta o cuando se recibe una calificación o reclamo.

---

## ⚖️ Reglas de Negocio

El sistema aplica de forma obligatoria las siguientes invariantes operativas:

| Código   | Regla                             | Descripción                                                                                                                  |
| :------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **RN01** | **Incremento Mínimo**             | Toda puja debe superar el precio actual de la subasta por un margen mínimo predefinido por el vendedor.                     |
| **RN02** | **Prohibición de Auto-puja**      | Un usuario no puede realizar ofertas sobre subastas creadas por él mismo.                                                    |
| **RN03** | **Vigencia Temporal**             | Solo se admiten ofertas si la subasta se encuentra en estado `activa` y el tiempo no ha expirado.                            |
| **RN04** | **Irrevocabilidad y Compromiso**  | Las ofertas registradas son vinculantes; el postor no puede cancelar ni retractarse de una puja una vez enviada.             |
| **RN05** | **Liberación Condicional de Datos**| Los datos de contacto entre vendedor y postor solo se desbloquean una vez que la subasta finaliza con un postor ganador.  |
| **RN06** | **Régimen de Infracciones**       | Si alguna parte no cumple con la coordinación, pago o entrega pactada, la contraparte puede emitir un reporte para sanción. |
| **RN07** | **Calificación Única**            | La calificación mutua solo se habilita tras el cierre formal con ganador asignado (máximo una calificación por parte).       |
| **RN08** | **Inmutabilidad por Oferta**      | Una vez que una subasta recibe su primera oferta válida, sus condiciones base (precio y duración) quedan bloqueadas.         |

---

## 🏗️ Arquitectura General y Estructura del Repositorio

El proyecto está organizado en tres carpetas hermanas bajo el directorio raíz `BidZone/`:

```text
├── database/                        # Capa de persistencia MySQL 8.0+
│   ├── schema.sql                   # Tablas, PK, FK, índices, CHECK y restricciones de integridad
│   ├── seed.sql                     # Datos semilla idempotentes para entorno de desarrollo
│   └── DER.md                       # Diagrama Entidad-Relación (DER) y cardinalidades
│
├── backend/                         # API REST en Node.js + Express + mysql2
│   ├── .env.example                 # Plantilla de variables de entorno (sin secretos)
│   ├── src/
│   │   ├── config/                  # Conexión MySQL (mysql2/promise) y lectura de entorno
│   │   ├── middlewares/             # JWT Auth, RBAC por rol, validación y errores centralizados
│   │   ├── models/                  # Consultas SQL parametrizadas (users, auctions, bids, reports, reviews, notifications)
│   │   ├── controllers/             # Reglas de negocio (RN01-RN08), transacciones y privacidad RN05
│   │   ├── routes/                  # Endpoints REST bajo /api/*
│   │   ├── database/                # Scripts initDb.js y seedDb.js
│   │   ├── app.js                   # Factory de la app Express (exportada para pruebas)
│   │   └── server.js                # Arranque HTTP y verificación inicial de MySQL
│   └── tests/api.test.js            # Pruebas unitarias de controladores y reglas de negocio
│
└── BidZone/                         # Frontend Web (React + Vite + Tailwind + Zustand)
    ├── .env.example                 # Variable VITE_API_URL=http://localhost:3000/api
    └── src/
        ├── modules/
        │   ├── core/                # Design system, Layout, Navbar, Dashboard dinámico y cliente HTTP
        │   ├── auth/                # Login, registro, gestión de usuarios y sesión JWT
        │   ├── auctions/            # Catálogo, detalle con pujas en vivo, publicación y edición
        │   ├── bids/                # Registro, listado y edición de notas de pujas
        │   ├── reports/             # Reportes de incumplimiento y sanciones administrativas RN06
        │   ├── reviews/             # Calificaciones post-cierre y reputación RN07
        │   └── notifications/       # Bandeja personal de notificaciones
        ├── App.jsx
        └── main.jsx
```

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM, Zustand, Lucide React.
- **Backend:** Node.js (ESM), Express, `mysql2/promise`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`.
- **Base de Datos:** MySQL 8.0+.

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Requisitos previos
- **Node.js** 18+ y `npm`
- **MySQL Server** 8.0+ en ejecución local (puedes usar MySQL Workbench para inspeccionar el esquema y las tablas)

### 2. Configurar y levantar el Backend + MySQL

Desde la carpeta hermana `../backend`:

1. Instala las dependencias:
   ```bash
   cd ../backend
   npm install
   ```
2. Crea tu archivo de entorno local a partir de `.env.example` (sin subir `.env` al repositorio):
   - Completa `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (por ejemplo, una base vacía en MySQL) y una clave segura para `JWT_SECRET`.
   - Opcionalmente define `SEED_ADMIN_PASSWORD` y `SEED_USER_PASSWORD` si deseas personalizar las claves de las cuentas de demostración al ejecutar el seed.
3. Inicializa el esquema y carga los datos iniciales en MySQL:
   ```bash
   npm run db:init
   npm run db:seed
   ```
4. Inicia el servidor Express en modo desarrollo:
   ```bash
   npm run dev
   ```
   La API quedará escuchando por defecto en `http://localhost:3000/api` (`GET /api/health` confirma la conexión activa a MySQL).

### 3. Configurar y levantar el Frontend

Desde esta carpeta (`BidZone/`):

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. (Opcional) Si tu API corre en otro puerto o host, copia `.env.example` a `.env` y ajusta `VITE_API_URL`. Por defecto usa `http://localhost:3000/api`.
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   Abre `http://localhost:5173` en tu navegador.

---

## 📜 Scripts Disponibles

### En `BidZone/` (Frontend)
- `npm run dev` — Servidor de desarrollo Vite (`http://localhost:5173`).
- `npm run build` — Compilación de producción en `dist/`.
- `npm run lint` — Análisis estático con `oxlint`.
- `npm run preview` — Previsualización del build de producción.

### En `../backend/` (Backend y DB)
- `npm run dev` — Inicia el servidor Express con recarga automática (`node --watch`).
- `npm start` — Inicia el servidor Express en modo estándar.
- `npm run db:init` — Ejecuta `../database/schema.sql` contra MySQL.
- `npm run db:seed` — Ejecuta `../database/seed.sql` de forma idempotente en MySQL.
- `npm test` — Ejecuta la suite de pruebas unitarias de controladores y reglas de negocio.

---

## 🔒 Convenciones y Buenas Prácticas

- Todo estado de dominio se sincroniza directamente contra MySQL a través de la API REST (`/api/*`), sin almacenamiento mock en `localStorage` (únicamente el token JWT `bidzone_token` y la caché de sesión `bidzone_user` se persisten en `localStorage` para conservar la sesión).
- Los datos de contacto privado (`email`, `phone`) permanecen ocultos hasta la adjudicación formal de una subasta con ganador asignado (**RN05**).
- Las credenciales reales nunca se versionan ni se documentan en código fuente; utiliza archivos `.env` locales ignorados por Git.
