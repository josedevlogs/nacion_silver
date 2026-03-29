# Fuentes de requisitos (Nación Silver)

## Orden de precedencia

1. **`nacion silver plan.docx`** — Documento de planificación exportado (ruta típica: `NACION SILVER/nacion silver plan.docx` en OneDrive). Cuando exista conflicto con notas sueltas o hilos antiguos, **gana el Word actualizado**.
2. **[`nación_silver_roadmap_f4acb891.plan.md`](../nación_silver_roadmap_f4acb891.plan.md)** — Roadmap técnico y de producto en el repo: decisiones de stack, fases A–C, IdP Supabase, riesgos.
3. **[`COMMUNITY_PRODUCT_SPEC.md`](COMMUNITY_PRODUCT_SPEC.md)** — Comunidad (feed guiado, grupos, Club Silver manual, exclusiones).
4. **Este repositorio** — Código y migraciones como fuente de verdad de lo implementado.

## Cómo mantener todo alineado

- Tras **cambiar el Word** (prioridades, exclusiones, nuevas pantallas), actualizar el roadmap en el mismo PR o commit de trabajo con un resumen de 3–10 líneas en la sección “Fuente de requisitos” o en notas de versión.
- Si el `.docx` **no está en el repo**, copiar al repo (por ejemplo `docs/plan/` como PDF o Markdown exportado) o pegar el resumen ejecutivo en el roadmap para que el equipo no dependa de rutas locales.
- Objetivo: **un solo lugar legible en Git** para decisiones que afectan implementación; el Word puede seguir siendo el borrador si se sincroniza periódicamente.

## Estado respecto al Word en este repo

El archivo Word no está versionado aquí. Las decisiones ya reflejadas en el roadmap (Supabase Auth como IdP, sin Clerk, ecosistema SILVERMOON, Third-Party Auth en apps hijas) se asumen alineadas con el documento original hasta que se añada una copia o diff explícito.
