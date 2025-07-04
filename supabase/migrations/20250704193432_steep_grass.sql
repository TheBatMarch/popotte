/*
  # Ajouter des données d'exemple

  1. Nouvelles données
    - Catégories de produits (Plats principaux, Boissons, Desserts, Entrées)
    - Produits marocains avec descriptions et prix
    - Articles de news pour la page d'accueil

  2. Sécurité
    - Utilisation de vérifications d'existence pour éviter les doublons
    - Données cohérentes avec le schéma existant
*/

-- Insérer des catégories d'exemple seulement si elles n'existent pas
DO $$
BEGIN
  -- Plats principaux
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'plats-principaux') THEN
    INSERT INTO categories (name, slug, icon) VALUES ('Plats principaux', 'plats-principaux', '🍽️');
  END IF;
  
  -- Boissons
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'boissons') THEN
    INSERT INTO categories (name, slug, icon) VALUES ('Boissons', 'boissons', '🥤');
  END IF;
  
  -- Desserts
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'desserts') THEN
    INSERT INTO categories (name, slug, icon) VALUES ('Desserts', 'desserts', '🍰');
  END IF;
  
  -- Entrées
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'entrees') THEN
    INSERT INTO categories (name, slug, icon) VALUES ('Entrées', 'entrees', '🥗');
  END IF;
END $$;

-- Insérer des produits d'exemple
DO $$
DECLARE
  cat_plats_id uuid;
  cat_boissons_id uuid;
  cat_desserts_id uuid;
  cat_entrees_id uuid;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO cat_plats_id FROM categories WHERE slug = 'plats-principaux';
  SELECT id INTO cat_boissons_id FROM categories WHERE slug = 'boissons';
  SELECT id INTO cat_desserts_id FROM categories WHERE slug = 'desserts';
  SELECT id INTO cat_entrees_id FROM categories WHERE slug = 'entrees';
  
  -- Plats principaux
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Couscous royal') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Couscous royal', 'Couscous traditionnel avec merguez, agneau et légumes', 12.50, cat_plats_id, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Tajine de poulet') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Tajine de poulet', 'Tajine de poulet aux olives et citrons confits', 11.00, cat_plats_id, 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pastilla au poisson') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Pastilla au poisson', 'Pastilla traditionnelle au poisson et aux épices', 9.50, cat_plats_id, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true);
  END IF;
  
  -- Entrées
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Harira') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Harira', 'Soupe traditionnelle marocaine aux lentilles', 4.50, cat_entrees_id, 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Salade marocaine') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Salade marocaine', 'Salade fraîche aux tomates, concombres et herbes', 5.00, cat_entrees_id, 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg', true);
  END IF;
  
  -- Boissons
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Thé à la menthe') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Thé à la menthe', 'Thé traditionnel marocain à la menthe fraîche', 2.50, cat_boissons_id, 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Jus d''orange frais') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Jus d''orange frais', 'Jus d''orange pressé du jour', 3.00, cat_boissons_id, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Café marocain') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Café marocain', 'Café traditionnel aux épices', 2.00, cat_boissons_id, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', true);
  END IF;
  
  -- Desserts
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cornes de gazelle') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Cornes de gazelle', 'Pâtisseries traditionnelles aux amandes', 6.00, cat_desserts_id, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Chebakia') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Chebakia', 'Pâtisseries au miel et graines de sésame', 5.50, cat_desserts_id, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Makroud') THEN
    INSERT INTO products (name, description, price, category_id, image_url, is_available) 
    VALUES ('Makroud', 'Gâteaux de semoule aux dattes', 4.50, cat_desserts_id, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true);
  END IF;
END $$;

-- Insérer des articles de news d'exemple
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM news WHERE title = 'Bienvenue à la Popotte Association !') THEN
    INSERT INTO news (title, content, excerpt, image_url, published) VALUES
    ('Bienvenue à la Popotte Association !', 
    'Nous sommes ravis de vous accueillir dans notre nouvelle application de commande en ligne. 

Vous pouvez désormais :
- Consulter notre menu complet
- Passer vos commandes facilement
- Suivre vos dettes et paiements
- Rester informés de nos actualités

Notre association continue de vous proposer des plats traditionnels marocains préparés avec amour et des ingrédients de qualité.

N''hésitez pas à nous faire part de vos retours pour améliorer votre expérience !',
    'Découvrez notre nouvelle application de commande en ligne',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM news WHERE title = 'Nouveau menu de printemps') THEN
    INSERT INTO news (title, content, excerpt, image_url, published) VALUES
    ('Nouveau menu de printemps', 
    'Nous avons le plaisir de vous annoncer l''arrivée de notre nouveau menu de printemps !

Au programme :
- Des salades fraîches de saison
- De nouveaux tajines aux légumes printaniers
- Des desserts légers et parfumés

Tous nos plats sont préparés avec des produits frais et de saison, dans le respect de nos traditions culinaires.

Venez découvrir ces nouvelles saveurs dès maintenant !',
    'Découvrez nos nouveaux plats de saison',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM news WHERE title = 'Horaires d''ouverture mis à jour') THEN
    INSERT INTO news (title, content, excerpt, image_url, published) VALUES
    ('Horaires d''ouverture mis à jour', 
    'Nous vous informons que nos horaires d''ouverture ont été légèrement modifiés pour mieux vous servir :

Lundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00
Samedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30

Les commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d''ouverture.

Merci de votre compréhension !',
    'Nouveaux horaires pour mieux vous servir',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    true);
  END IF;
END $$;