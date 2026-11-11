# ReservaUPLA — reservas de ambientes universitarios

Caso práctico de Construcción de Software (UPLA). Aplicación web para registrar, validar, consultar y visualizar reservas de laboratorios, auditorios y salas: API en ASP.NET Core (.NET 10) con arquitectura limpia en cuatro proyectos y PostgreSQL, y una SPA en React + Vite + Tailwind.

Estándares del proyecto (nombres, carpetas, commits y ramas): [ESTANDARES.md](ESTANDARES.md).

## Sistema publicado

- Aplicación: **https://reserva-upla.vercel.app** (SPA en Vercel; `/api` se reenvía a la API).
- API: **https://reservaupla-api-c3bz.onrender.com** (Render, contenedor Docker; plan gratuito, se suspende por inactividad).
- Base de datos: **Supabase** (PostgreSQL 17), con RLS activo y el rol `reservaupla`.
- Administrador inicial: `ADMIN01`. La contraseña se define en las variables de Render y conviene cambiarla al entrar.
- Pasos, variables y comprobaciones: [docs/despliegue.md](docs/despliegue.md).

## Qué hace

| Código | Requisito | Dónde |
|---|---|---|
| RF-01 | Registrar usuarios solicitantes | Usuarios → Registrar usuario |
| RF-02 | Registrar ambientes universitarios | Ambientes → Registrar ambiente |
| RF-03 | Registrar solicitudes de reserva | Nueva reserva |
| RF-04 | Validar la disponibilidad antes de registrar | Panel «Disponibilidad del ambiente» del formulario; la API la vuelve a revisar |
| RF-05 | Listar reservas registradas | Reservas (búsqueda por código o solicitante y filtros por estado, ambiente y rango de fechas) |
| RF-06 | Consultar el detalle de una reserva, con su historial (quién hizo cada cambio y cuándo) | Clic en el código de una reserva |
| RF-07 | Cambiar el estado: Pendiente, Aprobada, Rechazada o Cancelada | Botones del detalle, con confirmación |
| RF-08 | Indicadores básicos en un dashboard | Panel principal (página de inicio), con el alcance del rol |

| Regla | Cómo se cumple |
|---|---|
| RN-01 Una sola reserva aprobada por ambiente, fecha y horario | El dominio revisa el cruce al registrar y al aprobar; la base lo garantiza con una restricción de exclusión |
| RN-02 Fecha, horas, ambiente, solicitante y motivo obligatorios | Validación en el formulario y en el dominio, con un error por campo |
| RN-03 Hora de fin mayor que la de inicio | Formulario, dominio y restricción CHECK |
| RN-04 Entre las 07:00 y las 22:00 | Formulario, dominio y restricción CHECK |
| RN-05 Solo el administrador aprueba o rechaza | Cada estado de la reserva lo comprueba (patrón State); la API responde 403 |
| RN-06 Una reserva rechazada no se modifica | El estado Rechazada no admite cambios; la API responde 409 |

**Inicio de sesión.** Cada usuario entra con su código (7 letras o dígitos, por ejemplo P00914K) y su contraseña (se guardan solo la sal y el hash PBKDF2). La sesión es una cookie HttpOnly: la API sabe por ella quién solicita y quién aprueba, y comprueba el rol en la base. No hay registro propio: las cuentas las crea el administrador con el código que entrega la universidad.

**Panel principal según el rol.** La página de inicio muestra lo que cada rol necesita (RF-12). El solicitante ve sus indicadores, sus próximas reservas, cómo avanza una reserva y los ambientes que puede pedir; el responsable de ambiente ve los indicadores de los ambientes a su cargo y la agenda de la semana (RF-13), de lunes a domingo entre las 07:00 y las 22:00, con las aprobadas en verde y las pendientes en ámbar: elige el ambiente, pasa de una semana a otra y abre el detalle desde un bloque. El administrador ve todos los indicadores, las pendientes por aprobar (primero las más próximas) y las reservas por ambiente. La API cuenta con el alcance del rol que lee de la base: nadie puede pedir por la API el panel de otro.

**Búsqueda en el listado.** Además de los filtros por estado, ambiente y fecha, el listado se busca por código (RES-2026-0001) o por el nombre de quien solicitó, y por un rango «Desde / Hasta» (RF-05). La búsqueda aplica cuando la persona deja de escribir, y todos los filtros quedan en la dirección (`?texto=…&fecha_desde=…`): se pueden compartir y «atrás» vuelve al filtro anterior. El solicitante abre el listado con «Solo mis reservas» y el responsable con «Solo los ambientes a mi cargo»; al desmarcar la casilla ven todas.

