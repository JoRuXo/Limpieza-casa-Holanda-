# Turno de Hoy — Limpieza Casa Holanda

App web para organizar los turnos de limpieza de la casa compartida de 7 personas: **Yassine, Jorge, Miguel, Noel, Ali, Raul y Alberto**.

## Qué hace

- Reparte un turno por día entre los 7, en orden fijo y rotando cada semana (empieza Yassine).
- Cada día muestra una lista de tareas obligatorias (ej. sacar la basura, barrer la casa, dejar la cocina limpia) que la persona de turno debe completar **adjuntando una foto** como prueba.
- Cualquiera puede abrir la app y ver de un vistazo a quién le toca hoy, esta semana, y el historial de cumplimiento.
- **Miguel** (jefe de la casa) y **Alberto** (desarrollador) son administradores: pueden añadir/editar/quitar tareas, cambiar el orden de turnos, y marcar tareas manualmente.

## Cómo funciona técnicamente

Está publicada como un **Claude Artifact** (una página web con enlace propio). No usa una base de datos externa: la propia página se auto-actualiza (capacidad `artifact` del runtime de Claude) cada vez que alguien completa una tarea, y esos cambios se ven al instante para todos los que tengan el enlace abierto.

- Identificación: al entrar, cada persona elige su nombre de una lista de 7 (se recuerda en ese dispositivo/navegador).
- Fotos: se comprimen en el propio navegador antes de guardarse (no se suben a ningún servidor externo).
- Historial: los últimos 7 días guardan las fotos completas; los días más antiguos se archivan solo con el resultado (cumplido o no) para no hacer la página demasiado pesada.

**Importante sobre permisos para compartir:** para que los 7 podáis marcar tareas (no solo verlas), el enlace del artifact debe compartirse con permiso de **edición**, no solo de vista. Si alguien solo puede ver pero no marcar nada, revisa esa opción al compartir el enlace.

## Enlace de la app

https://claude.ai/code/artifact/e2732477-bc6b-4405-aaef-b56f51859ca7

Por defecto los artifacts se publican privados. Para que los 7 podáis acceder, compártelo desde el propio menú de la página (arriba a la derecha) con permiso de **edición**, no solo de vista.

## Historial de cambios

- 2026-09-07: Primera versión — rotación diaria fija, 3 tareas por defecto (basura, barrer, cocina), panel de admin para Miguel y Alberto.
