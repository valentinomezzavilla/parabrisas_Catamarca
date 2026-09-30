# Rediseño del panel: más profesional y de marca, y cómodo en celular y tablet

Fecha: 2026-09-30

## Contexto y decisión de proceso

El usuario pidió "mejorar el diseño del panel/app" y, de las prioridades posibles, eligió dos: **que se vea más profesional y de marca** y **uso en celular o tablet**. Después avisó que debía irse y pidió que se hicieran todas las modificaciones **sin consultarle**. Por eso las decisiones de diseño de este documento las tomó el implementador; quedan acá escritas para poder revisarlas o revertirlas.

Reglas que se autoimpuso el implementador: trabajar en la rama `feature/rediseno`, sin tocar `main` y sin pushear; no cambiar lógica de negocio ni rutas; verificar con capturas en escritorio y en un marco de 390 px; mantener la identidad (amarillo `#FDDD3D` + grafito) y el contraste documentado en `docs/ARQUITECTURA.md`.

## Diagnóstico (capturas del 30/09/2026)

- Escritorio: correcto pero sobrio y genérico. Las tarjetas de resumen, tablas y formularios casi no se distinguen entre sí; el encabezado de página y las acciones principales tienen poca jerarquía; hay mucho espacio vacío.
- Celular: la barra lateral pasa a ser un menú horizontal con scroll que corta los ítems; el usuario y "Salir" ocupan una fila aparte; los filtros de Stock ocupan toda la pantalla antes de los resultados; la tabla de stock obliga a hacer scroll horizontal; las tarjetas de resumen se apilan grandes.
- Tablet (768–1023 px): la barra lateral de 15 rem le quita ancho al contenido.
- El tema oscuro/claro sigue al sistema operativo. No se cambia (no fue una prioridad elegida), pero ambos temas deben verse bien.

## Dirección visual: "taller premium"

Se conserva la paleta y las tipografías (Montserrat para títulos, Inter para el cuerpo). Se le da más personalidad de marca con pocos recursos coherentes:

1. **Acento amarillo como firma**: barra amarilla corta junto al título de cada página, indicador amarillo lateral en el ítem activo del menú, franja superior amarilla en las tarjetas de resumen, botón primario con un halo amarillo suave.
2. **Tarjetas con profundidad**: borde + sombra sutil (en oscuro, un realce de 1 px en el borde superior) en lugar de recuadros planos.
3. **Iconos con "chip"**: cada tarjeta de resumen y cada estado vacío lleva un icono dentro de un cuadrito tintado.
4. **Jerarquía tipográfica**: títulos de página más grandes con el apoyo de la etiqueta de sección; números de resumen en Montserrat extra-bold; etiquetas pequeñas en mayúsculas para columnas.
5. **Menú lateral agrupado**: grupos "Operación" (Panel, Turnos, Stock) y "Gestión" (Servicios, Usuarios, Administración), logo más grande y bloque de usuario con inicial.
6. **Fondo con carácter**: en oscuro, un degradado radial amarillo muy tenue arriba a la derecha; en claro, fondo grafito-50 liso.

Restricción de contraste: el amarillo nunca se usa como texto sobre fondo claro (1.35:1); el texto sobre amarillo es siempre grafito.

## Celular (< 768 px)

- **Barra superior compacta** (logo, nombre de la sección y avatar del usuario) y **barra inferior fija** con los accesos principales: Panel, Turnos, Stock y "Más". "Más" abre una hoja con Servicios, Usuarios y Administración (solo Admin), Página pública de turnos y Salir. Áreas táctiles de al menos 44 px y `padding-bottom` para el área segura de iOS.
- **Stock**: la lista pasa de tabla a tarjetas; los filtros se pliegan en un panel "Filtros" (el buscador por código queda siempre a la vista).
- **Formularios**: campos de 44 px de alto y texto de 16 px (evita el zoom automático de iOS); botones de envío a ancho completo.
- **Tarjetas de resumen**: en una grilla de 3 columnas compactas (icono, número y etiqueta corta) en lugar de apilarse.

## Tablet (768–1023 px)

La barra lateral se reduce a un **riel de iconos** (4 rem) con etiquetas en `title` y `aria-label`; desde 1024 px vuelve a mostrarse completa. El contenido usa todo el ancho restante.

## Fuera de alcance

Cambiar el tema manualmente (botón claro/oscuro); rediseñar el logo; nuevas pantallas o funciones; animaciones complejas; internacionalización; tocar la lógica de los servicios o las Server Actions.

## Verificación

Capturas de cada pantalla principal en escritorio (≈1440 px), tablet (820 px) y celular (390 px), en tema oscuro y claro; `npm run typecheck`; `npm test`; revisión manual de que `/reservar` y el login siguen funcionando.
