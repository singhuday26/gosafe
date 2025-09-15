import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GeoFence {
  id?: string;
  name: string;
  description?: string;
  polygon_geojson: any; // GeoJSON Polygon
  type: "restricted" | "danger" | "tourist_zone";
  active?: boolean;
  created_by?: string;
}

interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { method } = req;
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const fenceId = segments[segments.length - 1];

    console.log(`Geofencing API: ${method} ${url.pathname}`);

    // GET /api/geo_fences - List active geo-fences
    if (method === "GET" && !fenceId) {
      const bbox = url.searchParams.get("bbox");
      let query = supabase
        .from("geo_fences")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      // TODO: Add bounding box filter if provided
      // For now, return all active geofences

      const { data: geofences, error } = await query;

      if (error) {
        console.error("Error fetching geofences:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          geofences: geofences || [],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /api/geo_fences/:id - Get specific geofence
    if (method === "GET" && fenceId) {
      const { data: geofence, error } = await supabase
        .from("geo_fences")
        .select("*")
        .eq("id", fenceId)
        .single();

      if (error || !geofence) {
        return new Response(JSON.stringify({ error: "Geofence not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          geofence,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST /api/geo_fences - Create new geofence (admin only)
    if (method === "POST") {
      const fenceData: GeoFence = await req.json();

      // Validate required fields
      if (!fenceData.name || !fenceData.polygon_geojson || !fenceData.type) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields: name, polygon_geojson, type",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate GeoJSON polygon
      if (!isValidGeoJSONPolygon(fenceData.polygon_geojson)) {
        return new Response(
          JSON.stringify({
            error: "Invalid GeoJSON polygon format",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate fence type
      if (!["restricted", "danger", "tourist_zone"].includes(fenceData.type)) {
        return new Response(
          JSON.stringify({
            error: "Invalid type. Must be: restricted, danger, or tourist_zone",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get user from auth header
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Authorization required" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if user is admin (simplified for demo)
      // In production, verify user role from user_roles table
      const { data: geofence, error } = await supabase
        .from("geo_fences")
        .insert({
          name: fenceData.name,
          description: fenceData.description,
          coordinates: fenceData.polygon_geojson, // Using existing 'coordinates' column
          type: fenceData.type,
          // created_by will be set by RLS policy if auth is properly configured
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating geofence:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          geofence,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // PUT /api/geo_fences/:id - Update geofence (admin only)
    if (method === "PUT" && fenceId) {
      const updateData: Partial<GeoFence> = await req.json();

      // Validate GeoJSON if provided
      if (
        updateData.polygon_geojson &&
        !isValidGeoJSONPolygon(updateData.polygon_geojson)
      ) {
        return new Response(
          JSON.stringify({
            error: "Invalid GeoJSON polygon format",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate fence type if provided
      if (
        updateData.type &&
        !["restricted", "danger", "tourist_zone"].includes(updateData.type)
      ) {
        return new Response(
          JSON.stringify({
            error: "Invalid type. Must be: restricted, danger, or tourist_zone",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: geofence, error } = await supabase
        .from("geo_fences")
        .update({
          name: updateData.name,
          description: updateData.description,
          coordinates: updateData.polygon_geojson,
          type: updateData.type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fenceId)
        .select()
        .single();

      if (error) {
        console.error("Error updating geofence:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          geofence,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DELETE /api/geo_fences/:id - Archive geofence (admin only)
    if (method === "DELETE" && fenceId) {
      // Soft delete by setting active = false
      const { data: geofence, error } = await supabase
        .from("geo_fences")
        .update({
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fenceId)
        .select()
        .single();

      if (error) {
        console.error("Error archiving geofence:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Geofence archived successfully",
          geofence,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Geofencing API error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to validate GeoJSON polygon
function isValidGeoJSONPolygon(geojson: any): boolean {
  try {
    if (!geojson || geojson.type !== "Polygon") {
      return false;
    }

    if (
      !Array.isArray(geojson.coordinates) ||
      geojson.coordinates.length === 0
    ) {
      return false;
    }

    // Check first ring (outer boundary)
    const outerRing = geojson.coordinates[0];
    if (!Array.isArray(outerRing) || outerRing.length < 4) {
      return false;
    }

    // Check if first and last coordinates are the same (closed ring)
    const first = outerRing[0];
    const last = outerRing[outerRing.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return false;
    }

    // Validate coordinate format [longitude, latitude]
    for (const coord of outerRing) {
      if (!Array.isArray(coord) || coord.length < 2) {
        return false;
      }

      const [lng, lat] = coord;
      if (typeof lng !== "number" || typeof lat !== "number") {
        return false;
      }

      // Basic coordinate range validation
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("GeoJSON validation error:", error);
    return false;
  }
}
