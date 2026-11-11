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

## Iteración 2, parte 2 · Nombres en español (09/11/2026, 21:49 a 22:00)

Ramas `refactor/regla-de-idioma` (primero la regla en `ESTANDARES.md`) y `refactor/nombres-en-espanol`. RNF-11. Sin
cambios de comportamiento, salvo la ruta del panel, que el SDD fija como `/api/panel/indicadores`.

| Tarea | Resultado |
|---|---|
| Línea base | Compilación sin advertencias, 25 pruebas xUnit, 22 Vitest, EF sin cambios pendientes y el documento OpenAPI guardado |
| Regla de idioma en `ESTANDARES.md` | Todo en español salvo los 9 componentes del caso y lo que impone el marco |
| Renombres por capa (dominio, aplicación, infraestructura, WebApi, interfaz), un commit cada uno | Cada etapa compila sin advertencias y pasa sus pruebas; EF sigue sin cambios y las 5 migraciones siguen aplicadas; una migración nueva se crea en `Migraciones/` |
| Pruebas del sistema | OpenAPI idéntico salvo nombres, ruta del panel y su grupo; 37 de 37 de punta a punta; el panel principal carga sus indicadores |
| ERS, SDD y diagramas | RNF-11 implementado; diagramas con los nombres reales del código |

| Defecto | Se introdujo en | Se encontró en | Corrección |
|---|---|---|---|
| El renombre de `DependencyInjection` también cambió `using Microsoft.Extensions.DependencyInjection` | Herramienta (script de renombres) | Compilación | Solo se renombra la declaración de la clase |
| La ruta nueva del panel iba en un commit y el frontend la usaba recién en el siguiente: el panel quedaba roto entre los dos | Integración | Revisión antes de seguir | El cambio del frontend entró en el mismo commit |
| El SDD y sus diagramas nombraban clases y métodos que el código no tiene (`DatosDeReserva`, `BuscarPorCodigo`, `CreacionDeCuentasDePrueba`) | Diseño (iteración 0) | Comparación de cada nombre del SDD con el código | Corregidos con los nombres reales |

**Retrospectiva.** Guardar el documento OpenAPI antes del refactor permitió probar que la API no cambió, más allá de
los nombres. Comparar automáticamente los nombres del SDD con los del código encontró errores de diseño que la lectura
no había visto.

## Iteración 3 · Historial, avisos sin saltos, semáforo y sonido (09/11/2026, 22:09 a 22:39)

Ramas `feature/rf-06-historial-de-la-reserva` y `feature/rnf-04-avisos-sin-saltos`. RF-06, RF-14 (sin el interruptor,
que llega con Mi cuenta en la iteración 4), RNF-04, RNF-05 y RNF-10 (Observer y Strategy).

| Tarea | Resultado |
|---|---|
| Pruebas del historial primero (rojo) | 4 del dominio (xUnit): 29 en total |
| Entidad Historial, tabla historiales y migración CrearHistoriales | Aplicada; cargó el historial de las 3 reservas existentes (el cambio anterior al historial, sin usuario) |
| Historial en el detalle (línea de tiempo) | Pruebas de los pasos primero; diseño AD08 |
| Pruebas de la central de avisos, las estrategias de sonido, la preferencia y los avisos de cada estado primero (rojo) | Vitest: 66 en total |
| Avisos flotantes (Observer) y sonido (Strategy) | Toda la aplicación; el sonido empieza apagado |
| Tarjeta de la decisión de alto fijo con semáforo y cruce visible; formularios con una línea por campo y resumen junto al botón; error del ingreso bajo «Ingresar»; fila «Nuevo» | Diseños AD08, AD09, AD17, S05 y AC03 |
| Pruebas del sistema | 44 de 44 de punta a punta (7 nuevas); verificación propia de los avisos, 18 de 18; cada commit compila y pasa sus pruebas solo |

