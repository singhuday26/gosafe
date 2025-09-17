import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Database, Wifi, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ConnectionStatus {
  connected: boolean;
  error?: string;
  tables?: string[];
  latency?: number;
}

export const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    const startTime = Date.now();

    try {
      // Test basic connection with error handling
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      const latency = Date.now() - startTime;

      if (error) {
        // Check if it's a "relation does not exist" error (tables not created yet)
        if (
          error.message.includes("relation") &&
          error.message.includes("does not exist")
        ) {
          setStatus({
            connected: true,
            error:
              "Tables not created yet. Connection successful but database schema needed.",
            latency,
          });
        } else {
          setStatus({
            connected: false,
            error: `Database error: ${error.message}${
              error.details ? ` (${error.details})` : ""
            }`,
            latency,
          });
        }
      } else {
        setStatus({
          connected: true,
          latency,
        });
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      setStatus({
        connected: false,
        error:
          error instanceof Error
            ? `Connection failed: ${error.message}`
            : "Unknown connection error - check your environment variables",
        latency,
      });
    }

    setTesting(false);
  };

  const checkTables = async () => {
    try {
      // Check for specific tables that exist in our schema
      const tables = [
        "profiles",
        "digital_tourist_ids",
        "sos_alerts",
        "tourist_locations",
        "geo_fences",
      ];
      const tableStatus = [];

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(
              table as
                | "profiles"
                | "digital_tourist_ids"
                | "sos_alerts"
                | "tourist_locations"
                | "geo_fences"
            )
            .select("*", { count: "exact", head: true })
            .limit(1);
          tableStatus.push(error ? `${table} (missing)` : `${table} (exists)`);
        } catch {
          tableStatus.push(`${table} (missing)`);
        }
      }

      setStatus((prev) => ({ ...prev, tables: tableStatus }));
    } catch (error) {
      console.error("Error checking tables:", error);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    if (status.connected) {
      checkTables();
    }
  }, [status.connected]);

  const createSampleData = async () => {
    try {
      // Try to insert sample data using correct schema
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            user_id: `test_user_${Date.now()}`,
            full_name: "Test User",
            role: "tourist",
            phone_number: "+1234567890",
          },
        ])
        .select();

      if (error) {
        alert(`Error creating sample data: ${error.message}`);
      } else {
        alert("Sample data created successfully!");
        testConnection(); // Refresh status
      }
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Test your Supabase database connection and setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {status.connected ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {status.connected ? "Connected" : "Connection Failed"}
              </p>
              {status.latency && (
                <p className="text-sm text-gray-500">
                  Latency: {status.latency}ms
                </p>
              )}
            </div>
          </div>
          <Badge
            variant={status.connected ? "default" : "destructive"}
            className={status.connected ? "bg-green-100 text-green-800" : ""}
          >
            {status.connected ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {status.error}
            </p>
            {status.error.includes("Tables not created") && (
              <div className="mt-2">
                <p className="text-xs text-yellow-700">
                  Your Supabase connection is working! You just need to create
                  the database tables. Go to your Supabase project → SQL Editor
                  and run the schema from SUPABASE_SETUP.md
                </p>
              </div>
            )}
          </div>
        )}

        {/* Environment Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Environment Configuration</h4>
          <div className="space-y-1 text-sm">
            <p>
              <strong>URL:</strong>{" "}
              {import.meta.env.VITE_SUPABASE_URL || "Not configured"}
            </p>
            <p>
              <strong>Key:</strong>{" "}
              {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                ? "✅ Configured"
                : "❌ Missing"}
            </p>
            <p>
              <strong>Project ID:</strong>{" "}
              {import.meta.env.VITE_SUPABASE_PROJECT_ID || "Not configured"}
            </p>
          </div>
        </div>

        {/* Table Status */}
        {status.tables && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Database Tables</h4>
            <div className="grid grid-cols-2 gap-2">
              {status.tables.map((table, index) => (
                <div key={index} className="flex items-center gap-2">
                  {table.includes("exists") ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">{table}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={testing} variant="outline">
            {testing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4 mr-2" />
            )}
            Test Connection
          </Button>

          {status.connected && (
            <Button onClick={createSampleData} variant="outline">
              Create Sample Data
            </Button>
          )}
        </div>

        {/* Quick Setup Links */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Quick Setup</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              1. Open your{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Supabase Dashboard
              </a>
            </p>
            <p>2. Go to your project → SQL Editor</p>
            <p>
              3. Run the schema from <code>SUPABASE_SETUP.md</code>
            </p>
            <p>4. Refresh this test to verify tables are created</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
