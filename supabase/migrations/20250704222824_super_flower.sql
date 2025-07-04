/*
  # Create news table

  1. New Tables
    - `news`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text, nullable)
      - `image_url` (text, nullable)
      - `author_id` (uuid, foreign key to profiles)
      - `published` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `news` table
    - Add policy for anyone to read published news
    - Add policy for admins to manage all news

  3. Sample Data
    - Insert sample news posts
*/

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read published news"
  ON news
  FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can read all news"
  ON news
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage news"
  ON news
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample news posts
INSERT INTO news (title, content, excerpt, image_url, published) VALUES
  (
    'Bienvenue à la Popotte Association !',
    E'Nous sommes ravis de vous accueillir dans notre nouvelle application de commande en ligne.\n\nVous pouvez désormais :\n- Consulter notre menu complet\n- Passer vos commandes facilement\n- Suivre vos dettes et paiements\n- Rester informés de nos actualités\n\nNotre association continue de vous proposer des plats traditionnels marocains préparés avec amour et des ingrédients de qualité.\n\nN\'hésitez pas à nous faire part de vos retours pour améliorer votre expérience !',
    'Découvrez notre nouvelle application de commande en ligne',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    true
  ),
  (
    'Nouveau menu de printemps',
    E'Nous avons le plaisir de vous annoncer l\'arrivée de notre nouveau menu de printemps !\n\nAu programme :\n- Des salades fraîches de saison\n- De nouveaux tajines aux légumes printaniers\n- Des desserts légers et parfumés\n\nTous nos plats sont préparés avec des produits frais et de saison, dans le respect de nos traditions culinaires.\n\nVenez découvrir ces nouvelles saveurs dès maintenant !',
    'Découvrez nos nouveaux plats de saison',
    'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
    true
  ),
  (
    'Horaires d''ouverture mis à jour',
    E'Nous vous informons que nos horaires d\'ouverture ont été légèrement modifiés pour mieux vous servir :\n\nLundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00\nSamedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30\n\nLes commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d\'ouverture.\n\nMerci de votre compréhension !',
    'Nouveaux horaires pour mieux vous servir',
    'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    true
  )
ON CONFLICT DO NOTHING;