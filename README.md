# BidZone — Plataforma de Subastas Online en Tiempo Real

Plataforma web de subastas en línea orientada a la compra y venta de artículos mediante pujas competitivas en tiempo real. El sistema integra un motor de ofertas en vivo, control de saldo con retención preventiva, finalización automatizada mediante temporizador y un esquema de reputación y calificación mutua entre usuarios.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Integrantes (Grupo 8)](#-integrantes-grupo-8)
3. [Características Principales](#-características-principales)
4. [Reglas de Negocio](#-reglas-de-negocio)
5. [Arquitectura del Proyecto (Screaming Architecture)](#-arquitectura-del-proyecto-screaming-architecture)
6. [Modelo de Datos (MySQL)](#-modelo-de-datos-mysql)
7. [Stack Tecnológico](#-stack-tecnológico)
8. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
9. [Scripts Disponibles](#-scripts-disponibles)
10. [Convenciones y Buenas Prácticas](#-convenciones-y-buenas-prácticas)

---

## 📖 Descripción General

En las transacciones informales de compra y venta a través de redes sociales o medios tradicionales, la falta de transparencia, la superposición de ofertas y la ausencia de compromisos de pago generan disputas y desconfianza.

**BidZone** soluciona esta problemática proporcionando:

- **Transparencia total:** Historial cronológico de pujas auditable y visible para todos los participantes.
- **Compromiso financiero:** Validación de saldo en cuenta previo al registro de una puja, congelando preventivamente los fondos para asegurar la transacción.
- **Cierre automatizado e imparcial:** Finalización estricta por tiempo que bloquea pujas posteriores y adjudica el producto de forma autónoma al postor con la mayor oferta.
- **Confianza comunitaria:** Sistema de calificación mutua (1 a 5 estrellas) tras concretar la operación.

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
- **Billetera Virtual (Wallet):** Diferenciación estricta entre **Saldo Disponible** y **Saldo Comprometido en Pujas**, con registro de transacciones (recargas, retenciones, liberaciones, cobros y pagos).
- **Publicación Guiada (Rol Vendedor):** Flujo de creación de subastas en pasos (datos del producto, precio base, incremento mínimo y fecha/hora de cierre).
- **Panel de Usuario Centralizado:** Seguimiento de subastas publicadas, pujas activas y productos ganados.
- **Centro de Notificaciones:** Alertas inmediatas cuando la oferta de un usuario es superada o cuando se adjudica una subasta.

---

## ⚖️ Reglas de Negocio

El sistema aplica de forma obligatoria las siguientes invariantes operativas:

| Código   | Regla                        | Descripción                                                                                                            |
| :------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **RN01** | **Incremento Mínimo**        | Toda puja debe superar el precio actual de la subasta por un margen mínimo predefinido.                                |
| **RN02** | **Prohibición de Auto-puja** | Un usuario no puede realizar ofertas sobre subastas creadas por él mismo.                                              |
| **RN03** | **Vigencia Temporal**        | Solo se admiten ofertas si la subasta se encuentra en estado `activa` y el tiempo no ha expirado.                      |
| **RN04** | **Irrevocabilidad**          | Las ofertas registradas son vinculantes; el postor no puede cancelar ni retractarse de una puja.                       |
| **RN05** | **Respaldo de Saldo**        | El postor debe disponer de saldo suficiente para cubrir el monto ofertado; dicho importe pasa a estado comprometido.   |
| **RN06** | **Calificación Única**       | La calificación mutua solo se habilita tras el cierre formal con ganador asignado (máximo una calificación por parte). |
| **RN07** | **Inmutabilidad por Oferta** | Una vez que una subasta recibe su primera oferta válida, sus condiciones base (precio y duración) quedan bloqueadas.   |

---

## 🏗️ Arquitectura del Proyecto (Screaming Architecture)

El frontend sigue el patrón **Screaming Architecture**, donde la estructura de carpetas expresa de forma directa el dominio del negocio en lugar de la tecnología empleada.

```text
src/
├── assets/                          # Recursos gráficos globales (iconos, imágenes)
│   ├── icons/
│   └── images/
│
├── modules/                         # Módulos de dominio y soporte
│   ├── core/                        # Infraestructura transversal y componentes comunes
│   │   ├── components/              # Layout, Navbar, Footer, ProtectedRoute
│   │   ├── design-system/           # Componentes UI atómicos (Button, Input, Modal, Badge, Card)
│   │   ├── hooks/                   # Hooks genéricos (useTheme, useDebounce)
│   │   ├── lib/                     # Clientes HTTP, configuración base de WebSockets
│   │   └── utils/                   # Formateadores (moneda, fecha) y utilidades de estilo
│   │
│   ├── auth/                        # Autenticación, registro y perfil de usuarios
│   │   ├── components/              # LoginForm, RegisterForm, UserProfileCard
│   │   ├── hooks/                   # useAuth
│   │   ├── lib/                     # auth.types.ts
│   │   ├── services/                # authService.ts
│   │   ├── states/                  # authStore / AuthContext
│   │   └── utils/                   # Validaciones de credenciales
│   │
│   ├── auctions/                    # Catálogo, publicación y detalle de artículos
│   │   ├── components/              # AuctionCard, AuctionHero, AuctionFilters, CountdownTimer
│   │   ├── hooks/                   # useAuctions, useAuctionTimer
│   │   ├── lib/                     # auction.types.ts
│   │   ├── services/                # auctionService.ts
│   │   ├── states/                  # auctionFilterStore
│   │   └── utils/                   # Validadores de subasta
│   │
│   ├── bids/                        # Motor de pujas y sala en tiempo real
│   │   ├── components/              # LiveBiddingRoom, BidForm, BidHistoryList, BidStatusBadge
│   │   ├── hooks/                   # useBids, useLiveAuctionSocket
│   │   ├── lib/                     # bid.types.ts
│   │   ├── services/                # bidService.ts
│   │   ├── states/                  # liveBidStore
│   │   └── utils/                   # Cálculo de puja mínima permitida
│   │
│   ├── wallet/                      # Gestión de billetera virtual y transacciones
│   │   ├── components/              # WalletWidget, RechargeModal, TransactionsTable
│   │   ├── hooks/                   # useWallet
│   │   ├── lib/                     # wallet.types.ts
│   │   ├── services/                # walletService.ts
│   │   ├── states/                  # walletStore
│   │   └── utils/
│   │
│   ├── reviews/                     # Calificaciones y reputación
│   │   ├── components/              # ReviewModal, StarRatingDisplay, UserReviewsList
│   │   ├── hooks/                   # useReviews
│   │   ├── lib/                     # review.types.ts
│   │   ├── services/                # reviewService.ts
│   │   ├── states/
│   │   └── utils/
│   │
│   └── notifications/               # Centro de notificaciones y alertas
│       ├── components/              # NotificationBell, NotificationDrawer
│       ├── hooks/                   # useNotifications
│       ├── lib/                     # notification.types.ts
│       ├── services/                # notificationService.ts
│       ├── states/                  # notificationStore
│       └── utils/
│
├── App.tsx                          # Enrutador principal de la aplicación
└── main.tsx                         # Punto de entrada de Vite
```
