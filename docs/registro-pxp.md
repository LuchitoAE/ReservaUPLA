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

## Iteración 2, parte 1 · Panel propio del ingreso (09/11/2026, 20:34 a 20:53)

Rama `feature/rnf-06-panel-del-ingreso`. RNF-06 y RNF-07. El plan cambió el mismo día: el panel estaba en la
iteración 5, pero la tarea T18 de la prueba con usuarios (al terminar la iteración 4) lo necesita. Por eso va antes
de los nombres en español, que son la parte 2 de esta iteración.

| Tarea | Resultado |
|---|---|
| Fotos del alumno para la web (WebP, en azul y a color, sin metadatos) | De 45 a 230 KB cada una; dos por visita |
| Pruebas unitarias primero (rojo) | 15 del frontend (Vitest) para las reglas de la agenda |
| Reglas de la agenda y panel «Agenda del campus» | Pruebas en verde (22 en total); foto de la intranet retirada |
| Pruebas del sistema | 37 de 37 de punta a punta; panel revisado en 1024, 1280, 1440 y 1920 px y en el teléfono, en claro y en oscuro; pausa, pestaña oculta y menos movimiento |

| Defecto | Se introdujo en | Se encontró en | Corrección |
|---|---|---|---|
| Las fotos pesaban hasta 870 KB por visita | Diseño (tamaño) | Revisión de los archivos | 1000 px de alto y calidad 55 |
| El texto perdió el margen de 10 px de la rejilla y no coincidía con los bloques (logo en x = 46 y no en 56) | Código | Captura de la prueba del sistema | Sin relleno propio en el escritorio |
| Con la foto 2, el título quedaba a 8 px de un bloque a color | Código | Captura en modo oscuro | Letra algo menor según el ancho |
| En el teléfono, el botón de tema tapaba la esquina de la tarjeta (venía de la v1.0.0) | Código | Captura del teléfono | La tarjeta empieza debajo del botón |
| El borrado de la foto de la intranet se fue en el commit del refactor: dos commits no compilaban solos | Integración | Compilación de cada commit | Commits rehechos, cada uno con sus archivos |
| El botón de tema no respondía: Vite servía una versión a medias de useTema tras tres ediciones seguidas | Herramienta (servidor de desarrollo) | Prueba de punta a punta | Reiniciar Vite; el código estaba bien |

**Retrospectiva.** Compilar cada commit por separado encontró un error que la rama completa ocultaba. Las pruebas de
punta a punta detectaron un fallo que no era del código: después de varias ediciones seguidas, reiniciar el servidor
de desarrollo antes de las pruebas del sistema.
