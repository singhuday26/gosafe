import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface DigitalTouristID {
  tourist_name: string;
  aadhaar_number: string;
  passport_number?: string;
  trip_itinerary: string;
  emergency_contacts: EmergencyContact[];
  valid_from: string;
  valid_to: string;
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
    const action = segments[segments.length - 1];

    console.log(`Blockchain operation: ${action}`);

    if (method === "POST" && action === "create") {
      const touristData: DigitalTouristID = await req.json();

      // Generate blockchain hash using the database function
      const dataForHash = JSON.stringify({
        tourist_name: touristData.tourist_name,
        aadhaar_number: touristData.aadhaar_number,
        passport_number: touristData.passport_number,
        trip_itinerary: touristData.trip_itinerary,
        emergency_contacts: touristData.emergency_contacts,
        valid_from: touristData.valid_from,
        valid_to: touristData.valid_to,
        timestamp: Date.now(),
      });

      const { data: hashResult } = await supabase.rpc(
        "generate_blockchain_hash",
        { data: JSON.parse(dataForHash) }
      );

      if (!hashResult) {
        throw new Error("Failed to generate blockchain hash");
      }

      // Insert the digital ID
      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .insert({
          tourist_name: touristData.tourist_name,
          aadhaar_number: touristData.aadhaar_number,
          passport_number: touristData.passport_number,
          trip_itinerary: touristData.trip_itinerary,
          emergency_contacts: touristData.emergency_contacts,
          valid_from: touristData.valid_from,
          valid_to: touristData.valid_to,
          blockchain_hash: hashResult,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating digital ID:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Digital ID created successfully:", data.id);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "GET" && action === "verify") {
      const touristId = url.searchParams.get("id");

      if (!touristId) {
        return new Response(
          JSON.stringify({ error: "Tourist ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .select("*")
        .eq("id", touristId)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ valid: false, error: "Tourist ID not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if ID is expired
      const now = new Date();
      const validTo = new Date(data.valid_to);
      const isExpired = now > validTo;

      if (isExpired && data.status === "active") {
        // Update status to expired
        await supabase
          .from("digital_tourist_ids")
          .update({ status: "expired" })
          .eq("id", touristId);

        data.status = "expired";
      }

      return new Response(
        JSON.stringify({
          valid: data.status === "active",
          data: data,
          blockchain_verified: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (method === "PATCH" && action === "revoke") {
      const { tourist_id, reason } = await req.json();

      if (!tourist_id) {
        return new Response(
          JSON.stringify({ error: "Tourist ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .update({ status: "revoked" })
        .eq("id", tourist_id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Digital ID revoked:", tourist_id, "Reason:", reason);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in blockchain operations:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
