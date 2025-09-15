-- Create geofences table
CREATE TABLE IF NOT EXISTS geofences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    polygon_geojson JSONB NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('restricted', 'danger', 'tourist_zone')),
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient spatial queries
CREATE INDEX IF NOT EXISTS idx_geofences_active ON geofences(active);
CREATE INDEX IF NOT EXISTS idx_geofences_type ON geofences(type);
CREATE INDEX IF NOT EXISTS idx_geofences_created_by ON geofences(created_by);

-- Enable RLS (Row Level Security)
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active geofences" ON geofences
    FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage geofences" ON geofences
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_geofences_updated_at 
    BEFORE UPDATE ON geofences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert demo geofences data
INSERT INTO geofences (name, description, polygon_geojson, type, active) VALUES
(
    'Dangerous Riverbank Area',
    'High-risk area near the river with strong currents. Tourist safety requires immediate ranger response.',
    '{
        "type": "Polygon",
        "coordinates": [[
            [77.2020, 28.6100],
            [77.2040, 28.6100],
            [77.2040, 28.6120],
            [77.2020, 28.6120],
            [77.2020, 28.6100]
        ]]
    }',
    'danger',
    true
),
(
    'Sacred Heritage Site',
    'Protected cultural heritage site with restricted access during certain hours.',
    '{
        "type": "Polygon",
        "coordinates": [[
            [77.2080, 28.6140],
            [77.2100, 28.6140],
            [77.2100, 28.6160],
            [77.2080, 28.6160],
            [77.2080, 28.6140]
        ]]
    }',
    'restricted',
    true
),
(
    'Tourist Viewpoint Zone',
    'Safe designated tourist area with excellent views and facilities.',
    '{
        "type": "Polygon",
        "coordinates": [[
            [77.2060, 28.6180],
            [77.2090, 28.6180],
            [77.2090, 28.6200],
            [77.2060, 28.6200],
            [77.2060, 28.6180]
        ]]
    }',
    'tourist_zone',
    true
);