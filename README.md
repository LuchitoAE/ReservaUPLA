# ReservaUPLA — reservas de ambientes universitarios

Caso práctico de Construcción de Software (UPLA). Aplicación web para registrar, validar, consultar y visualizar reservas de laboratorios, auditorios y salas: API en ASP.NET Core (.NET 10) con arquitectura limpia en cuatro proyectos y PostgreSQL, y una SPA en React + Vite + Tailwind.

Estándares del proyecto (nombres, carpetas, commits y ramas): [ESTANDARES.md](ESTANDARES.md).

## Qué hace

| Código | Requisito | Dónde |
|---|---|---|
| RF-01 | Registrar usuarios solicitantes | Usuarios → Registrar usuario |
| RF-02 | Registrar ambientes universitarios | Ambientes → Registrar ambiente |
| RF-03 | Registrar solicitudes de reserva | Nueva reserva |
| RF-04 | Validar la disponibilidad antes de registrar | Panel «Disponibilidad del ambiente» del formulario; la API la vuelve a revisar |
| RF-05 | Listar reservas registradas | Reservas (filtros por estado, ambiente y fecha) |
| RF-06 | Consultar el detalle de una reserva | Clic en el código de una reserva |
| RF-07 | Cambiar el estado: Pendiente, Aprobada, Rechazada o Cancelada | Botones del detalle, con confirmación |
| RF-08 | Indicadores básicos en un dashboard | Dashboard (página de inicio) |

| Regla | Cómo se cumple |
|---|---|
| RN-01 Una sola reserva aprobada por ambiente, fecha y horario | El dominio revisa el cruce al registrar y al aprobar; la base lo garantiza con una restricción de exclusión |
| RN-02 Fecha, horas, ambiente, solicitante y motivo obligatorios | Validación en el formulario y en el dominio, con un error por campo |
| RN-03 Hora de fin mayor que la de inicio | Formulario, dominio y restricción CHECK |
| RN-04 Entre las 07:00 y las 22:00 | Formulario, dominio y restricción CHECK |
| RN-05 Solo el administrador aprueba o rechaza | Cada estado de la reserva lo comprueba (patrón State); la API responde 403 |
| RN-06 Una reserva rechazada no se modifica | El estado Rechazada no admite cambios; la API responde 409 |

**Inicio de sesión.** Cada usuario entra con su código (7 letras o dígitos, por ejemplo P00914K) y su contraseña (se guardan solo la sal y el hash PBKDF2). La sesión es una cookie HttpOnly: la API sabe por ella quién solicita y quién aprueba, y comprueba el rol en la base. No hay registro propio: las cuentas las crea el administrador con el código que entrega la universidad.

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

`ASPNETCORE_ENVIRONMENT=Development` hace falta para que `dotnet ef` lea los user-secrets. Las tablas empiezan vacías: los usuarios, los ambientes y las reservas se registran desde la aplicación (o desde Swagger).

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
| GET | `/api/reservas?estado_reserva=&id_ambiente=&fecha_reserva=&id_usuario=&id_responsable_ambiente=` | RF-05 listado | 200 |
| GET | `/api/reservas/{id}` | RF-06 detalle | 200, 404 |
| PATCH | `/api/reservas/{id}/estado` | RF-07 cambiar estado | 200, 400, 403 (RN-05), 404, 409 (RN-01, RN-06) |
| GET | `/api/dashboard/indicadores` | RF-08 indicadores | 200 |

Para probarla: Swagger en http://localhost:5320/swagger. Primero ejecute `POST /api/autenticacion/ingreso` con un código y su contraseña: la cookie queda guardada y los demás endpoints ya responden. También `backend/src/ReservaUPLA.WebApi/ReservaUPLA.WebApi.http` en VS Code (extensión REST Client).

## Estructura

```
backend/src/
  ReservaUPLA.Domain/          Usuario, Ambiente, Reserva; Horario y CodigoDeUsuario (objetos de valor); estados de la reserva
                               (patrón State) y su fábrica (Factory); reglas y excepciones de negocio
  ReservaUPLA.Application/     Casos de uso (registrar, disponibilidad, cambiar estado), DTOs de entrada y salida,
                               interfaces de repositorios, consultas y reloj
  ReservaUPLA.Infrastructure/  DbContext, mapeos, migraciones, repositorios y consultas (módulo de salida) con EF Core
  ReservaUPLA.WebApi/          Controladores, ManejadorDeErrores (RFC 9457), formato JSON, Swagger y el arranque
                               (primer administrador y cuentas de prueba)
backend/tests/
  ReservaUPLA.Pruebas/         Pruebas unitarias (xUnit) del dominio y de los casos de uso, con dobles en memoria
frontend/src/
  api/                         clienteApi.js y un archivo por recurso
  components/ui/               TextInput, SelectInput, DateInput, TimeInput, Button, AlertMessage,
                               ModalConfirmacion, TableList, CardIndicador y otros
  components/<módulo>/         Formularios y piezas de usuarios, ambientes, reservas y dashboard
  hooks/                       useFormulario, useConsulta, useDisponibilidad, useUsuarioActual…
  reglas/                      Validaciones (las mismas del dominio), con sus pruebas *.test.js (Vitest)
  paginas/, layouts/           Páginas de la SPA y su estructura común
```

Dependencias: Application → Domain; Infrastructure → Application y Domain; WebApi → Application e Infrastructure (esta última solo en `Program.cs`, para registrar los servicios).
