-- Création du type énuméré pour les matières
CREATE TYPE matiere_type AS ENUM (
    'Histoire',
    'Geographie',
    'Francais',
    'Mathematiques',
    'Physique',
    'Chimie',
    'SVT',
    'Techno',
    'Anglais',
    'Espagnol',
    'emc'
);

-- Création de la table des révisions
CREATE TABLE revisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    matiere matiere_type NOT NULL,
    chapitre VARCHAR(255) NOT NULL,
    lien_video VARCHAR(2048),
    lien_quiz VARCHAR(2048),
    termine BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création d'un trigger pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application du trigger sur la table revisions
CREATE TRIGGER update_revisions_updated_at
    BEFORE UPDATE ON revisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Création des politiques de sécurité RLS (Row Level Security)
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Permettre la lecture à tous les utilisateurs authentifiés" ON revisions
    FOR SELECT
    TO authenticated
    USING (true);

-- Politique pour permettre l'insertion à tous les utilisateurs authentifiés
CREATE POLICY "Permettre l'insertion à tous les utilisateurs authentifiés" ON revisions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Politique pour permettre la mise à jour à tous les utilisateurs authentifiés
CREATE POLICY "Permettre la mise à jour à tous les utilisateurs authentifiés" ON revisions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la suppression à tous les utilisateurs authentifiés
CREATE POLICY "Permettre la suppression à tous les utilisateurs authentifiés" ON revisions
    FOR DELETE
    TO authenticated
    USING (true);

-- 1. Ajouter les nouvelles colonnes pour les liens de quiz et vidéo supplémentaires
-- Ces commandes ajoutent lien_quiz_4 et lien_video_4 si elles n'existent pas
ALTER TABLE revisions
ADD COLUMN IF NOT EXISTS lien_quiz_4 text,
ADD COLUMN IF NOT EXISTS lien_video_4 text;

-- 2. Supprimer la colonne de date de création (si elle s'appelle 'created_at' et que vous voulez la supprimer)
-- REMPLACER 'created_at' par le nom exact de votre colonne de date si elle est différente.
-- Exécutez cette commande SEULEMENT si vous êtes certain de vouloir supprimer cette colonne.
ALTER TABLE revisions
DROP COLUMN IF EXISTS created_at; 