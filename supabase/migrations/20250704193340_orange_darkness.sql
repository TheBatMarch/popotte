/*
  # Ajouter des données d'exemple pour l'application Popotte

  1. Nouvelles tables de données
    - Catégories d'exemple (Plats, Boissons, Desserts)
    - Produits d'exemple avec prix et descriptions
    - Articles de news d'exemple

  2. Sécurité
    - Toutes les données respectent les policies RLS existantes
    - Les données sont créées de manière sécurisée
*/

-- Insérer des catégories d'exemple
INSERT INTO categories (name, slug, icon) VALUES
('Plats principaux', 'plats-principaux', '🍽️'),
('Boissons', 'boissons', '🥤'),
('Desserts', 'desserts', '🍰'),
('Entrées', 'entrees', '🥗')
ON CONFLICT (name) DO NOTHING;

-- Insérer des produits d'exemple
INSERT INTO products (name, description, price, category_id, image_url, is_available) 
SELECT 
  p.name,
  p.description,
  p.price,
  c.id,
  p.image_url,
  p.is_available
FROM (VALUES
  ('Couscous royal', 'Couscous traditionnel avec merguez, agneau et légumes', 12.50, 'plats-principaux', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true),
  ('Tajine de poulet', 'Tajine de poulet aux olives et citrons confits', 11.00, 'plats-principaux', 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg', true),
  ('Pastilla au poisson', 'Pastilla traditionnelle au poisson et aux épices', 9.50, 'plats-principaux', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true),
  ('Harira', 'Soupe traditionnelle marocaine aux lentilles', 4.50, 'entrees', 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', true),
  ('Salade marocaine', 'Salade fraîche aux tomates, concombres et herbes', 5.00, 'entrees', 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg', true),
  ('Thé à la menthe', 'Thé traditionnel marocain à la menthe fraîche', 2.50, 'boissons', 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg', true),
  ('Jus d''orange frais', 'Jus d''orange pressé du jour', 3.00, 'boissons', 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', true),
  ('Café marocain', 'Café traditionnel aux épices', 2.00, 'boissons', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', true),
  ('Cornes de gazelle', 'Pâtisseries traditionnelles aux amandes', 6.00, 'desserts', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true),
  ('Chebakia', 'Pâtisseries au miel et graines de sésame', 5.50, 'desserts', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true),
  ('Makroud', 'Gâteaux de semoule aux dattes', 4.50, 'desserts', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true)
) AS p(name, description, price, category_slug, image_url, is_available)
JOIN categories c ON c.slug = p.category_slug
ON CONFLICT (name) DO NOTHING;

-- Insérer des articles de news d'exemple
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
true),

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
true),

('Horaires d''ouverture mis à jour', 
'Nous vous informons que nos horaires d''ouverture ont été légèrement modifiés pour mieux vous servir :

Lundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00
Samedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30

Les commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d''ouverture.

Merci de votre compréhension !',
'Nouveaux horaires pour mieux vous servir',
'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
true)
ON CONFLICT (title) DO NOTHING;