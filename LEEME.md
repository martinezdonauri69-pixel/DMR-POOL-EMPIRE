# D.M.R PING PONG · versión nueva (3D, 12 idiomas, tutorial)

## Cómo publicarlo (GitHub Pages)
1. En tu repositorio **borra todo lo viejo** y sube el CONTENIDO de esta carpeta (que `index.html` quede en la raíz).
2. Espera 1-2 minutos y abre `https://martinezdonauri69-pixel.github.io/`.

## Firebase (proyecto `dmr-ping-pong`) – hazlo una vez
1. **Authentication → Método de acceso**: activa *Correo electrónico/contraseña*.
2. **Authentication → Configuración → Dominios autorizados**: debe estar `martinezdonauri69-pixel.github.io`.
3. **Firestore Database → Reglas**: borra lo que hay, pega el contenido de `firestore.rules` y pulsa **Publicar**.
4. **Ser administrador**: juega una vez con tu cuenta, copia tu *UID* (Authentication → Usuarios) y en Firestore crea la colección `admins` con un documento cuyo **ID sea tu UID** (con cualquier campo, p. ej. `ok: true`). Al reiniciar el juego aparece el botón 👑 Admin.

## Qué cambió
- Proyecto dividido en archivos (`js/`, `css/`, `assets/`, `vendor/`). Sin código duplicado.
- Todo en 3D (Three.js incluido en `vendor/`, no necesita internet para cargar).
- Se quitaron los niveles de campaña; se mantiene el **nivel de perfil** y los **rangos** (Bronce → LEYENDA, 4 divisiones, insignias 3D, animación al subir de rango con sonido).
- Idiomas: 12, todo cambia al instante (incluye árabe de derecha a izquierda).
- Tutorial guiado con dedito y aro eléctrico; el resto de la pantalla queda bloqueada.
- Clic derecho = clic izquierdo; no sale menú, ni barras, ni selección/copia.

## Seguridad (honesto)
- Un juego web **siempre** se descarga completo al navegador: nadie puede esconder el código al 100 %. Lo incluido: el juego solo corre en tu dominio, bloqueo de iframe, atajos de inspección/guardado, menú, copia y arrastre.
- Lo que protege de verdad tus datos son las **reglas de Firestore** (`firestore.rules`): nadie puede darse verificación, ocultarse del ranking ni editar a otros jugadores.
- Para lo más importante (premios, rangos) lo ideal a futuro es validar en un servidor (Cloud Functions).
- Si usas otro dominio, agrégalo a `OK_HOSTS` en `js/security.js`.

## Novedades de esta versión
- **Tienda de 30 paletas 3D** (`js/data/catalog.js` = datos, `js/paddles3d.js` = diseño 3D y visor, `js/shop.js` = pantalla). Cuadrícula de 3 columnas, vista previa 3D animada, comprar / equipar, guardado automático.
- **Ventajas pequeñas (máx. 5 %)**: precisión (la paleta sigue mejor el dedo), control (ángulo de devolución) y velocidad (movimiento). Solo cuenta la paleta equipada y **ninguna cambia el tamaño ni el área de golpe**. Clásica es gratis (todos necesitan una paleta para empezar).
- Tu paleta (y la del rival en línea) se ve en la partida, con inclinación al moverse, estela, partículas y efecto al golpear.
- Las paletas viejas de color se quitan y se **devuelven las monedas/gemas** que costaron.
- **Corregido**: textos que faltaban en 10 idiomas (`js/lang/extra.js`), "MODOS DE JUEGO" y "CARGANDO" ya cambian de idioma, victoria por desconexión del rival (ahora no da premios), imports sin usar, y reglas de Firestore (amistad forzada, baneos reales, invitaciones y correos ya no son públicos).
- **Importante**: vuelve a pegar `firestore.rules` en Firebase → Firestore → Reglas → Publicar. Las invitaciones ahora usan `toUid`/`fromUid`, así que las reglas viejas y el juego nuevo no se llevan bien: publica las dos cosas juntas.