**Mi cuenta.** En «Mi cuenta» cada usuario ve sus datos —código, nombre, correo, rol y estado, que corrige el administrador—, cambia su contraseña escribiendo la actual y la nueva dos veces (la nueva cumple las mismas reglas y no puede ser la actual, RF-11) y enciende o apaga el sonido de los avisos (RF-14). Al cambiar la contraseña la sesión sigue abierta; el interruptor del sonido se guarda en ese navegador y empieza apagado.

**Avisos sin saltos.** El resultado de cada acción (registrar, aprobar, rechazar, cancelar) aparece en un aviso flotante abajo a la derecha, con el color del estado: verde, ámbar, rojo o gris, siempre con ícono y nombre. No mueve el contenido, se cierra a los 8 s (no mientras el puntero o el foco están encima) y lo anuncia el lector de pantalla; los errores y los avisos que piden hacer algo no se cierran solos. Los mensajes dentro de una tarjeta y la línea bajo cada campo tienen alto fijo, y el resumen de errores va junto al botón de enviar (RNF-04, RNF-05). Los avisos pueden sonar (RF-14): empieza apagado.

**Pantalla de ingreso.** Una sola foto del campus cubre toda la pantalla (`assets/campus/campus-login.webp`, tomada por el autor) y el formulario va a la derecha sobre un vidrio claro; alrededor del formulario el fondo se desenfoca para llevar la mirada al ingreso. Arriba a la izquierda van el logo de ReservaUPLA —grande, sin repetir el nombre— y la frase «Reserva laboratorios, auditorios y salas de la UPLA en un solo lugar.». No hay rotación de fotos ni botón de pausa: la foto queda quieta. En el teléfono el formulario se centra debajo del logo. El login no muestra el botón de tema: queda siempre en claro; el tema de la app se elige después de entrar.

**Diseño de la interfaz.** La aplicación sigue los 57 diseños del caso, agrupados por rol y estado en `imagenes/`: barra superior con la ruta de navegación, el tema y la sesión; barra lateral con la acción principal y el grupo de administración; una banda azul igual en todas las páginas, con el título, la descripción y la acción de la sección; panel principal por rol; listados con chips, filtros y estados vacíos; formularios con el error junto a su campo; detalle con la tarjeta de decisión según el rol y el estado de la reserva; y páginas de error (403, 404, 500, sin conexión, carga y sesión). El modo claro u oscuro se elige en la barra superior, se guarda en el navegador y se funde en 200 ms. Los cambios de sección, el título de la banda, la barra lateral y el ingreso o la salida tienen animaciones cortas, y se desactivan si el sistema pide reducir el movimiento. La barra lateral usa el logo de ReservaUPLA y, al contraerse, deja solo su icono.

## Requisitos

- .NET SDK 10, PostgreSQL 16 o superior (con la extensión `btree_gist`, que viene con PostgreSQL), Node 22 o superior y pnpm.

## Base de datos (PostgreSQL)

Base `reservaupla` y rol `reservaupla`. La clave del rol está en `~/.pgpass` y en los user-secrets de la API; **nunca en el código ni en este README**. Para crearla en otra máquina (fish):

```fish
# 1. Rol y base, con tu usuario de PostgreSQL
psql -d postgres -c "CREATE ROLE reservaupla LOGIN PASSWORD 'elija-una-clave';"
psql -d postgres -c "GRANT reservaupla TO $USER;"     # PostgreSQL 16+: para crear la base a su nombre
psql -d postgres -c "CREATE DATABASE reservaupla OWNER reservaupla;"

# 2. Cadena de conexión fuera del código
cd backend
dotnet user-secrets set "ConnectionStrings:ReservaUPLA" "Host=localhost;Port=5432;Database=reservaupla;Username=reservaupla;Password=elija-una-clave" --project src/ReservaUPLA.WebApi

# 3. Tablas usuarios, ambientes y reservas (migraciones de Entity Framework Core)
dotnet tool restore
env ASPNETCORE_ENVIRONMENT=Development dotnet ef database update --project src/ReservaUPLA.Infrastructure --startup-project src/ReservaUPLA.WebApi
```

`ASPNETCORE_ENVIRONMENT=Development` hace falta para que `dotnet ef` lea los user-secrets. Una migración nueva (`dotnet ef migrations add Nombre` con los mismos `--project` y `--startup-project`) se crea sola en `Migraciones/`, junto a las demás. Las tablas empiezan vacías: los usuarios, los ambientes y las reservas se registran desde la aplicación (o desde Swagger).