| Defecto | Se introdujo en | Se encontró en | Corrección |
|---|---|---|---|
| EF nombró un índice `IX_historiales_id_usuario`, en mayúsculas, distinto de los demás | Código (herramienta) | Revisión de la migración generada | Nombre explícito y migración regenerada |
| La prueba de aprobar usaba una reserva ya aprobada: el historial de un cambio real no quedaba probado | Pruebas | Revisión del resultado de las pruebas del sistema | Prueba propia: registrar, cancelar y leer el historial |
| Al llegar otro aviso, el plazo de 8 s de los anteriores volvía a empezar | Código | Revisión del código | La función de cerrar es la misma en cada dibujo |
| El mensaje de llegada al ingreso («Cerró su sesión») desaparecía al mostrarse un error y movía la tarjeta | Código (v1.0.0) | Revisión del código | El mensaje de llegada se queda |
| La tarjeta de la decisión medía 180 y 116 px en vez de 112: texto del cruce largo y columna angosta | Diseño | Verificación de los avisos | Texto propio y corto del cruce; columna de 24rem, como AD09 |
| Las reservas de prueba consumían números de la secuencia: la próxima real habría sido RES-2026-0024 | Pruebas | Revisión de los datos después de probar | La limpieza devuelve la secuencia al último código |

La prueba de `situacionDeLaReserva` se escribió junto con su código, sin verla fallar antes; sus cambios posteriores sí
siguieron el orden (rojo y verde).

**Retrospectiva.** Revisar qué ejercitó de verdad cada prueba del sistema, y no solo si pasó, mostró una prueba que se
saltaba lo nuevo. Medir los altos en el navegador encontró lo que la revisión del diseño dejaba pasar: el texto cabe o no
según el ancho real.

## Iteración 4 · Mi cuenta, búsqueda y panel según el rol (09-10/11/2026, 22:58 a 23:30)

Ramas `feature/rf-11-mi-cuenta` (merge `838ad00`), `feature/rf-05-busqueda-en-reservas` (merge `c55df84`) y
`feature/rf-12-panel-por-rol` (merge `32018b4`, al final de la iteración). RF-05, RF-08, RF-11, RF-12, RF-13 y RF-14
(con el interruptor, que en la iteración 3 había quedado pendiente).

| Tarea | Resultado |
|---|---|
| Pruebas de `revisarErrores` y de las reglas de la cuenta primero (rojo) | Vitest; el error de la API se mantiene hasta que cambia el campo |
| `Usuario.CambiarContrasena`, `CambiarContrasenaCasoDeUso` y `PUT /api/cuenta/contrasena` (actual correcta, RN-13 y distinta de la actual) | 39 pruebas xUnit |
| Pantalla Mi cuenta (diseños S15 y S16): sus datos, el cambio de contraseña y el interruptor del sonido, con el enlace en el panel de la sesión | `MiCuenta.jsx`, `Interruptor.jsx` y `cuentaApi.js`; el reproductor lee la preferencia en cada aviso |
| Búsqueda del listado (RF-05): `texto` por código o solicitante, `fecha_desde` y `fecha_hasta` en `GET /api/reservas`, con `%` y `_` escapados | Buscador con espera y «Desde / Hasta» en `FiltrosDeReservas`; los filtros viven en la dirección |
| Panel según el rol (RF-12 y RF-13): `AlcanceDeIndicadores` y `ObtenerIndicadoresDelPanelCasoDeUso`; paneles del solicitante y del administrador, y el del responsable con la agenda de la semana | 92 pruebas Vitest; los tres paneles se dibujan; «Dashboard» pasa a «Panel principal» en toda la interfaz |
| Pruebas del sistema | 48 de 48 de punta a punta (`pruebas.py`, con la búsqueda y los textos nuevos); verificaciones propias: Mi cuenta 14 de 14 (con un usuario temporal, borrado) y paneles por rol 18 de 18 |
| Unión a develop | `git merge --no-ff` de las tres ramas; la última, `32018b4` |

| Defecto | Se introdujo en | Se encontró en | Corrección |
|---|---|---|---|
| El error que devolvía la API se borraba al pasar el foco a otro campo: al enviar con Enter se veía un instante y desaparecía | Código (iteración 1) | Prueba de Mi cuenta | `revisarErrores` guarda el valor que tenía el campo cuando la API lo rechazó y mantiene el mensaje hasta que ese campo cambia; con pruebas |
| El contenido quedaba topado a 1152 px: en 1920 sobraban 248 px por lado y en 2560, 568; los indicadores no aprovechaban el ancho y «Reservas por ambiente» desbordaba la tarjeta en 1024 y 1440 | Maqueta (iteración 4) | Revisión visual del alumno, 10/11 | Se quitó el tope; el contenido usa todo el ancho con 28 px de margen. Indicadores en una fila desde `2xl`; rejilla proporcional en «Reservas por ambiente», con la cifra sola y el detalle para el lector de pantalla; filtros del listado en una fila desde `xl`. Sin desborde de 390 a 2560 px |

