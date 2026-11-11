# Despliegue de ReservaUPLA

La versión publicada usa tres servicios gratuitos: **Vercel** sirve la SPA, **Render** ejecuta la API de .NET en un
contenedor y **Supabase** aloja la base PostgreSQL. El navegador ve un solo origen (`https://reserva-upla.vercel.app`):
Vercel reenvía `/api/*` a Render, así la cookie de sesión sigue siendo de primera parte y no hace falta CORS.

```
Navegador → Vercel (SPA + rewrite /api) → Render (API .NET) → Supabase (PostgreSQL)
```

## 1. Supabase

- Proyecto `c-practo-u3` (ref `zcwjnlpqbjkynvkgxdse`, región `us-east-2`).
- Rol de la aplicación: `reservaupla` (login propio, sin superusuario) con `USAGE, CREATE` en `public`.
- Esquema: las 7 migraciones de Entity Framework ya están aplicadas y `__EFMigrationsHistory` las registra.
- Extensión `btree_gist` creada en `public` (la necesita la restricción de exclusión de RN-01).
- RLS activado en `usuarios`, `ambientes`, `reservas` e `historiales`, sin políticas: la API entra como dueña de las
  tablas y PostgREST no puede leer nada con la clave anónima.
- Cadena de conexión (pooler de sesión, IPv4): `Host=aws-0-<región>.pooler.supabase.com;Port=5432;Database=postgres;
  Username=reservaupla.<ref>;Password=<secreto>;SSL Mode=Require`.

Para volver a aplicar el esquema desde cero:

```bash
dotnet ef migrations script --idempotent --project src/ReservaUPLA.Infrastructure \
  --startup-project src/ReservaUPLA.WebApi -o esquema.sql
psql "$CADENA_DE_SUPABASE" -v ON_ERROR_STOP=1 -f esquema.sql
```

## 2. Render (API)

- Servicio `reservaupla-api` (Docker, plan gratuito, región `ohio`), rama `develop`, directorio raíz `backend`,
  Dockerfile `./Dockerfile`. Se redespliega solo con cada push a `develop`.
- URL: `https://reservaupla-api-c3bz.onrender.com`.
- Variables de entorno:

| Variable | Valor |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | `true` |
| `ConnectionStrings__ReservaUPLA` | cadena del pooler de Supabase |
| `PrimerAdministrador__CodigoUsuario` | `ADMIN01` |
| `PrimerAdministrador__NombreCompletoUsuario` | nombre del administrador |
| `PrimerAdministrador__CorreoUsuario` | correo del administrador |
| `PrimerAdministrador__RolUsuario` | `Administrador` |
| `PrimerAdministrador__ContrasenaUsuario` | contraseña inicial (RN-13) |

La cuenta de prueba por rol (`CuentasDePrueba`) solo se crea en `Development`; en producción no existe.

## 3. Vercel (SPA)

- Proyecto `reserva-upla`, repositorio `LuchitoAE/ReservaUPLA`, rama de producción `main`, directorio raíz
  `frontend`, framework Vite (`pnpm install` y `pnpm build` → `dist`). URL: `https://reserva-upla.vercel.app`.
- `frontend/vercel.json` reenvía `/api/:ruta*` a la API de Render y manda el resto a `index.html` (rutas del SPA).
- El proyecto estaba creado desde el panel; se configuró por API (`rootDirectory: frontend`, framework `vite`) y se
  desplegó a producción desde `main`.

## 4. Comprobaciones

```bash
curl -i https://reservaupla-api-c3bz.onrender.com/api/ambientes   # 401 sin sesión
curl -s https://reserva-upla.vercel.app/ | head                    # SPA
curl -s -o /dev/null -w "%{http_code}\n" https://reserva-upla.vercel.app/api/ambientes   # 401 a través del proxy
```

El plan gratuito de Render suspende la API tras unos minutos sin uso: la primera petición puede tardar cerca de un
minuto. Las credenciales y claves viven en el panel de cada servicio, nunca en el repositorio.