```fish
psql -h localhost -U reservaupla -d reservaupla     # la clave la toma de ~/.pgpass
```

```sql
\d reservas
SELECT codigo_reserva, fecha_reserva, hora_inicio_reserva, hora_fin_reserva, estado_reserva FROM reservas ORDER BY codigo_reserva;
\q
```

### Primer administrador y cuentas de prueba

Al arrancar, si no hay ningún administrador activo, la API crea el primero con los datos de la sección `PrimerAdministrador` de los secretos de usuario (nunca del repositorio). En desarrollo crea además una cuenta de prueba por rol, de la sección `CuentasDePrueba`, si no existen. Lo que hizo queda escrito en la consola de la API.

```fish
cd backend/src/ReservaUPLA.WebApi
dotnet user-secrets set "PrimerAdministrador:Codigo_Usuario" "ADMIN01"
dotnet user-secrets set "PrimerAdministrador:Nombre_Completo_Usuario" "Administrador UPLA"
dotnet user-secrets set "PrimerAdministrador:Correo_Usuario" "admin@upla.edu.pe"
dotnet user-secrets set "PrimerAdministrador:Contrasena_Usuario" "<una contraseña con mayúscula, minúscula y número>"
# Cuentas de prueba (solo desarrollo): un bloque por cuenta, con índice 0, 1…
dotnet user-secrets set "CuentasDePrueba:0:Codigo_Usuario" "SOLIC01"
dotnet user-secrets set "CuentasDePrueba:0:Nombre_Completo_Usuario" "Solicitante de Prueba"
dotnet user-secrets set "CuentasDePrueba:0:Correo_Usuario" "solicitante@upla.edu.pe"
dotnet user-secrets set "CuentasDePrueba:0:Rol_Usuario" "Solicitante"
dotnet user-secrets set "CuentasDePrueba:0:Contrasena_Usuario" "<contraseña>"
```

| Código | Correo | Rol |
|---|---|---|
| ADMIN01 | admin@upla.edu.pe | Administrador (es el primer administrador) |
| SOLIC01 | solicitante@upla.edu.pe | Solicitante |
| RESPO01 | responsable@upla.edu.pe | Responsable de ambiente (`ResponsableDeAmbiente`) |

Desde ahí, el administrador registra los demás usuarios, con su código, y los ambientes desde la aplicación.

## Cómo ejecutarlo

Dos terminales:

```fish
# 1. API (http://localhost:5320; Swagger en http://localhost:5320/swagger)
cd backend
dotnet run --project src/ReservaUPLA.WebApi --launch-profile http

# 2. SPA (http://localhost:5190)
cd frontend
pnpm install        # solo la primera vez
pnpm dev
```

Para abrirla desde un teléfono conectado a la misma red, use `pnpm dev --host` y entre a `http://<IP-de-la-PC>:5190` (la API no se expone: el teléfono solo habla con Vite, que reenvía `/api`). Si el equipo tiene cortafuegos, hay que permitir el puerto 5190 para la red local.

Para detenerlos, Ctrl+C en cada terminal. Para revisar el código: `pnpm lint` (oxlint) y `pnpm test` (Vitest) en `frontend/`; `dotnet build` y `dotnet test` (xUnit) en `backend/`.

## API

Todo endpoint, salvo los de `/api/autenticacion`, exige sesión: sin ella responde 401. Todas las respuestas exitosas tienen la forma `{ "success": true, "message": "…", "data": … }`. Los errores siguen el RFC 9457 (ProblemDetails) con `success: false`, `message` y, si son datos, `errors` por campo.