Los comandos de zsh mal escritos durante las pruebas no son defecto del producto: el error estaba en la orden, no en el
sistema, y no se anotan como tales.

**Retrospectiva.** Escribir primero la prueba del error que se borraba dejó claro qué debía pasar: un mensaje del
servidor no lo puede decidir la regla del navegador, que no conoce ese dato. Separar lo que falla en el producto de lo
que falla al escribir un comando evita anotar defectos falsos y buscar en el código lo que estaba en la terminal. Unir
la rama del panel al final, con las otras dos ya integradas, hizo que las pruebas del sistema corrieran sobre el código
completo y no sobre una parte.

## Iteración 5 · Diseño del caso por partes (10/11/2026, 08:22 a 15:30)

Ramas `feature/diseno-barra-superior` (merge `fb5fdca`), `feature/diseno-banda-e-indicadores` (`1e2c508`),
`feature/diseno-telefono` (`77a7737`), `feature/diseno-disponibilidad-al-costado` (`af55c7a`),
`feature/diseno-detalles` (`d4bb0a4`), `feature/diseno-agenda` (`bbc98db`), `feature/diseno-listados` (`65813ff`) y
`feature/diseno-formularios-errores` (`992ecae`). Cierra el diseño de los 57 PNG por rol y estado y las brechas 1 a 33
de la revisión (secciones 4p y 4q del CONTEXTO). No cambia el alcance funcional: ajusta la interfaz a los diseños.

| Tarea | Resultado |
|---|---|
| Revisión de los 57 PNG y plan por partes (5.1 a 5.9) | Brechas numeradas y una rama, un commit y un merge `--no-ff` por parte |
| 5.1 Barra superior, chip de usuario y barra lateral | Migas deducidas de la ruta, tema, sesión, botón dorado, grupo de administración y menú contraíble |
| 5.2–5.3 Banda, indicadores, teléfono | Banda con rejilla y acción blanca; seis indicadores en una fila; dos columnas y botón flotante en el teléfono |
| 5.4 Disponibilidad al costado | Tarjeta de 24 rem con línea de tiempo del día; formulario a dos columnas |
| 5.5–5.6 Detalles y agenda | Íconos, chevrons, asteriscos, ojo, avatar, fichas y conteo de errores; agenda con siete días y 07:00–22:00 (RN-04) |
| 5.7 Listados | Chips con conteo, filtros, acción «Ver», fila que abre el detalle y estados vacíos |
| 5.8 Formularios, errores y modo oscuro | Grupos numerados, tarjeta de decisión por rol y estado, C01–C08, paleta oscura y azul de acción `#0b74c4` |
| Pruebas | Oxlint limpio, 97 Vitest (5 nuevas de las migas), 39 xUnit, `pnpm build` y 81 de 81 de punta a punta |
| Cierre documental (5.9) | ERS y SDD 0100 con fecha 10/11/2026, figuras desde `imagenes/`, README y este registro |

| Defecto | Se introdujo en | Se encontró en | Corrección |
|---|---|---|---|
| `/reservas/nuevas` mostraba «Reserva no encontrada» (C03) en vez de «Página no encontrada» (C02): la ruta `reservas/:idReserva` capturaba cualquier texto | Código (ruta) | Captura de C02 | El detalle exige un UUID; la miga y la página dicen «Página no encontrada» |
| Con los indicadores caídos, el panel seguía mostrando secciones a medias (C04) | Código (panel) | Captura de C04 | Encabezado y aviso solos, con «Reintentar» |
| El modo oscuro usaba fondo `#0c1626`, superficie `#13233a` y botón `#0063a8`, distintos de los PNG (`#070f1e`, `#16294a`, `#0b74c4`) | Diseño (tokens) | Comparación de colores con los diseños | Tokens medidos y aplicados a barra lateral, banda, botón claro y acciones |
| «Limpiar filtros» tenía texto azul oscuro sobre fondo azul en modo oscuro (1,9:1) | Código (tokens) | Revisión de contraste | `text-enlace`, que se aclara en oscuro |
| Las pruebas de punta a punta medían la barra lateral con `.bg-marca-900`, que pasó a `.bg-lateral` | Pruebas | Pruebas del sistema | Selector actualizado |
| La prueba de «la reserva queda a nombre de quien inició sesión» leía el grupo «¿Quién la solicita?», que se quitó porque no está en S03 | Pruebas | Pruebas del sistema | La prueba lee la descripción de la página |
| El historial mostraba fecha y hora; AD06 y S11 piden la fecha larga y, si sigue pendiente, solo «Estado actual» | Código (historial) | Comparación con AD06 | `formatearFechaDeMomento` y el caso pendiente |
| La página de error C06 medía 448 px y el título 24 px; el diseño pide 560 px, 30 px y pantalla completa | Código (C06) | Captura de C06 | Tarjeta de 35 rem, título de 30 px y botones del sistema |
| El «Volver a reservas» del detalle en error iba con borde; C03 lo pide relleno | Código (detalle) | Captura de C03 | Variante principal solo en el error |

