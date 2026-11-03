# ReservaUPLA — reservas de ambientes universitarios

Caso práctico de Construcción de Software (UPLA). Aplicación web para registrar, validar, consultar y visualizar reservas de laboratorios, auditorios y salas: API en ASP.NET Core (.NET 10) con arquitectura limpia en cuatro proyectos y PostgreSQL, y una SPA en React + Vite + Tailwind.

Estándares del proyecto (nombres, carpetas, commits y ramas): [ESTANDARES.md](ESTANDARES.md).

## Requisitos

- .NET SDK 10, PostgreSQL 16 o superior, Node 22 o superior y pnpm.

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

# 3. Tablas (migraciones de Entity Framework Core)
dotnet tool restore
env ASPNETCORE_ENVIRONMENT=Development dotnet ef database update --project src/ReservaUPLA.Infrastructure --startup-project src/ReservaUPLA.WebApi
```

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

Para detenerlos, Ctrl+C en cada terminal.
