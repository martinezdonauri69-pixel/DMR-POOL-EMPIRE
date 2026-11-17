# ENGLISH WORLD 3D

Juego educativo 3D (Three.js) para aprender inglés. Fase 1-3 lista: pantalla inicial, mapa 3D de 8 mundos, desbloqueo, Mundo 1 completo (6 lecciones), Mundo 2 inicial (3 lecciones), recompensas, perfil, ajustes, guardado y repaso.

## Subir a GitHub
1. Descomprime el ZIP.
2. Copia TODO el contenido (index.html, css, js, README.md) a la raíz de tu repositorio.
3. Settings > Pages > Deploy from a branch > main / (root).
4. Abre la URL de GitHub Pages. Necesita internet (Three.js se carga desde jsDelivr).

No abras index.html con doble clic: los módulos JS requieren servidor (GitHub Pages o `python -m http.server`).

## Ampliar
Agrega lecciones en `js/data.js` (formato "inglés|español;..."). El juego las usa sin cambiar más código.
