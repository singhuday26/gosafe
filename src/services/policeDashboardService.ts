import { supabase } from "@/lib/supabase";

// Type interfaces for better type safety
interface DatabaseAlert {
  id: string;
  tourist_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  alert_type: string;
  status: string;
  message?: string;
  blockchain_hash: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
  digital_tourist_ids?: {
    tourist_name: string;
  };
}

interface PayloadData {
  eventType: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  schema: string;
  table: string;
}

export interface TouristCluster {
  id: string;
  area_name: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  tourist_count: number;
  risk_level: "low" | "medium" | "high" | "critical";
  cluster_date: string;
  hourly_data: Record<string, number>;
  last_updated: string;
}

export interface RiskZone {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_factors: string[];
  incident_count: number;
  last_incident_date?: string;
  recommendations: string;
  active: boolean;
}

export interface MissingPerson {
  id: string;
  tourist_id: string;
  reported_by_user_id: string;
  case_number: string;
  status: "active" | "investigating" | "found" | "closed";
  last_known_location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  last_contact_time: string;
  missing_since: string;
  description?: string;
  circumstances?: string;
  physical_description?: string;
  clothing_description?: string;
  personal_belongings?: string;
  emergency_contacts: Record<string, unknown>;
  assigned_officer_id?: string;
  priority_level: "low" | "medium" | "high" | "critical";
  efir_generated: boolean;
  efir_number?: string;
  efir_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined data
  tourist_name?: string;
  assigned_officer_name?: string;
}

export interface CaseUpdate {
  id: string;
  missing_person_case_id: string;
  updated_by_user_id: string;
  update_type:
    | "investigation"
    | "sighting"
    | "evidence"
    | "contact"
    | "status_change";
  title: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  evidence_files?: string[];
  created_at: string;
  // Joined data
  updated_by_name?: string;
}

export interface DigitalIDRecord {
  id: string;
  tourist_name: string;
  aadhaar_number: string;
  passport_number?: string;
  trip_itinerary: string;
  emergency_contacts: Record<string, unknown>;
  issued_at: string;
  valid_from: string;
  valid_to: string;
  blockchain_hash: string;
  status: "active" | "expired" | "revoked";
  created_at: string;
  updated_at: string;
  // Additional data
  current_location?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  active_alerts?: number;
}

export interface AlertHistory {
  id: string;
  tourist_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  alert_type: "panic" | "medical" | "security" | "other";
  status: "active" | "responded" | "resolved";
  message?: string;
  blockchain_hash: string;
  timestamp: string;
  created_at: string;
  updated_at: string;
  // Joined data
  tourist_name?: string;
  response_time?: number; // in minutes
}

