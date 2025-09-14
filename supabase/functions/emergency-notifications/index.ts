import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SOSAlert {
  tourist_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  alert_type: 'panic' | 'medical' | 'security' | 'other';
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method } = req
    const url = new URL(req.url)
    const segments = url.pathname.split('/')
    const action = segments[segments.length - 1]

    console.log(`Emergency notification action: ${action}`)

    if (method === 'POST' && action === 'sos') {
      const alertData: SOSAlert = await req.json()
      
      // Generate blockchain hash for the SOS alert
      const dataForHash = JSON.stringify({
        ...alertData,
        timestamp: Date.now()
      })

      const { data: hashResult } = await supabase
        .rpc('generate_blockchain_hash', { data: JSON.parse(dataForHash) })

      if (!hashResult) {
        throw new Error('Failed to generate blockchain hash')
      }

      // Get tourist information for emergency contacts
      const { data: touristData, error: touristError } = await supabase
        .from('digital_tourist_ids')
        .select('*')
        .eq('id', alertData.tourist_id)
        .single()

      if (touristError || !touristData) {
        return new Response(JSON.stringify({ error: 'Tourist not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Create SOS alert in database
      const { data: sosData, error: sosError } = await supabase
        .from('sos_alerts')
        .insert({
          tourist_id: alertData.tourist_id,
          latitude: alertData.latitude,
          longitude: alertData.longitude,
          address: alertData.address,
          alert_type: alertData.alert_type,
          message: alertData.message,
          blockchain_hash: hashResult,
          status: 'active'
        })
        .select()
        .single()

      if (sosError) {
        console.error('Error creating SOS alert:', sosError)
        return new Response(JSON.stringify({ error: sosError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Send notifications to emergency contacts
      const emergencyContacts = touristData.emergency_contacts || []
      const notificationPromises = []

      for (const contact of emergencyContacts) {
        // Mock SMS notification (would integrate with Twilio/AWS SNS in production)
        const smsNotification = {
          to: contact.phone,
          message: `EMERGENCY ALERT: ${touristData.tourist_name} has triggered an SOS alert of type ${alertData.alert_type}. Location: ${alertData.latitude}, ${alertData.longitude}. ${alertData.message || ''}`
        }
        
        // Mock email notification (would integrate with SendGrid/AWS SES in production)
        if (contact.email) {
          const emailNotification = {
            to: contact.email,
            subject: `EMERGENCY: SOS Alert for ${touristData.tourist_name}`,
            html: `
              <h2>Emergency SOS Alert</h2>
              <p><strong>Tourist:</strong> ${touristData.tourist_name}</p>
              <p><strong>Alert Type:</strong> ${alertData.alert_type}</p>
              <p><strong>Location:</strong> ${alertData.latitude}, ${alertData.longitude}</p>
              <p><strong>Address:</strong> ${alertData.address || 'Not available'}</p>
              <p><strong>Message:</strong> ${alertData.message || 'No additional message'}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p>Please contact local authorities immediately.</p>
            `
          }
          
          // Log the notification (in production, send via email service)
          console.log('Email notification:', emailNotification)
        }

        // Log the SMS notification (in production, send via SMS service)
        console.log('SMS notification:', smsNotification)
      }

      // Send browser push notification to authorities (mock)
      const pushNotification = {
        title: 'SOS Alert',
        body: `${touristData.tourist_name} - ${alertData.alert_type} alert`,
        icon: '/emergency-icon.png',
        data: {
          type: 'sos',
          tourist_id: alertData.tourist_id,
          alert_id: sosData.id,
          location: { lat: alertData.latitude, lng: alertData.longitude }
        }
      }

      console.log('SOS alert created and notifications sent:', sosData.id)
      return new Response(JSON.stringify({
        success: true,
        alert: sosData,
        notifications_sent: {
          sms: emergencyContacts.length,
          email: emergencyContacts.filter(c => c.email).length,
          push: 1
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'POST' && action === 'update-location') {
      const { tourist_id, latitude, longitude } = await req.json()

      if (!tourist_id || latitude === undefined || longitude === undefined) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Insert location update
      const { data, error } = await supabase
        .from('tourist_locations')
        .insert({
          tourist_id,
          latitude,
          longitude
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating location:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Check geo-fencing
      const { data: geoFences } = await supabase
        .from('geo_fences')
        .select('*')

      let alertTriggered = false
      if (geoFences) {
        for (const fence of geoFences) {
          const coordinates = fence.coordinates as Array<{lat: number, lng: number}>
          // Simple point-in-polygon check (simplified for demo)
          const isInside = coordinates.some(coord => 
            Math.abs(latitude - coord.lat) < 0.005 && 
            Math.abs(longitude - coord.lng) < 0.005
          )

          if (isInside && fence.type === 'danger') {
            // Trigger danger zone alert
            console.log(`Tourist ${tourist_id} entered danger zone: ${fence.name}`)
            alertTriggered = true
            break
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        location: data,
        geo_fence_alert: alertTriggered
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'PATCH' && action === 'resolve') {
      const { alert_id } = await req.json()

      const { data, error } = await supabase
        .from('sos_alerts')
        .update({ status: 'resolved' })
        .eq('id', alert_id)
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in emergency notifications:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})