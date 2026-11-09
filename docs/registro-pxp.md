# Registro PXP de ReservaUPLA

Metodología individual: Personal Extreme Programming (Dzhurov, Krasteva e Ilieva, 2009). Cada iteración pasa por
inicio, diseño, implementación (pruebas unitarias, código y refactorización), pruebas del sistema y retrospectiva, y
registra su tiempo y sus defectos. Documentos de la iteración 0: ERS y SDD 0100 (fuera del repositorio, en
`Analisis/` del caso).

## Iteración 0 · Requisitos y planificación (09/11/2026)

ERS y SDD 0100, diagramas, plan de iteraciones y lista de tareas de la prueba con usuarios. El tiempo no se registró
por tarea.

| Defecto | Se introdujo en | Se encontró en | Corrección |
|---|---|---|---|
| La plantilla cortaba los textos largos de las fichas | Plantilla | Revisión del PDF | Filas con alto mínimo |
| La ERS marcaba como implementados el historial y la búsqueda, y como pendiente el filtro por rol | Requisitos | Verificación contra el código | Estados corregidos |
| Diagramas con flechas cruzadas y nombres que no eran los del código | Diseño | Revisión de las imágenes | Diagramas rehechos |

## Iteración 1 · Acceso con código (09/11/2026, 17:09 a 17:21)

Rama `feature/rf-09-ingreso-con-codigo`. RF-01, RF-09, RF-15, RN-07, RN-14, RNF-20 y RNF-22.

| Tarea | Resultado |
|---|---|
| Pruebas unitarias primero (rojo) | 25 del backend (xUnit) y 7 del frontend (Vitest) |
| Código de usuario, ingreso por código, sin registro propio | Pruebas en verde |
| Primer administrador y cuentas de prueba al arrancar | Pruebas en verde; la API creó SOLIC01 y RESPO01 |
| Migración AgregarCodigoUsuario y códigos de las cuentas locales | Aplicada sin perder datos |
| Pruebas del sistema (37 de punta a punta, navegador y Swagger) | 37 de 37 |

| Defecto | Se introdujo en | Se encontró en | Corrección |
|---|---|---|---|
| La migración generada ponía un código vacío a todos; el índice único habría fallado | Código (herramienta) | Revisión antes de aplicarla | Columna nula, código provisional, luego obligatoria |
| Mensajes del arranque: «Cuenta… creado» y «ya existía» para cualquier administrador | Código | Lectura de la consola | Redacción corregida |
| La limpieza de las pruebas de punta a punta comparaba de más | Pruebas | Pruebas del sistema | Comparación corregida |
| El análisis del 05/11 decía quitar ProveedorDeSesion y useUsuarioActual, que manejan toda la sesión | Análisis | Lectura del código | Solo se quitó «crear cuenta» |

**Retrospectiva.** Revisar siempre lo que generan las herramientas (la migración) antes de aplicarlo. Escribir las
pruebas antes del código detectó a tiempo dónde se usaba cada pieza que cambiaba.
