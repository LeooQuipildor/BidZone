# BidZone — Frontend (Aplicación Web de Subastas en Tiempo Real)

Este repositorio contiene la **aplicación web Frontend** de **BidZone**, una plataforma de subastas en línea con **pujas competitivas en tiempo real**, cierre automático por cuenta regresiva, liberación condicional de contacto entre vendedor y ganador, recuperación de contraseña en 2 pasos, panel de métricas gráficas para administradores, sistema de reportes de mediación y calificaciones con estrellas.

> **Nota sobre la arquitectura:** BidZone está separado en dos repositorios independientes: este **Frontend (React + Vite)** y su **Backend REST API (Node.js + Express + MySQL)**, que se conectan mediante HTTP/JSON a través de la variable `VITE_API_URL`.

---

## 📋 Tabla de Contenidos

1. [Integrantes (Grupo 8)](#-1-integrantes-grupo-8)
2. [Funcionalidades Principales y Roles en la Interfaz](#-2-funcionalidades-principales-y-roles-en-la-interfaz)
3. [Reglas de Negocio Validadas en el Frontend (RN01 – RN08)](#-3-reglas-de-negocio-validadas-en-el-frontend-rn01--rn08)
4. [Arquitectura Modular y Estructura de Carpetas](#️-4-arquitectura-modular-y-estructura-de-carpetas)
5. [Gestión de Estado Global (Zustand Stores) y Conexión API](#-5-gestión-de-estado-global-zustand-stores-y-conexión-api)
6. [Mapa de Rutas y Vistas CRUD](#-6-mapa-de-rutas-y-vistas-crud)
7. [Sistema de Diseño y Componentes Reutilizables](#-7-sistema-de-diseño-y-componentes-reutilizables)
8. [Stack Tecnológico](#️-8-stack-tecnológico)
9. [Instalación y Puesta en Marcha Paso a Paso](#️-9-instalación-y-puesta-en-marcha-paso-a-paso)
10. [Cuentas de Prueba para Iniciar Sesión](#-10-cuentas-de-prueba-para-iniciar-sesión)
11. [Scripts Disponibles](#-11-scripts-disponibles)

---

## 👥 1. Integrantes (Grupo 8)

- **Mario Matías Moussa**
- **Luciano Medina**
- **Leandro Agustín Quipildor**

**Cátedra:** Programación 4

---

## 🔐 2. Funcionalidades Principales y Roles en la Interfaz

La interfaz se adapta automáticamente según el rol del usuario conectado:

### 1. Visitante (Sin iniciar sesión)

- Explora la portada (`Inicio`) y el catálogo completo (`/subastas`) con buscador en tiempo real, filtros por categoría, filtros rápidos (`Activas`, `Termina Hoy`, `Termina Mañana`, `Finalizadas`, `Todas`), ordenamiento y paginación.
- Consulta el detalle de cualquier lote (`/subastas/:id`), su galería de hasta 4 fotos, la cuenta regresiva en vivo y el historial de ofertas.
- Lee los reglamentos (`/reglamentos`) y preguntas frecuentes (`/preguntas-frecuentes`).
- Si intenta acceder a una ruta privada o realizar una oferta, `RutaProtegida.jsx` lo redirige a `/iniciar-sesion`.

### 2. Usuario Registrado (`rol: 'usuario'`)

- **Barra superior personalizada:** muestra el saludo `¡Hola (Nombre)!`, el botón directo **Panel**, el acceso **+ Publicar**, la campana con contador de notificaciones sin leer y el botón de cierre de sesión.
- **Publicación y gestión de subastas:** crea subastas con hasta 4 imágenes reales (`/subastas/nueva`), las edita respetando **RN08** y puede eliminarlas si todavía no recibieron ofertas.
- **Pujas en vivo:** oferta desde la ficha del artículo con cálculo automático del monto mínimo y confirmación modal vinculante (**RN04**), y puede editar únicamente la nota de coordinación de sus pujas (`/pujas/:id/editar`).
- **Contacto liberado (RN05):** al finalizar una subasta donde es vendedor o ganador, ve los datos directos de contacto (teléfono, WhatsApp y correo) con aviso de coordinación en 48 hs.
- **Reportes y Reseñas:** abre tickets ante incumplimientos (`/reportes/nuevo`) y califica a su contraparte con 1 a 5 estrellas (`/resenas/nueva`).
- **Recuperación de contraseña:** desde `/iniciar-sesion` puede pedir un código de 6 dígitos a su correo y actualizar su contraseña en 2 pasos (`FormularioRecuperarContrasena.jsx`).

### 3. Administrador / Moderador (`rol: 'admin'`)

- **Dashboard con 4 gráficos en vivo (`GraficosAdminPanel.jsx`):** en la pestaña _Resumen_ del `/panel` visualiza métricas actualizadas de subastas por categoría, estado de subastas, tickets de mediación RN06 y estado de cuentas de usuarios.
- **Moderación de subastas:** inspecciona todo el catálogo, puede enviar solicitudes oficiales de corrección al vendedor (`PanelSolicitudCorreccion.jsx`) o dar de baja publicaciones que infrinjan las normas.
- **Resolución de tickets (RN06):** revisa todos los reportes abiertos y aplica dictámenes desde `PanelResolucionTicket.jsx` (desestimar, advertir, suspender o cerrar cuenta).
- **Gestión de usuarios (`/usuarios`):** crea, edita y audita cuentas y roles de toda la plataforma.

---

## ⚖️ 3. Reglas de Negocio Validadas en el Frontend (RN01 – RN08)

| Código   | Regla                        | Cómo se refleja en la interfaz                                                                                                                     |
| :------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN01** | **Incremento Mínimo**        | `validarDatosPuja` en `ayudas.js` exige `precioActual + incrementoMinimo` y evita errores de tipeo (`10x` precio inicial).                         |
| **RN02** | **Prohibición de Auto-puja** | `PanelPujasSubasta.jsx` detecta si el usuario es el vendedor y bloquea el formulario de oferta.                                                    |
| **RN03** | **Vigencia Temporal**        | `useRelojSegundo` actualiza los temporizadores cada segundo y deshabilita pujas cuando el plazo vence.                                             |
| **RN04** | **Irrevocabilidad de Pujas** | `ModalConfirmarPuja.jsx` exige aceptar el compromiso vinculante; `VistaEditarPuja.jsx` solo permite modificar la nota.                             |
| **RN05** | **Liberación de Contacto**   | `PanelContactoSubasta.jsx` y `CierresAdjudicadosPanel.jsx` muestran teléfono/correo solo tras el cierre y únicamente entre vendedor y ganador.     |
| **RN06** | **Régimen de Infracciones**  | `PanelResolucionTicket.jsx` permite a los admins resolver tickets y aplicar sanciones visibles en el estado de cada cuenta.                        |
| **RN07** | **Calificación Mutua Única** | `FormularioResena.jsx` y `ayudasResena.js` habilitan calificar (1 a 5 estrellas) solo operaciones finalizadas y una sola vez por subasta.          |
| **RN08** | **Inmutabilidad por Oferta** | `FormularioSubasta.jsx` y `CamposSubasta.jsx` bloquean (`disabled`) precio base, incremento mínimo y fecha de cierre si la subasta ya tiene pujas. |

---

## 🏗️ 4. Arquitectura Modular y Estructura de Carpetas

El frontend sigue una **arquitectura modular orientada al dominio**: cada área funcional agrupa sus propios componentes, su store de estado global y sus utilidades.

```text
BidZone/
├── .env.example                                  # Variable VITE_API_URL para conectar con el backend
├── index.html                                    # Documento HTML raíz donde se monta React
├── package.json                                  # Dependencias y scripts de Vite / Oxlint
├── vite.config.js                                # Configuración de Vite + React + Tailwind CSS v4
└── src/
    ├── main.jsx                                  # Punto de entrada: monta <App /> en #root
    ├── App.jsx                                   # Enrutador principal (React Router DOM)
    ├── index.css                                 # Estilos globales y Tailwind CSS v4
    ├── assets/images/                            # Recursos estáticos (ej. portada-bidzone.jpg)
    └── modulos/
        ├── nucleo/                               # Código compartido por toda la aplicación
        │   ├── componentes/                      # Layout, Navbar, Footer, Inicio, PortadaInicio, RutaProtegida, VistaPanelControl, VistaReglamentos, VistaPreguntasFrecuentes, VistaError404
        │   │   └── panel/                        # Pestañas del /panel (Header, Sidebar, TabResumenPanel, GraficosAdminPanel, TabSubastasPanel, TabPujasPanel, TabReportesPanel, TabResenasPanel, TabUsuariosPanel, TabNotificacionesPanel, TabPerfilPanel)
        │   ├── diseno/                           # Componentes UI reutilizables (ui.jsx, uiFeedback.jsx, componentesBloques.jsx)
        │   ├── servicios/                        # Cliente HTTP centralizado con JWT (clienteApi.js)
        │   └── utilidades/                       # Formateadores de moneda/fechas y helpers (formatos.js, ayudas.js)
        │
        ├── autenticacion/                        # Login, Recuperación de contraseña, Registro y CRUD Usuarios
        │   ├── componentes/                      # VistaIniciarSesion, FormularioRecuperarContrasena, VistaRegistro, FormularioUsuario, VistaCrearUsuario, VistaEditarUsuario
        │   └── estado/
        │       └── storeAuthentication.js        # Hook useStoreAuthentication (sesión JWT y usuarios)
        │
        ├── subastas/                             # Catálogo, detalle en vivo y CRUD Subastas
        │   ├── componentes/                      # VistaListaSubastas, VistaDetalleSubasta, TarjetaSubasta, FichaProductoSubasta, CamposSubasta, FormularioSubasta, PanelPujasSubasta, PanelContactoSubasta, HistorialPujasSubasta, PanelSolicitudCorreccion, PaginacionCatalogo
        │   ├── estado/
        │   │   └── storeAuctions.js              # Hook useStoreAuctions (subastas, filtros y paginación)
        │   └── utilidades/                       # filtrosSubasta.js y galeriaSubasta.js (hasta 4 fotos)
        │
        ├── pujas/                                # Ofertas vinculantes (RN01–RN04)
        │   ├── componentes/                      # FormularioPuja, ModalConfirmarPuja, BloquesPuja, VistaCrearPuja, VistaEditarPuja
        │   └── estado/
        │       └── storeBids.js                  # Hook useStoreBids
        │
        ├── reportes/                             # Mesa de mediación e infracciones (RN06)
        │   ├── componentes/                      # FormularioReporte, PanelResolucionTicket, VistaCrearReporte, VistaEditarReporte
        │   └── estado/
        │       └── storeReports.js               # Hook useStoreReports
        │
        ├── resenas/                              # Calificaciones mutuas de 1 a 5 estrellas (RN07)
        │   ├── componentes/                      # CamposResena, FormularioResena, VistaCrearResena, VistaEditarResena
        │   ├── estado/
        │   │   └── storeReviews.js               # Hook useStoreReviews
        │   └── utilidades/                       # ayudasResena.js
        │
        └── notificaciones/                       # Bandeja de avisos del usuario
            └── estado/
                └── storeNotifications.js         # Hook useStoreNotifications
```

---

## 🧠 5. Gestión de Estado Global (Zustand Stores) y Conexión API

El estado compartido entre pantallas se administra con **6 stores de Zustand**, cada uno conectado a la API REST mediante `src/modulos/nucleo/servicios/clienteApi.js`:

| Archivo del Store                                         | Hook Exportado           | Responsabilidad                                                                                           |
| :-------------------------------------------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------- |
| `src/modulos/autenticacion/estado/storeAuthentication.js` | `useStoreAuthentication` | Inicio de sesión, registro, recuperación de contraseña, persistencia de sesión JWT y gestión de usuarios. |
| `src/modulos/subastas/estado/storeAuctions.js`            | `useStoreAuctions`       | Catálogo de subastas, detalle activo, búsqueda/filtros, paginación y CRUD de subastas.                    |
| `src/modulos/pujas/estado/storeBids.js`                   | `useStoreBids`           | Historial de pujas, creación de ofertas vinculantes y edición de notas.                                   |
| `src/modulos/reportes/estado/storeReports.js`             | `useStoreReports`        | Listado, creación, edición y resolución administrativa de tickets RN06.                                   |
| `src/modulos/resenas/estado/storeReviews.js`              | `useStoreReviews`        | Calificaciones mutuas post-cierre y sincronización de reputación.                                         |
| `src/modulos/notificaciones/estado/storeNotifications.js` | `useStoreNotifications`  | Bandeja personal de avisos, contador de no leídas y marcado de lectura.                                   |

### ¿Cómo se comunica el Frontend con el Backend?

- Todas las peticiones HTTP pasan por **`clienteApi.js`**, que toma la URL base desde `import.meta.env.VITE_API_URL` (por defecto `http://localhost:3000/api`).
- Cuando el usuario inicia sesión, el token JWT se guarda en `localStorage` y `clienteApi.js` lo adjunta automáticamente en la cabecera `Authorization: Bearer <token>`.
- Si el backend responde `401 Unauthorized` (token vencido o inválido), `clienteApi.js` ejecuta el manejador de cierre de sesión para limpiar todos los stores de forma segura.

---

## 🧭 6. Mapa de Rutas y Vistas CRUD

Todas las rutas principales están en español e incluyen redirecciones automáticas (`<Navigate replace />`) desde las rutas anteriores en inglés:

### Vistas CRUD por Entidad

| Entidad      | Listado                             | Creación                    | Edición                | Detalle                        |
| :----------- | :---------------------------------- | :-------------------------- | :--------------------- | :----------------------------- |
| **Subastas** | `/subastas` y `/panel?tab=subastas` | `/subastas/nueva`           | `/subastas/:id/editar` | `/subastas/:id`                |
| **Pujas**    | `/pujas`                            | `/pujas/nueva`              | `/pujas/:id/editar`    | Integrado en `/subastas/:id`   |
| **Reportes** | `/reportes`                         | `/reportes/nuevo`           | `/reportes/:id/editar` | Integrado en tarjeta y edición |
| **Reseñas**  | `/resenas`                          | `/resenas/nueva`            | `/resenas/:id/editar`  | Tarjeta con estrellas          |
| **Usuarios** | `/usuarios` _(Admin)_               | `/usuarios/nuevo` _(Admin)_ | `/usuarios/:id/editar` | `/panel?tab=perfil`            |

### Vistas Públicas y de Sistema

- `/` — **Inicio** (`Inicio.jsx`): Portada, buscador rápido, subastas destacadas y módulos del sistema.
- `/iniciar-sesion` _(alias `/login`)_ — **Iniciar Sesión y Recuperar Contraseña** (`VistaIniciarSesion.jsx` + `FormularioRecuperarContrasena.jsx`).
- `/registro` _(alias `/register`)_ — **Crear Cuenta** (`VistaRegistro.jsx`).
- `/panel` _(alias `/dashboard`)_ — **Panel de Control** (`VistaPanelControl.jsx`).
- `/reglamentos` _(alias `/rules`)_ — **Reglamentos** (`VistaReglamentos.jsx`).
- `/preguntas-frecuentes` _(alias `/faq`)_ — **Preguntas Frecuentes** (`VistaPreguntasFrecuentes.jsx`).
- `/notificaciones` _(alias `/notifications`)_ — **Centro de Notificaciones** (`TabNotificacionesPanel.jsx`).
- `/404` y `*` — **Error 404** (`VistaError404.jsx`).

---

## 🎨 7. Sistema de Diseño y Componentes Reutilizables

- **Paleta oficial BidZone:** verde lima claro (`#EAFFD0`), lima vibrante (`#B0E454`), verde bosque (`#224F10`) y negro carbón (`#0D0D0D`).
- **Componentes base (`src/modulos/nucleo/diseno/`):**
  - `ui.jsx`: `Button`, `Input`, `Textarea`, `Select`, `Badge`, `Card`.
  - `uiFeedback.jsx`: `Alert`, `Modal`, `EmptyState`, `Loading`, `ErrorCard`, `StarRating`.
  - `componentesBloques.jsx`: `CabeceraPagina`, `PaginaFormulario`, `AccionesFormulario`, `CampoFormulario`, `FiltrosBotones`, `TarjetaEstadistica`, `TarjetaCtaCatalogo`.
- **Reutilización y rendimiento:**
  - `TarjetaSubasta.jsx` unifica la tarjeta de lote en Inicio, Explorar y Panel.
  - `FormularioUsuario.jsx` sirve tanto para el perfil personal como para la administración de usuarios.
  - `useRelojSegundo` sincroniza todas las cuentas regresivas de una pantalla con un solo intervalo.

---

## 🛠️ 8. Stack Tecnológico

- **React 19** — Construcción de la interfaz por componentes.
- **Vite 8** — Entorno de desarrollo con HMR y empaquetado de producción.
- **Tailwind CSS v4** (`@tailwindcss/vite`) — Estilos utilitarios y diseño responsivo.
- **React Router DOM v7** — Enrutamiento SPA y protección de rutas por rol.
- **Zustand v5** — Stores globales ligeros y modulares.
- **Lucide React** — Iconografía SVG consistente.
- **Oxlint** — Análisis estático ultrarrápido (`0` errores y `0` advertencias).

---

## ⚙️ 9. Instalación y Puesta en Marcha Paso a Paso

### Requisitos Previos

- **Node.js** `v18+` y `npm`.
- Tener encendido el servidor **Backend de BidZone** (por defecto en `http://localhost:3000/api`) con su base de datos MySQL inicializada.

### Pasos para levantar el Frontend

1. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```
2. _(Opcional)_ Si tu backend corre en otro puerto o dominio, creá un archivo `.env` tomando como base `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
3. Iniciar el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador:
   ```text
   http://localhost:5173
   ```

---

## 🧪 10. Cuentas de Prueba para Iniciar Sesión

Una vez cargado el seed del backend, podés probar la aplicación desde `/iniciar-sesion` con cualquiera de estas cuentas:

| Rol               | Nombre                     | Correo Electrónico                                             | Contraseña     |
| :---------------- | :------------------------- | :------------------------------------------------------------- | :------------- |
| **Administrador** | Leandro Quipildor          | `leandroadmin@bidzone.com`                                     | `leandroadmin` |
| **Administrador** | Mario Matías Moussa        | `marioadmin@bidzone.com`                                       | `marioadmin`   |
| **Administrador** | Luciano Medina             | `lucianoadmin@bidzone.com`                                     | `lucianoadmin` |
| **Usuario común** | Sofía, Tomás, Camila, etc. | `sofia@bidzone.com`, `tomas@bidzone.com`, `camila@bidzone.com` | `user123`      |

---

## 📜 11. Scripts Disponibles

| Comando           | Descripción                                                       |
| :---------------- | :---------------------------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo Vite en `http://localhost:5173`. |
| `npm run build`   | Genera la compilación optimizada de producción en `dist/`.        |
| `npm run lint`    | Ejecuta el linter `oxlint` sobre todo el proyecto.                |
| `npm run preview` | Sirve localmente la compilación generada en `dist/`.              |
