# Manual de estándares de ReservaUPLA

Reglas de construcción del proyecto: cómo se nombra, dónde va cada cosa y cómo se registra cada cambio en el repositorio. Se aplican en todo el código; si una regla cambia, se cambia aquí primero.

## 1. Nombres

| Elemento | Regla | Ejemplo |
|---|---|---|
| Atributos de las entidades | Nombre del dato + guion bajo + nombre de su entidad, sin abreviaturas | `Fecha_Reserva`, `Id_Ambiente`, `Correo_Usuario` |
| Columnas de la base | El mismo nombre del atributo, en minúsculas | `fecha_reserva`, `id_ambiente` |
| Campos del JSON | El mismo nombre del atributo, en minúsculas | `"fecha_reserva": "2026-11-10"` |
| Tablas | Plural, en minúsculas | `usuarios`, `ambientes`, `reservas` |
| Clases de C# | PascalCase, sustantivo; casos de uso con verbo + `UseCase` | `Reserva`, `RegistrarReservaUseCase` |
| Interfaces | `I` + nombre del rol | `IReservaRepository`, `IConsultaDeReservas` |
| Enumeraciones | Plural + guion bajo + entidad | `Estados_Reserva`, `Roles_Usuario` |
| Variables y parámetros de C# | snake_case, palabras completas | `id_ambiente`, `hora_inicio` |
| Campos privados de C# | `_` + snake_case | `_reserva_repository` |
| Componentes de React | PascalCase; los reutilizables con los nombres del caso | `TextInput`, `TableList`, `CardIndicador` |
| Funciones, hooks y variables de JavaScript | camelCase; los hooks empiezan con `use` | `useFormulario`, `listarReservas` |
| Archivos | Igual que lo que exportan | `Reserva.cs`, `TableList.jsx`, `reservasApi.js` |

**Idioma:** español en el dominio, los mensajes y la interfaz. Se conservan en inglés las palabras del marco de trabajo (`UseCase`, `Repository`, `Controller`, `Dto`) y los nombres de componentes que propone el caso práctico.

## 2. Carpetas

```
ReservaUPLA/
  backend/                    API .NET 10 — arquitectura limpia en 4 proyectos
    src/ReservaUPLA.Domain/          Entidades, enums, estados de la reserva, reglas y excepciones (no depende de nadie)
    src/ReservaUPLA.Application/     Casos de uso, DTOs, comandos e interfaces (depende de Domain)
    src/ReservaUPLA.Infrastructure/  PostgreSQL con EF Core: DbContext, mapeos, migraciones, repositorios, consultas
    src/ReservaUPLA.WebApi/          Controladores, manejo de errores, formato JSON y Swagger (punto de composición)
  frontend/                   SPA React + Vite + Tailwind
    src/api/                  Un archivo por recurso sobre clienteApi.js
    src/components/ui/        Componentes reutilizables (TextInput, SelectInput, DateInput, TimeInput, Button…)
    src/components/<módulo>/  Componentes de un módulo (reservas, ambientes, usuarios)
    src/hooks/                Estado y lógica reutilizable (useFormulario, useConsulta)
    src/reglas/               Validaciones del frontend, sin interfaz
    src/paginas/              Una página por ruta
    src/layouts/              Estructura común (menú, encabezado, pie)
```

**Dependencias permitidas:** Application → Domain; Infrastructure → Application y Domain; WebApi → Application e Infrastructure (esta última solo en `Program.cs`, para registrar los servicios). En el frontend, las páginas usan componentes y hooks; solo `src/api/` llama a la API.

## 3. Codificación

1. **Una clase o componente por archivo**, con un comentario arriba que dice su responsabilidad.
2. **Las reglas de negocio viven en el dominio.** El frontend repite las validaciones solo para avisar antes de enviar; la API es la que decide.
3. **Sin try/catch en los controladores:** los errores se convierten en respuestas HTTP en un solo lugar (`ManejadorDeErrores`).
4. **Formato:** `.editorconfig` en la raíz (UTF-8, LF, 4 espacios en C#, 2 en JavaScript). El frontend pasa `pnpm lint` (oxlint) sin avisos y el backend compila sin advertencias.
5. **Sin secretos en el repositorio:** la cadena de conexión va en los user-secrets de .NET.
6. **Respuestas de la API:** éxito `{ success, message, data }`; error en ProblemDetails (RFC 9457) con `success: false`, `message` y, si son datos, `errors` por campo.
7. **Interfaz:** etiquetas visibles, errores junto a su campo, foco visible, controles de 44 px de alto, contraste AA (WCAG 2.2) y modo oscuro por tokens de color.
8. **Diseño centrado en el usuario** (reglas de oro de Shneiderman y principios de Norman):
   - Los campos se agrupan en tarjetas numeradas (`GrupoDeCampos`), en el orden en que el usuario piensa la tarea.
   - El botón de enviar queda deshabilitado mientras falte un dato obligatorio o haya un impedimento, y dice qué falta.
   - Los mensajes dicen qué corregir con palabras del usuario: nunca códigos de reglas, nombres técnicos ni códigos de rastreo.
   - Toda acción tiene feedback (al pasar, al pulsar, mientras carga) y un final claro (confirmación o aviso de éxito).
   - Toda acción se puede revertir antes de confirmarla: Cancelar, Volver, confirmar antes de salir con datos sin guardar.
   - Los ejemplos van como ayuda bajo el campo, no como texto de ejemplo dentro de él.

## 4. Commits

Formato **Conventional Commits**, en español y en imperativo:

```
<tipo>(<ámbito>): <qué hace, en minúsculas y sin punto final>

<por qué, si no es obvio; requisitos que atiende (RF-03, RN-01)>
```

| Tipo | Cuándo |
|---|---|
| `feat` | Funcionalidad nueva (un requisito) |
| `fix` | Corrección de un error |
| `refactor` | Cambio de estructura que no cambia el comportamiento |
| `docs` | Solo documentación |
| `chore` | Configuración, dependencias, estructura |
| `style` | Formato, sin cambio de lógica |
| `test` | Pruebas |

Ámbitos: `usuarios`, `ambientes`, `reservas`, `dashboard`, `api`, `frontend`, `base-de-datos`. Ejemplo: `feat(reservas): validar disponibilidad antes de registrar (RF-04, RN-01)`.

## 5. Ramas

| Rama | Para qué | Nace de | Se une a |
|---|---|---|---|
| `main` | Versiones entregadas; siempre compila y funciona | — | — |
| `develop` | Integración del trabajo en curso | `main` | `main` al cerrar una versión |
| `feature/<requisito>-<descripción>` | Un requisito o grupo de requisitos | `develop` | `develop` |
| `refactor/<descripción>` | Reorganizar código sin cambiar su comportamiento | `develop` | `develop` |
| `fix/<descripción>` | Corregir un error | `develop` | `develop` |

Las uniones se hacen con `git merge --no-ff`, para que el historial muestre cada rama. Cada versión entregada lleva una etiqueta (`v1.0.0`).