| Método | Ruta | Para qué | Respuestas |
|---|---|---|---|
| POST | `/api/autenticacion/ingreso` | RF-09: iniciar sesión con `codigo_usuario` y `contrasena_usuario` (deja la cookie) | 200, 400, 401 |
| GET | `/api/autenticacion/sesion` | ¿Hay sesión? (al abrir la SPA) | 200, 401 |
| POST | `/api/autenticacion/salida` | Cerrar sesión | 200 |
| POST | `/api/usuarios` | RF-01: el administrador registra un usuario de cualquier rol | 201, 400, 403 |
| GET | `/api/usuarios?rol_usuario=&activo_usuario=` | Lista de usuarios (administrador) | 200, 403 |
| POST | `/api/ambientes` | RF-02 registrar ambiente (administrador) | 201, 400, 403 |
| GET | `/api/ambientes?estado_ambiente=&id_responsable_ambiente=` | Lista de ambientes | 200 |
| POST | `/api/reservas` | RF-03 registrar reserva | 201, 400, 409 (RN-01) |
| GET | `/api/reservas/disponibilidad?id_ambiente=&fecha_reserva=&hora_inicio_reserva=&hora_fin_reserva=` | RF-04 disponibilidad | 200, 400, 404 |
| GET | `/api/reservas?estado_reserva=&id_ambiente=&fecha_reserva=&id_usuario=&id_responsable_ambiente=&texto=&fecha_desde=&fecha_hasta=` | RF-05 listado; `texto` busca por código o solicitante y `fecha_desde`/`fecha_hasta` acotan el rango | 200, 400 |
| GET | `/api/reservas/{id}` | RF-06 detalle con su historial (`historial_reserva`) | 200, 404 |
| PATCH | `/api/reservas/{id}/estado` | RF-07 cambiar estado | 200, 400, 403 (RN-05), 404, 409 (RN-01, RN-06) |
| GET | `/api/panel/indicadores` | RF-08 y RF-12: indicadores del panel principal según el rol de la sesión (antes `/api/dashboard/indicadores`) | 200 |
| PUT | `/api/cuenta/contrasena` | RF-11: cambiar la contraseña del usuario de la sesión con `contrasena_actual` y `contrasena_nueva` (400 si la actual no coincide o la nueva no cumple RN-13) | 200, 400 |

Para probarla: Swagger en http://localhost:5320/swagger. Primero ejecute `POST /api/autenticacion/ingreso` con un código y su contraseña: la cookie queda guardada y los demás endpoints ya responden. También `backend/src/ReservaUPLA.WebApi/ReservaUPLA.WebApi.http` en VS Code (extensión REST Client).

## Estructura

```
backend/src/
  ReservaUPLA.Domain/          Entidades/ (Usuario, Ambiente, Reserva), Comun/ (Horario, CodigoDeUsuario: objetos de
                               valor), Estados/ (patrón State y su fábrica, Factory), Enumeraciones/ y Excepciones/
  ReservaUPLA.Application/     CasosDeUso/ (…CasoDeUso con su …Comando), Datos/ (DatosDe…, DetalleDe…, ResumenDe…) e
                               Interfaces/ (IRepositorioDe…, IConsultaDe…, IProtectorDeContrasenas, IReloj)
  ReservaUPLA.Infrastructure/  Persistencia/ (ContextoDeReservaUPLA y Configuraciones/), Migraciones/, Repositorios/,
                               Consultas/ (módulo de salida) y Servicios/ con EF Core
  ReservaUPLA.WebApi/          Controladores/ (…Controlador), ManejadorDeErrores (RFC 9457), formato JSON, Swagger y
                               Arranque/ (primer administrador y cuentas de prueba)
backend/tests/
  ReservaUPLA.Pruebas/         Pruebas unitarias (xUnit) del dominio y de los casos de uso, con dobles en memoria
frontend/src/
  api/                         clienteApi.js y un archivo por recurso
  components/ui/               TextInput, SelectInput, DateInput, TimeInput, Button, AlertMessage,
                               ModalConfirmacion, TableList, CardIndicador y otros
  components/<módulo>/         Formularios y piezas de usuarios, ambientes, reservas y del panel principal
  components/autenticacion/    Marco del ingreso y panel «Agenda del campus» (sus reglas, con pruebas, en agendaDelCampus.js)
  assets/campus/               Fotos del panel del ingreso, a color y en azul (WebP de 1000 px de alto, sin metadatos)
  avisos/                      Avisos flotantes (patrón Observer): la central, su región y el aviso, con pruebas
  sonido/                      Sonido de los avisos (patrón Strategy) y su preferencia, con pruebas
  hooks/                       useFormulario, useConsulta, useDisponibilidad, useAviso, usePreferencias, useAgendaViva…
  reglas/                      Validaciones (las mismas del dominio), con sus pruebas *.test.js (Vitest)
  utils/                       Ayudas sin estado: normalizar texto, preferencias guardadas en el navegador
  paginas/, layouts/           Páginas de la SPA y su estructura común
```

Dependencias: Application → Domain; Infrastructure → Application y Domain; WebApi → Application e Infrastructure (esta última solo en `Program.cs`, para registrar los servicios).
