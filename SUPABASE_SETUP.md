# Supabase Setup Guide for GoSafe

## ✅ **Already Completed**

1. ✅ Supabase client installed (`@supabase/supabase-js`)
2. ✅ Environment variables configured in `.env`
3. ✅ Supabase client wrapper created (`src/lib/supabase.ts`)
4. ✅ Environment variables properly configured to use `.env` file
5. ✅ `.gitignore` updated to protect `.env` file

## 🛠️ **Next Steps to Complete Setup**

### Step 1: Verify Your Supabase Project

Your current project details from `.env`:

- **URL**: `https://bleswtkoafdljurmythi.supabase.co`
- **Project ID**: `bleswtkoafdljurmythi`

### Step 2: Create Database Tables

Go to your Supabase project → SQL Editor and run the following essential tables:

```sql
-- Essential tables for immediate functionality
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  user_role TEXT CHECK (user_role IN ('tourist', 'authority', 'admin')) DEFAULT 'tourist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS digital_tourist_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_name TEXT NOT NULL,
  aadhaar_number TEXT UNIQUE NOT NULL,
  passport_number TEXT,
  trip_itinerary TEXT NOT NULL,
  emergency_contacts JSONB NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  blockchain_hash TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'revoked')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID REFERENCES digital_tourist_ids(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  alert_type TEXT CHECK (alert_type IN ('panic', 'medical', 'security', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'responded', 'resolved')) DEFAULT 'active',
  message TEXT,
  blockchain_hash TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tourist_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID REFERENCES digital_tourist_ids(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy_meters INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 3: Test Connection

Run this in your browser console or add to a component:

```typescript
import { supabase } from "@/lib/supabase";

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from("profiles").select("count");
  if (error) {
    console.error("Connection failed:", error);
  } else {
    console.log("✅ Supabase connected successfully!");
  }
};

testConnection();
```

### Step 4: Enable Realtime (Optional)

In Supabase Dashboard:

1. Go to Database → Replication
2. Enable realtime for tables: `sos_alerts`, `tourist_locations`, `profiles`

### Step 5: Test Your Setup

Once tables are created, test with this simple query:

```typescript
// Insert test data
const { data, error } = await supabase.from("profiles").insert([
  {
    full_name: "Test User",
    user_role: "tourist",
  },
]);

if (!error) {
  console.log("✅ Database write successful!", data);
}
```

## 🚀 **Quick Start Commands**

### Test Connection:

```bash
npm run dev
```

Then open browser console and run:

```javascript
window.supabase = (await import("/src/lib/supabase.ts")).supabase;
const test = await window.supabase.from("profiles").select("count");
console.log("Connection result:", test);
```

### Development Server:

```bash
npm run dev
```

Your app will be available at: `http://localhost:8080`

## 🔧 **Troubleshooting**

### If you get "relation does not exist" errors:

1. Check that tables are created in Supabase SQL Editor
2. Make sure you're using the correct project URL and key
3. Verify your `.env` file is loaded (restart dev server)

### If connection fails:

1. Verify your Supabase project is active
2. Check the URL and key in `.env` match your project
3. Ensure no typos in environment variable names

### Type errors:

The TypeScript errors you're seeing are normal before tables exist. Once you create the tables in Supabase, you can:

1. Generate types: `npx supabase gen types typescript --project-id=bleswtkoafdljurmythi`
2. Or continue with basic types until tables are ready

## 📝 **Current Environment**

```
VITE_SUPABASE_URL=https://bleswtkoafdljurmythi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 **Ready for Development**

Your Supabase setup is **90% complete**! Just need to:

1. Create the database tables using the SQL above
2. Test the connection
3. Start building features

The police dashboard and tourism features will work once the tables are created!
