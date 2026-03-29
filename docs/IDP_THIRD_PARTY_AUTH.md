# Nación Silver como emisor de identidad (Supabase)

**Contexto:** Nación Silver usa **Supabase Auth** en su propio proyecto. Las demás apps del ecosistema SILVERMOON mantienen **su propio** proyecto Supabase y pueden confiar en los JWT emitidos por el proyecto de Nación Silver mediante **Third-Party / Bring your own JWT** (nombre exacto en el dashboard puede variar; validar siempre en la [documentación oficial](https://supabase.com/docs) vigente).

Este documento es una **checklist técnica** para el equipo; no sustituye la doc de Supabase.

## 1. Datos del emisor (Issuer)

Registrar internamente:

| Dato | Dónde obtenerlo |
|------|-----------------|
| **Project URL** | Dashboard del proyecto Nación Silver → Settings → API → Project URL |
| **JWKS / claves públicas** | Documentación de Supabase para validación JWT; rotación gestionada por Supabase |
| **Audience / `aud`** | Según configuración de Auth del proyecto receptor |

## 2. Identificador de usuario

- El **`sub`** del JWT suele mapear al `auth.users.id` del proyecto **emisor**.
- Cada app hija debe decidir cómo **vincular** ese id a filas locales (tabla `profiles`, `external_id`, etc.) sin fusionar bases de datos entre productos.

## 3. App hija (otro proyecto Supabase)

Checklist de alto nivel:

1. En el proyecto **receptor**, abrir Authentication → **Third-party** / **Sign in with JWT** (según UI actual).
2. Configurar el **issuer** y la **clave JWT** o flujo que indique la documentación para confiar en el emisor de Nación Silver.
3. Probar: login en Nación Silver → obtener sesión → usar el token en la app hija (según flujo: redirect, deep link, o intercambio documentado).
4. Ajustar **RLS** en la app hija: `auth.uid()` debe resolverse al usuario reconocido tras validar el JWT del emisor.

> Los pasos exactos cambian entre versiones del dashboard; usar la guía oficial y el foro de Supabase si algo no coincide.

## 4. Operación

- **Disponibilidad:** el proyecto emisor (Nación Silver) es el que no conviene pausar en producción.
- **Rotación:** seguir anuncios de Supabase sobre claves JWT; probar login en apps hijas tras cambios mayores.

## 5. Próximos pasos

Cuando exista la **segunda** app lista para integrar, asignar un responsable para ejecutar la checklist en staging y documentar valores concretos (sin pegar secretos en Git).