**Retrospectiva.** Comparar píxel a píxel los colores del PNG encontró diferencias que la vista no notaba. Las pruebas
de punta a punta volvieron a avisar de selectores y textos que el rediseño cambió: conviene ejecutarlas al cerrar cada
parte, no al final. Dividir el diseño en ocho partes mantuvo cada cambio revisable y dejó el historial de git legible.

**Ajustes del alumno (10/11/2026, tarde).** Las tarjetas y los campos se veían planos: se agregaron sombras
(`shadow-tarjeta`, `shadow-tarjeta-alta` y `shadow-campo`) a formularios, tablas, paneles, indicadores, Mi cuenta,
ingreso y errores. En oscuro se probó el blanco: solo blanco apenas separa la tarjeta del fondo, así que se dejó un
borde de luz interior con halo negro. Se quitó «Los campos con * son obligatorios.» de los tres formularios
(no está en S03, AD13 ni AD16) y, al hacerlo, la tarjeta «Disponibilidad» quedó alineada con el primer grupo del
formulario de reserva (0 px de diferencia a 1440). Verificado con 97 Vitest y 81 de 81 de punta a punta.

**Banda de sección, animaciones y filtros (10/11/2026, tarde).** La banda azul pasó del panel al layout y ahora es la
misma en todas las páginas; las acciones principales van dentro y el título se borra y se escribe al cambiar de
sección (70 + 120 ms). El contenido entra con un fade de 180 ms, la barra lateral cambia de ancho en 200 ms y el
ingreso y la salida se desvanecen en 160 ms, todo con respeto por «menos movimiento». La barra superior tiene una
sombra propia (`shadow-barra`). En Reservas, «Limpiar filtros» es un botón alineado con los campos y el chip «Solo mis
reservas» quedó como interruptor siempre visible: antes desaparecía al pulsarlo y no había forma de volver, salvo
cambiar de pestaña. Verificado con oxlint limpio, 97 Vitest, `pnpm build` y 81 de 81 de punta a punta.

**Animación del tema, menú AD02 y logo (10/11/2026, noche).** El cambio de tema se funde en 200 ms mediante una
clase temporal en `<html>`, sin animar imágenes ni el fuego. La llama de fondo pasó a todas las secciones. En oscuro
se marcó más el borde de luz blanco de tarjetas y campos. El menú de usuario sigue AD02: nombre y código · correo,
«Mi cuenta», «Cambiar contraseña» (con foco en el campo actual) y «Cerrar sesión» en rojo; los iconos se extrajeron de
Penpot. La barra lateral usa el logo nuevo de ReservaUPLA, sin repetir el nombre en texto, y al contraerse muestra solo
su icono; el ingreso conserva el logo UPLA hasta el rediseño del login. Verificado con oxlint limpio, 97 Vitest,
`pnpm build` y 81 de 81 de punta a punta.

**Penpot (10/11/2026, noche).** Se sincronizó el archivo de diseño con el sistema, sin tocar el login: logo nuevo
en 48 barras laterales, 39 encabezados convertidos en banda, 20 acciones dentro de la banda, fuego al 8 % en 54
tableros y una página «08 Cambios del sistema» con las animaciones, las sombras y el fuego. Se guardaron tres versiones
y la validación del archivo no reporta errores. El menú AD02 ya estaba correcto y sirvió de fuente
para los iconos del sistema.

**Login a pantalla completa (10/11/2026, noche).** Se rehízo `MarcoDeAcceso`: una sola foto del campus cubre el fondo,
el logo de ReservaUPLA va grande y la frase elegida debajo; el formulario queda a la derecha en vidrio oscuro, con
desenfoque radial alrededor y sin tarjeta blanca. Se quitó la rotación de fotos y «Pausar animación». Los campos y
avisos usan tokens locales (`.login-oscuro`) para leerse sobre la foto. Se actualizó la prueba del botón deshabilitado
y se verificó con 97 Vitest, `pnpm build` y 81 de 81 de punta a punta.
