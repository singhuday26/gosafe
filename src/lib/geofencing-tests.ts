import * as turf from "@turf/turf";

// Test data for geofencing
const testGeofences = [
  {
    id: "danger-zone-1",
    name: "Riverbank Danger Zone",
    type: "danger",
    coordinates: {
      type: "Polygon",
      coordinates: [
        [
          [77.202, 28.61],
          [77.204, 28.61],
          [77.204, 28.612],
          [77.202, 28.612],
          [77.202, 28.61],
        ],
      ],
    },
  },
  {
    id: "restricted-zone-1",
    name: "Heritage Restricted Area",
    type: "restricted",
    coordinates: {
      type: "Polygon",
      coordinates: [
        [
          [77.208, 28.614],
          [77.21, 28.614],
          [77.21, 28.616],
          [77.208, 28.616],
          [77.208, 28.614],
        ],
      ],
    },
  },
  {
    id: "tourist-zone-1",
    name: "Safe Tourist Viewpoint",
    type: "tourist_zone",
    coordinates: {
      type: "Polygon",
      coordinates: [
        [
          [77.206, 28.618],
          [77.209, 28.618],
          [77.209, 28.62],
          [77.206, 28.62],
          [77.206, 28.618],
        ],
      ],
    },
  },
];

// Test point inside different zones
const testPoints = [
  {
    name: "Point in danger zone",
    coords: [77.203, 28.611],
    expectedZone: "danger-zone-1",
  },
  {
    name: "Point in restricted zone",
    coords: [77.209, 28.615],
    expectedZone: "restricted-zone-1",
  },
  {
    name: "Point in tourist zone",
    coords: [77.2075, 28.619],
    expectedZone: "tourist-zone-1",
  },
  { name: "Point outside all zones", coords: [77.2, 28.6], expectedZone: null },
];

// Function to check if point is inside geofence
function checkPointInGeofence(point: [number, number], geofence: any): boolean {
  try {
    const pointFeature = turf.point(point);
    const polygonFeature = turf.feature(geofence.coordinates);
    return turf.booleanPointInPolygon(pointFeature, polygonFeature);
  } catch (error) {
    console.error("Error checking point in geofence:", error);
    return false;
  }
}

// Function to get escalation type based on geofence
function getEscalationType(
  geofences: any[],
  point: [number, number]
): "ranger" | "police" {
  for (const geofence of geofences) {
    if (checkPointInGeofence(point, geofence)) {
      return geofence.type === "danger" ? "ranger" : "police";
    }
  }
  return "police"; // Default escalation
}

// Run tests
export function runGeofencingTests(): boolean {
  console.log("🧪 Running Geofencing Tests...");

  let allTestsPassed = true;

  // Test 1: Point-in-polygon detection
  console.log("\n1. Testing point-in-polygon detection:");
  for (const testPoint of testPoints) {
    let foundInZone = null;

    for (const geofence of testGeofences) {
      if (
        checkPointInGeofence(testPoint.coords as [number, number], geofence)
      ) {
        foundInZone = geofence.id;
        break;
      }
    }

    const passed = foundInZone === testPoint.expectedZone;
    console.log(
      `   ${passed ? "✅" : "❌"} ${testPoint.name}: Expected ${
        testPoint.expectedZone
      }, got ${foundInZone}`
    );

    if (!passed) allTestsPassed = false;
  }

  // Test 2: Escalation logic
  console.log("\n2. Testing escalation logic:");
  const escalationTests = [
    { point: [77.203, 28.611], expected: "ranger", zone: "danger zone" },
    { point: [77.209, 28.615], expected: "police", zone: "restricted zone" },
    { point: [77.2075, 28.619], expected: "police", zone: "tourist zone" },
    { point: [77.2, 28.6], expected: "police", zone: "outside all zones" },
  ];

  for (const test of escalationTests) {
    const escalation = getEscalationType(
      testGeofences,
      test.point as [number, number]
    );
    const passed = escalation === test.expected;
    console.log(
      `   ${passed ? "✅" : "❌"} ${test.zone}: Expected ${
        test.expected
      }, got ${escalation}`
    );

    if (!passed) allTestsPassed = false;
  }

  // Test 3: GeoJSON validation
  console.log("\n3. Testing GeoJSON validation:");
  const validationTests = [
    {
      name: "Valid polygon",
      geojson: testGeofences[0].coordinates,
      expected: true,
    },
    {
      name: "Invalid polygon - not closed",
      geojson: {
        type: "Polygon",
        coordinates: [
          [
            [77.202, 28.61],
            [77.204, 28.61],
            [77.204, 28.612],
            // Missing closing coordinate
          ],
        ],
      },
      expected: false,
    },
    {
      name: "Invalid type",
      geojson: { type: "Point", coordinates: [77.202, 28.61] },
      expected: false,
    },
  ];

  for (const test of validationTests) {
    const isValid = validateGeoJSONPolygon(test.geojson);
    const passed = isValid === test.expected;
    console.log(
      `   ${passed ? "✅" : "❌"} ${test.name}: Expected ${
        test.expected
      }, got ${isValid}`
    );

    if (!passed) allTestsPassed = false;
  }

  console.log(
    `\n${allTestsPassed ? "🎉 All tests passed!" : "⚠️  Some tests failed!"}`
  );
  return allTestsPassed;
}

// Validate GeoJSON polygon helper
function validateGeoJSONPolygon(geojson: any): boolean {
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

// Export test data for use in components
export { testGeofences, testPoints };

// Run tests when module is imported
if (typeof window !== "undefined") {
  console.log(
    "Geofencing module loaded - run runGeofencingTests() to test functionality"
  );
}
