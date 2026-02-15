-- Fix tips table sequence after manual inserts
SELECT setval(pg_get_serial_sequence('petcare.tips', 'id'), COALESCE(MAX(id), 1)) FROM petcare.tips;
