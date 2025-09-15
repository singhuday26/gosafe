import { supabase } from "@/integrations/supabase/client";
import * as turf from "@turf/turf";

export interface GeoFenceAPI {
  id: string;
  name: string;
  description?: string;
  coordinates: unknown;
  type: "restricted" | "danger" | "tourist_zone";
}

class GeoFencingService {
  // Get all active geofences
  async getGeofences(): Promise<GeoFenceAPI[]> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching geofences:", error);
      throw error;
    }
  }

  // Create new geofence
  async createGeofence(
    geofence: Omit<GeoFenceAPI, "id" | "active">
  ): Promise<GeoFenceAPI> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .insert({
          name: geofence.name,
          description: geofence.description,
          coordinates: geofence.coordinates,
          type: geofence.type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating geofence:", error);
      throw error;
    }
  }

  // Update geofence
  async updateGeofence(
    id: string,
    updates: Partial<GeoFenceAPI>
  ): Promise<GeoFenceAPI> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating geofence:", error);
      throw error;
    }
  }

  // Archive geofence (soft delete)
  async deleteGeofence(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("geo_fences")
        .update({ active: false })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting geofence:", error);
      throw error;
    }
  }

  // Check if point is inside geofence
  checkPointInGeofence(
    point: [number, number],
    geofence: GeoFenceAPI
  ): boolean {
    try {
      // Use Turf.js for precise geometric calculations
      const turf = require("@turf/turf");

      const pointFeature = turf.point(point);

      let polygonFeature;
      if (Array.isArray(geofence.coordinates)) {
        // Legacy format
        const coordinates = geofence.coordinates.map((coord: any) => [
          coord.lng,
          coord.lat,
        ]);
        coordinates.push(coordinates[0]); // Close polygon
        polygonFeature = turf.polygon([coordinates]);
      } else {
        // GeoJSON format
        polygonFeature = turf.feature(geofence.coordinates);
      }

      return turf.booleanPointInPolygon(pointFeature, polygonFeature);
    } catch (error) {
      console.error("Error checking point in geofence:", error);
      return false;
    }
  }

  // Get escalation type based on geofence
  getEscalationType(
    geofences: GeoFenceAPI[],
    point: [number, number]
  ): "ranger" | "police" {
    for (const geofence of geofences) {
      if (this.checkPointInGeofence(point, geofence)) {
        // Danger zones get ranger response, others get police
        return geofence.type === "danger" ? "ranger" : "police";
      }
    }
    return "police"; // Default escalation
  }

  // Validate GeoJSON polygon
  validatePolygon(geojson: any): boolean {
    try {
      if (!geojson || geojson.type !== "Polygon") return false;

      const coordinates = geojson.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length === 0) return false;

      const outerRing = coordinates[0];
      if (!Array.isArray(outerRing) || outerRing.length < 4) return false;

      // Check if polygon is closed
      const first = outerRing[0];
      const last = outerRing[outerRing.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) return false;

      return true;
    } catch {
      return false;
    }
  }
}

export const geoFencingService = new GeoFencingService();