class PoliceDashboardService {
  // Tourist Clusters and Heat Maps (using geo_fences as risk zones)
  async getTouristClusters(date?: string): Promise<TouristCluster[]> {
    try {
      // Generate clusters from tourist locations
      const { data: locations, error } = await supabase
        .from("tourist_locations")
        .select(
          `
          *,
          digital_tourist_ids!inner(tourist_name, status)
        `
        )
        .gte(
          "timestamp",
          date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      // Simple clustering logic - group nearby locations
      const clusters: TouristCluster[] = [];
      const processed = new Set<string>();

      (locations || []).forEach((location) => {
        if (processed.has(location.id)) return;

        const lat = parseFloat(location.latitude.toString());
        const lng = parseFloat(location.longitude.toString());
        const nearbyLocations = (locations || []).filter((l) => {
          const distance = this.calculateDistance(
            lat,
            lng,
            parseFloat(l.latitude.toString()),
            parseFloat(l.longitude.toString())
          );
          return distance <= 1000; // 1km radius
        });

        nearbyLocations.forEach((l) => processed.add(l.id));

        clusters.push({
          id: `cluster_${lat}_${lng}`,
          area_name: `Area ${clusters.length + 1}`,
          center_lat: lat,
          center_lng: lng,
          radius_meters: 1000,
          tourist_count: nearbyLocations.length,
          risk_level:
            nearbyLocations.length > 10
              ? "high"
              : nearbyLocations.length > 5
              ? "medium"
              : "low",
          cluster_date: date || new Date().toISOString().split("T")[0],
          hourly_data: {},
          last_updated: new Date().toISOString(),
        });
      });

      return clusters;
    } catch (error) {
      console.error("Error fetching tourist clusters:", error);
      return [];
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async updateTouristClusters(): Promise<void> {
    // This is handled dynamically in getTouristClusters
    return Promise.resolve();
  }

  async getRiskZones(): Promise<RiskZone[]> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert geo_fences to risk zones format
      return (data || []).map((fence) => ({
        id: fence.id,
        name: fence.name,
        coordinates: Array.isArray(fence.coordinates)
          ? (fence.coordinates as Array<{ lat: number; lng: number }>)
          : [],
        risk_level: "medium" as const,
        risk_factors: fence.description ? [fence.description] : [],
        incident_count: 0,
        recommendations: fence.description || "Monitor this area",
        active: true,
      }));
    } catch (error) {
      console.error("Error fetching risk zones:", error);
      return [];
    }
  }

  async createRiskZone(
    riskZone: Omit<RiskZone, "id" | "incident_count" | "last_incident_date">
  ): Promise<RiskZone> {
    try {
      const { data, error } = await supabase
        .from("geo_fences")
        .insert([
          {
            name: riskZone.name,
            coordinates: riskZone.coordinates,
            type: "risk_zone",
            description: riskZone.recommendations,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        coordinates: data.coordinates as Array<{ lat: number; lng: number }>,
        risk_level: riskZone.risk_level,
        risk_factors: riskZone.risk_factors,
        incident_count: 0,
        recommendations: data.description || "",
        active: true,
      };
    } catch (error) {
      console.error("Error creating risk zone:", error);
      throw error;
    }
  }

  // Digital ID Records Management
  async getDigitalIDRecords(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ records: DigitalIDRecord[]; total: number }> {
    try {
      let query = supabase.from("digital_tourist_ids").select(
        `
          *,
          tourist_locations!inner(
            latitude,
            longitude,
            timestamp
          )
        `,
        { count: "exact" }
      );

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `tourist_name.ilike.%${filters.search}%,aadhaar_number.ilike.%${filters.search}%`
        );
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      // Process data to include current location and active alerts
      const processedData = await Promise.all(
        (data || []).map(async (record) => {
          // Get current location (most recent)
          const { data: locationData } = await supabase
            .from("tourist_locations")
            .select("latitude, longitude, timestamp")
            .eq("tourist_id", record.id)
            .order("timestamp", { ascending: false })
            .limit(1);

          // Get active alerts count
          const { count: alertsCount } = await supabase
            .from("sos_alerts")
            .select("*", { count: "exact", head: true })
            .eq("tourist_id", record.id)
            .eq("status", "active");

          return {
            ...record,
            status: record.status as "active" | "expired" | "revoked",
            emergency_contacts:
              (record.emergency_contacts as Record<string, unknown>) || {},
            current_location: locationData?.[0]
              ? {
                  lat: locationData[0].latitude,
                  lng: locationData[0].longitude,
                  timestamp: locationData[0].timestamp,
                }
              : undefined,
            active_alerts: alertsCount || 0,
          };
        })
      );

      return {
        records: processedData,
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching digital ID records:", error);
      return { records: [], total: 0 };
    }
  }

  async getDigitalIDRecord(id: string): Promise<DigitalIDRecord | null> {
    try {
      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        status: data.status as "active" | "expired" | "revoked",
        emergency_contacts:
          (data.emergency_contacts as Record<string, unknown>) || {},
      };
    } catch (error) {
      console.error("Error fetching digital ID record:", error);
      return null;
    }
  }

  // Alert History Management
  async getAlertHistory(filters?: {
    tourist_id?: string;
    status?: string;
    alert_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ alerts: AlertHistory[]; total: number }> {
    try {
      let query = supabase.from("sos_alerts").select(
        `
          *,
          digital_tourist_ids!inner(tourist_name)
        `,
        { count: "exact" }
      );

      // Apply filters
      if (filters?.tourist_id) {
        query = query.eq("tourist_id", filters.tourist_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.alert_type) {
        query = query.eq("alert_type", filters.alert_type);
      }
      if (filters?.date_from) {
        query = query.gte("timestamp", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("timestamp", filters.date_to);
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query.order("timestamp", {
        ascending: false,
      });

      if (error) throw error;

      // Process data to include response time calculation
      const processedData = (data || []).map((alert) => {
        let response_time;
        if (alert.status !== "active") {
          // Calculate response time based on updated_at vs timestamp
          const alertTime = new Date(alert.timestamp);
          const responseTime = new Date(alert.updated_at);
          response_time = Math.round(
            (responseTime.getTime() - alertTime.getTime()) / (1000 * 60)
          );
        }

        return {
          ...alert,
          alert_type: alert.alert_type as
            | "panic"
            | "medical"
            | "security"
            | "other",
          status: alert.status as "active" | "responded" | "resolved",
          tourist_name: (alert as DatabaseAlert).digital_tourist_ids
            ?.tourist_name,
          response_time,
        };
      });

      return {
        alerts: processedData,
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching alert history:", error);
      return { alerts: [], total: 0 };
    }
  }

  // Missing Persons and E-FIR Management (using sos_alerts with special metadata)
  async getMissingPersons(filters?: {
    status?: string;
    priority_level?: string;
    assigned_officer_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ cases: MissingPerson[]; total: number }> {
    try {
      let query = supabase.from("sos_alerts").select(
        `
          *,
          digital_tourist_ids!inner(tourist_name)
        `,
        { count: "exact" }
      );

      // Filter for missing person cases (special alert type)
      query = query.eq("alert_type", "other");

      // Apply additional filters
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query.order("timestamp", {
        ascending: false,
      });

      if (error) throw error;

      // Process data to match MissingPerson interface
      const processedData = (data || []).map(
        (alert): MissingPerson => ({
          id: alert.id,
          tourist_id: alert.tourist_id,
          reported_by_user_id: "system", // Default since we don't have this data
          case_number: `MP-${alert.id.substring(0, 8)}`,
          status: alert.status as
            | "active"
            | "investigating"
            | "found"
            | "closed",
          last_known_location: {
            lat: alert.latitude,
            lng: alert.longitude,
            address: alert.address || "Unknown location",
            timestamp: alert.timestamp,
          },
          last_contact_time: alert.timestamp,
          missing_since: alert.timestamp,
          description: alert.message,
          emergency_contacts: {},
          priority_level: "medium" as const,
          efir_generated: false,
          created_at: alert.created_at,
          updated_at: alert.updated_at,
          tourist_name: (alert as DatabaseAlert).digital_tourist_ids
            ?.tourist_name,
        })
      );

      return {
        cases: processedData,
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching missing persons:", error);
      return { cases: [], total: 0 };
    }
  }

  async createMissingPersonCase(
    caseData: Omit<
      MissingPerson,
      "id" | "case_number" | "efir_generated" | "created_at" | "updated_at"
    >
  ): Promise<MissingPerson> {
    try {
      // Create as special SOS alert
      const { data, error } = await supabase
        .from("sos_alerts")
        .insert([
          {
            tourist_id: caseData.tourist_id,
            latitude: caseData.last_known_location.lat,
            longitude: caseData.last_known_location.lng,
            address: caseData.last_known_location.address,
            alert_type: "other",
            status: caseData.status || "active",
            message: `Missing Person Case: ${
              caseData.description || "No description"
            }`,
            blockchain_hash: await this.generateBlockchainHash({
              tourist_id: caseData.tourist_id,
              timestamp: new Date().toISOString(),
              type: "missing_person",
            }),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Convert back to MissingPerson format
      return {
        id: data.id,
        tourist_id: data.tourist_id,
        reported_by_user_id: caseData.reported_by_user_id,
        case_number: `MP-${data.id.substring(0, 8)}`,
        status: data.status as "active" | "investigating" | "found" | "closed",
        last_known_location: {
          lat: data.latitude,
          lng: data.longitude,
          address: data.address || "Unknown location",
          timestamp: data.timestamp,
        },
        last_contact_time: caseData.last_contact_time,
        missing_since: caseData.missing_since,
        description: caseData.description,
        emergency_contacts: caseData.emergency_contacts,
        priority_level: caseData.priority_level,
        efir_generated: false,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("Error creating missing person case:", error);
      throw error;
    }
  }

  private async generateBlockchainHash(
    data: Record<string, unknown>
  ): Promise<string> {
    const { data: hash, error } = await supabase.rpc(
      "generate_blockchain_hash",
      {
        data: JSON.stringify(data),
      }
    );

    if (error) {
      // Fallback hash generation
      return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    return hash;
  }

  async generateEFIR(missingPersonId: string): Promise<{
    efir_number: string;
    case_details: Record<string, unknown>;
    generated_at: string;
  }> {
    try {
      // Get the missing person case details
      const { data: alert, error: alertError } = await supabase
        .from("sos_alerts")
        .select(
          `
          *,
          digital_tourist_ids!inner(*)
        `
        )
        .eq("id", missingPersonId)
        .single();

      if (alertError) throw alertError;

      // Generate E-FIR data
      const efirData = {
        efir_number: `EFIR-${Date.now()}-${missingPersonId.substring(0, 8)}`,
        case_details: {
          case_number: `MP-${missingPersonId.substring(0, 8)}`,
          tourist_details: alert.digital_tourist_ids,
          incident_details: {
            location: {
              latitude: alert.latitude,
              longitude: alert.longitude,
              address: alert.address,
            },
            timestamp: alert.timestamp,
            description: alert.message,
          },
          blockchain_hash: alert.blockchain_hash,
        },
        generated_at: new Date().toISOString(),
      };

      // Update the alert to mark E-FIR as generated
      await supabase
        .from("sos_alerts")
        .update({
          message: `${alert.message} | E-FIR Generated: ${efirData.efir_number}`,
        })
        .eq("id", missingPersonId);

      return efirData;
    } catch (error) {
      console.error("Error generating E-FIR:", error);
      throw error;
    }
  }

  async addCaseUpdate(
    update: Omit<CaseUpdate, "id" | "created_at">
  ): Promise<CaseUpdate> {
    try {
      // For now, create a simple log entry using geo_fences as a log table
      const { data, error } = await supabase
        .from("geo_fences")
        .insert([
          {
            name: `Case Update: ${update.title}`,
            type: "case_update",
            description: update.description,
            coordinates: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Convert to CaseUpdate format
      return {
        id: data.id,
        missing_person_case_id: update.missing_person_case_id,
        updated_by_user_id: update.updated_by_user_id,
        update_type: update.update_type,
        title: update.title,
        description: update.description,
        location: update.location,
        evidence_files: update.evidence_files,
        created_at: data.created_at,
        updated_by_name: update.title,
      };
    } catch (error) {
      console.error("Error adding case update:", error);
      throw error;
    }
  }

  async getCaseUpdates(missingPersonCaseId: string): Promise<CaseUpdate[]> {
    try {
      // For now, return empty array since we don't have a proper case_updates table
      // In a real implementation, you'd want to create a proper case_updates table
      return [];
    } catch (error) {
      console.error("Error fetching case updates:", error);
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToClusters(callback: (payload: PayloadData) => void) {
    return supabase
      .channel("tourist_clusters")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tourist_locations" },
        callback
      )
      .subscribe();
  }

  subscribeToMissingPersons(callback: (payload: PayloadData) => void) {
    return supabase
      .channel("missing_persons")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sos_alerts" },
        callback
      )
      .subscribe();
  }

  subscribeToAlerts(callback: (payload: PayloadData) => void) {
    return supabase
      .channel("sos_alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sos_alerts" },
        callback
      )
      .subscribe();
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<{
    total_tourists: number;
    active_alerts: number;
    missing_persons: number;
    risk_zones: number;
    response_time_avg: number;
    recent_incidents: number;
  }> {
    try {
      const [
        { count: totalTourists },
        { count: activeAlerts },
        { count: missingPersons },
        { count: riskZones },
        recentIncidents,
        responseTimeData,
      ] = await Promise.all([
        supabase
          .from("digital_tourist_ids")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("sos_alerts")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("sos_alerts")
          .select("*", { count: "exact", head: true })
          .eq("alert_type", "other"), // Missing persons
        supabase.from("geo_fences").select("*", { count: "exact", head: true }),
        supabase
          .from("sos_alerts")
          .select("*", { count: "exact", head: true })
          .gte(
            "timestamp",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          ),
        supabase
          .from("sos_alerts")
          .select("timestamp, updated_at")
          .neq("status", "active"),
      ]);

      // Calculate average response time
      let avgResponseTime = 0;
      if (responseTimeData.data && responseTimeData.data.length > 0) {
        const responseTimes = responseTimeData.data.map((alert) => {
          const alertTime = new Date(alert.timestamp);
          const responseTime = new Date(alert.updated_at);
          return (responseTime.getTime() - alertTime.getTime()) / (1000 * 60); // minutes
        });
        avgResponseTime =
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }

      return {
        total_tourists: totalTourists || 0,
        active_alerts: activeAlerts || 0,
        missing_persons: missingPersons || 0,
        risk_zones: riskZones || 0,
        response_time_avg: Math.round(avgResponseTime),
        recent_incidents: recentIncidents.count || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        total_tourists: 0,
        active_alerts: 0,
        missing_persons: 0,
        risk_zones: 0,
        response_time_avg: 0,
        recent_incidents: 0,
      };
    }
  }
}

export const policeDashboardService = new PoliceDashboardService();
