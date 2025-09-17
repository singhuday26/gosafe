// Test Supabase Connection
// This file helps verify Supabase setup and provides examples for Copilot

import { supabase } from "@/lib/supabase";

export async function testSupabaseConnection() {
  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase connection error:", error);
      return {
        success: false,
        error: error.message,
        details: error.details || "No additional details available",
      };
    }

    console.log("✅ Supabase connection successful");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Supabase connection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: "Failed to establish connection to Supabase",
    };
  }
}

// Example queries for Copilot to learn from

// 1. Insert new user/profile (using current schema: user_id required, role not user_role)
export async function createUserProfile(userData: {
  user_id: string;
  full_name: string;
  phone_number?: string;
  role?: string;
  organization?: string;
}) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        user_id: userData.user_id,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        role: userData.role || "tourist",
        organization: userData.organization,
      },
    ])
    .select();

  return { data, error };
}

// 2. Create SOS Alert
export async function createSOSAlert(alertData: {
  tourist_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  alert_type: "panic" | "medical" | "security" | "other";
  message?: string;
}) {
  try {
    // Validate required fields
    if (
      !alertData.tourist_id ||
      typeof alertData.latitude !== "number" ||
      typeof alertData.longitude !== "number"
    ) {
      return {
        data: null,
        error: {
          message: "Missing required fields: tourist_id, latitude, longitude",
        },
      };
    }

    // Generate blockchain hash
    const { data: hashData, error: hashError } = await supabase.rpc(
      "generate_blockchain_hash",
      {
        data: JSON.stringify(alertData),
      }
    );

    if (hashError) {
      console.warn("Failed to generate blockchain hash:", hashError.message);
    }

    const { data, error } = await supabase
      .from("sos_alerts")
      .insert([
        {
          ...alertData,
          blockchain_hash: hashData || `hash_${Date.now()}`,
        },
      ])
      .select();

    return { data, error };
  } catch (error) {
    console.error("Error creating SOS alert:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Unknown error creating SOS alert",
      },
    };
  }
}

// 3. Get active SOS alerts
export async function getActiveSOSAlerts() {
  const { data, error } = await supabase
    .from("sos_alerts")
    .select(
      `
      *,
      digital_tourist_ids (
        tourist_name,
        aadhaar_number
      )
    `
    )
    .eq("status", "active")
    .order("timestamp", { ascending: false });

  return { data, error };
}

// 4. Update alert status
export async function updateAlertStatus(
  alertId: string,
  status: "active" | "responded" | "resolved"
) {
  const { data, error } = await supabase
    .from("sos_alerts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", alertId)
    .select();

  return { data, error };
}

// 5. Get tourist locations (last known positions)
export async function getTouristLocations(touristId?: string) {
  let query = supabase
    .from("tourist_locations")
    .select(
      `
      *,
      digital_tourist_ids (
        tourist_name,
        status
      )
    `
    )
    .order("timestamp", { ascending: false });

  if (touristId) {
    query = query.eq("tourist_id", touristId);
  }

  const { data, error } = await query.limit(100);
  return { data, error };
}

// 6. Create missing person case (using sos_alerts with special type)
interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export async function createMissingPersonCase(caseData: {
  tourist_id: string;
  reported_by_user_id: string;
  last_known_location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  last_contact_time: string;
  missing_since: string;
  description?: string;
  emergency_contacts: EmergencyContact[];
  priority_level?: "low" | "medium" | "high" | "critical";
}) {
  // Generate case number using timestamp
  const caseNumber = `MP${new Date().getFullYear()}${String(Date.now()).slice(
    -6
  )}`;

  // Generate blockchain hash for the case
  const { data: hashData } = await supabase.rpc("generate_blockchain_hash", {
    data: JSON.stringify({
      case_number: caseNumber,
      tourist_id: caseData.tourist_id,
      missing_since: caseData.missing_since,
    }),
  });

  const { data, error } = await supabase
    .from("sos_alerts")
    .insert([
      {
        tourist_id: caseData.tourist_id,
        latitude: caseData.last_known_location.lat,
        longitude: caseData.last_known_location.lng,
        address: caseData.last_known_location.address,
        alert_type: "missing_person",
        message: `Missing Person Case: ${caseNumber}. ${
          caseData.description || ""
        }. Emergency Contacts: ${caseData.emergency_contacts
          .map((c) => `${c.name} (${c.relation}): ${c.phone}`)
          .join(", ")}`,
        blockchain_hash: hashData || `mp_${Date.now()}`,
        status: "active",
      },
    ])
    .select();

  return { data, error };
}

// 7. Get tourist clusters for heat map (using tourist_locations data)
export async function getTouristClusters(date?: string) {
  let query = supabase
    .from("tourist_locations")
    .select(
      `
      *,
      digital_tourist_ids!inner(
        tourist_name,
        status
      )
    `
    )
    .eq("digital_tourist_ids.status", "active")
    .order("timestamp", { ascending: false });

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    query = query
      .gte("timestamp", startDate.toISOString())
      .lt("timestamp", endDate.toISOString());
  }

  const { data, error } = await query.limit(1000);
  return { data, error };
}

// 8. Real-time subscriptions example
interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  schema: string;
  table: string;
}

export function subscribeToSOSAlerts(
  callback: (payload: RealtimePayload) => void
) {
  return supabase
    .channel("sos_alerts_channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sos_alerts" },
      callback
    )
    .subscribe();
}

// 9. Search digital IDs
export async function searchDigitalIDs(searchTerm: string) {
  const { data, error } = await supabase
    .from("digital_tourist_ids")
    .select("*")
    .or(
      `tourist_name.ilike.%${searchTerm}%,aadhaar_number.ilike.%${searchTerm}%`
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return { data, error };
}

// 10. Get dashboard statistics
export async function getDashboardStats() {
  const [
    { count: totalTourists },
    { count: activeAlerts },
    { count: missingPersons },
    { count: geoFences },
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
      .eq("alert_type", "missing_person")
      .in("status", ["active"]),
    supabase.from("geo_fences").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalTourists: totalTourists || 0,
    activeAlerts: activeAlerts || 0,
    missingPersons: missingPersons || 0,
    riskZones: geoFences || 0,
  };
}
