-- Development seed for the products read domain.
--
-- This is NOT a schema migration. It is safe to run multiple times and is meant
-- for local development or a demo environment.
--
-- It requires at least one row in `public.profiles` (created automatically when
-- a user signs up). Demo listings are attached to the oldest profile.
--
-- Apply with:
--   psql "$DATABASE_URL" -f seeds/0001_products.sql
-- or paste it into the Supabase SQL editor after `migrations/0003_products.sql`.

INSERT INTO public.categories (slug, name, sort_order)
VALUES
  ('celulares', 'Celulares', 1),
  ('eletronicos', 'Eletrônicos', 2),
  ('informatica', 'Informática', 3),
  ('casa-moveis', 'Casa & Móveis', 4),
  ('veiculos', 'Veículos', 5),
  ('moda', 'Moda', 6),
  ('games', 'Games', 7),
  ('esportes', 'Esportes', 8)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

DO $$
DECLARE
  v_seller UUID;
  v_category UUID;
  v_product UUID;
BEGIN
  SELECT id INTO v_seller
  FROM public.profiles
  ORDER BY created_at
  LIMIT 1;

  IF v_seller IS NULL THEN
    RAISE NOTICE
      'Skipping demo products: create an account first so a profile exists.';
    RETURN;
  END IF;

  -- iPhone 15 Pro
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'iPhone 15 Pro 256GB Titânio Natural'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'celulares';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'iPhone 15 Pro 256GB Titânio Natural',
      'iPhone 15 Pro em excelente estado, com caixa, cabo original e 89% de saúde da bateria. Sem riscos na tela.',
      4500.00, 'like_new',
      'Belém', 'Nazaré', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/iphone.png',
      'iPhone 15 Pro na cor titânio natural, com módulo de câmeras visível',
      0,
      true
    );
  END IF;

  -- PlayStation 5
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'PlayStation 5 com 2 controles e 3 jogos'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'games';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'PlayStation 5 com 2 controles e 3 jogos',
      'Console com leitor de disco, dois controles DualSense e três jogos físicos. Tudo funcionando perfeitamente.',
      3200.00, 'excellent',
      'Ananindeua', 'Centro', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/playstation.png',
      'Console PlayStation 5 branco acompanhado de um controle',
      0,
      true
    );
  END IF;

  -- Desk
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'Mesa de escritório em L com gavetas'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'casa-moveis';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'Mesa de escritório em L com gavetas',
      'Mesa em L com três gavetas e passagem para cabos. Desmontada para facilitar o transporte.',
      480.00, 'good',
      'Belém', 'Umarizal', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/desk.png',
      'Mesa de escritório em L com monitor e luminária',
      0,
      true
    );
  END IF;

  -- Bike
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'Bicicleta aro 29 Shimano 21 marchas'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'esportes';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'Bicicleta aro 29 Shimano 21 marchas',
      'Bicicleta aro 29 com câmbio Shimano de 21 marchas, freios a disco e pneus em bom estado.',
      1450.00, 'like_new',
      'Marituba', 'Centro', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/bike.png',
      'Bicicleta aro 29 preta com detalhes em roxo',
      0,
      true
    );
  END IF;

  -- Fridge
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'Geladeira Frost Free 375L Inox'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'casa-moveis';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'Geladeira Frost Free 375L Inox',
      'Geladeira Frost Free 375 litros, inox, com freezer inferior. Revisada e funcionando.',
      1890.00, 'good',
      'Belém', 'Guamá', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/fridge.png',
      'Geladeira Frost Free inox de duas portas',
      0,
      true
    );
  END IF;

  -- MacBook
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'MacBook Air M2 13 polegadas 8GB/256GB'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'informatica';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'MacBook Air M2 13 polegadas 8GB/256GB',
      'MacBook Air M2 com 8GB de memória e 256GB de SSD. Bateria com 94% de saúde e carregador original.',
      6200.00, 'excellent',
      'Belém', 'Batista Campos', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/macbook.png',
      'Notebook MacBook Air aberto com tela clara',
      0,
      true
    );
  END IF;

  -- Sofa
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'Sofá 3 lugares retrátil e reclinável'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'casa-moveis';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'Sofá 3 lugares retrátil e reclinável',
      'Sofá de três lugares retrátil e reclinável, tecido verde, sem rasgos ou manchas.',
      1200.00, 'good',
      'Ananindeua', 'Cidade Nova', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/sofa.png',
      'Sofá de três lugares verde com almofada roxa',
      0,
      true
    );
  END IF;

  -- Headphones
  IF NOT EXISTS (
    SELECT 1 FROM public.products
    WHERE title = 'Fone Bluetooth com cancelamento de ruído'
  ) THEN
    SELECT id INTO v_category FROM public.categories WHERE slug = 'eletronicos';

    INSERT INTO public.products (
      seller_id, category_id, title, description, price, condition,
      city, neighborhood, status
    )
    VALUES (
      v_seller, v_category,
      'Fone Bluetooth com cancelamento de ruído',
      'Fone over-ear com cancelamento ativo de ruído, estojo rígido e cabo USB-C. Produto novo, na caixa.',
      320.00, 'new',
      'Castanhal', 'Centro', 'active'
    )
    RETURNING id INTO v_product;

    INSERT INTO public.product_images (product_id, storage_path, alt_text, sort_order, is_primary)
    VALUES (
      v_product,
      '/products/headphones.png',
      'Fone de ouvido over-ear preto com detalhes roxos',
      0,
      true
    );
  END IF;
END $$;
