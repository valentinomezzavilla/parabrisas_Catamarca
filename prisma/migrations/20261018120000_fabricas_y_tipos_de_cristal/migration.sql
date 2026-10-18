-- Datos: el campo "Marca" del cristal pasa a llamarse "Fábrica" y cambian las opciones de Fábrica y de Tipo.
-- Las opciones viejas que no están en la lista nueva se desactivan en vez de borrarse: dejan de ofrecerse pero los
-- cristales que ya las usan las siguen mostrando. Es idempotente y funciona también sobre una base vacía.

-- Se conserva una sola Sekurit: la vieja "Saint-Gobain Sekurit" pasa a llamarse "Sekurit" si todavía no existe.
UPDATE "marcas_cristal" SET "nombre" = 'Sekurit'
WHERE "nombre" = 'Saint-Gobain Sekurit'
  AND NOT EXISTS (SELECT 1 FROM "marcas_cristal" WHERE "nombre" = 'Sekurit');

INSERT INTO "marcas_cristal" ("id", "nombre", "activo")
SELECT gen_random_uuid()::text, v.nombre, true
FROM (VALUES ('Pilkington'), ('Sekurit'), ('Original y legítimo'), ('Temcem'), ('Favicur'),
             ('Polissurex'), ('Glass'), ('Cristem'), ('Fuyao'), ('Otros')) AS v(nombre)
ON CONFLICT ("nombre") DO UPDATE SET "activo" = true;

UPDATE "marcas_cristal" SET "activo" = false
WHERE "nombre" NOT IN ('Pilkington', 'Sekurit', 'Original y legítimo', 'Temcem', 'Favicur',
                       'Polissurex', 'Glass', 'Cristem', 'Fuyao', 'Otros');

INSERT INTO "tipos_cristal" ("id", "nombre", "activo")
SELECT gen_random_uuid()::text, v.nombre, true
FROM (VALUES ('Verde'), ('Verde con degradé')) AS v(nombre)
ON CONFLICT ("nombre") DO UPDATE SET "activo" = true;

UPDATE "tipos_cristal" SET "activo" = false
WHERE "nombre" NOT IN ('Verde', 'Verde con degradé');
