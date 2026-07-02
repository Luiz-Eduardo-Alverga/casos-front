-- Atribui hierarchy_level aos perfis existentes.
-- Menor número = mais autoridade (1 = topo).
-- Execute após a migration 0006_role_hierarchy_level.sql.

-- Nível 1
UPDATE roles SET hierarchy_level = 1 WHERE id IN (
  '870d81d1-ec99-4110-ae21-08198fdf3a9f',
  '8451f361-73df-4ee7-b03f-39a272b3e87a'
);

-- Nível 2
UPDATE roles SET hierarchy_level = 2 WHERE id IN (
  'cf82037d-9f67-4940-82b7-06db297ab258',
  '22917bd2-02c4-467d-a152-b7edfa757166',
  '244b2ca3-6e0c-45ba-902b-2a5845d935e9'
);

-- Nível 3
UPDATE roles SET hierarchy_level = 3 WHERE id IN (
  '9c5913ff-78aa-40fc-9657-e769893d760b'
);

-- Nível 4
UPDATE roles SET hierarchy_level = 4 WHERE id IN (
  '52f30ec9-ee07-438b-ba82-3cf72eb8da31',
  'ec386859-1a58-4ff6-ae51-f3789a27c4e5',
  'a668ee62-30f8-482d-ac33-ca2d591a950b'
);
