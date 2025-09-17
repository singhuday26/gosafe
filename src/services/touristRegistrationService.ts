import { supabase } from "@/integrations/supabase/client";

export interface TouristRegistrationData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    nationality: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    address: string;
  };
  blockchainInfo: {
    preferredBlockchain: "ethereum" | "polygon" | "binance" | "generate_new";
    walletAddress?: string;
    backupEmail: string;
    securityPin: string;
  };
  documents: {
    documentType: "aadhaar" | "passport" | "voter_id" | "driving_license";
    documentNumber: string;
    documentFile?: File;
    documentBackFile?: File;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address: string;
  }>;
}

export interface DigitalTouristProfile {
  id: string;
  blockchainId: string;
  touristName: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  tripItinerary: string;
  emergencyContacts: EmergencyContact[];
  status: "active" | "pending_verification" | "expired" | "revoked";
  issuedAt: Date;
  validFrom: Date;
  validTo: Date;
  blockchainHash: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address: string;
}

export class TouristRegistrationService {
  private static instance: TouristRegistrationService;

  public static getInstance(): TouristRegistrationService {
    if (!TouristRegistrationService.instance) {
      TouristRegistrationService.instance = new TouristRegistrationService();
    }
    return TouristRegistrationService.instance;
  }

  /**
   * Generate a blockchain ID for the tourist
   */
  generateBlockchainId(
    personalInfo: TouristRegistrationData["personalInfo"]
  ): string {
    const timestamp = Date.now();
    const baseString = `${personalInfo.fullName}_${personalInfo.email}_${timestamp}`;
    const hash = btoa(baseString).replace(/[+/=]/g, "").slice(0, 16);
    return `BTC_${hash.toUpperCase()}`;
  }

  /**
   * Generate a secure blockchain hash
   */
  generateBlockchainHash(data: Record<string, unknown>): string {
    const jsonString = JSON.stringify(data);
    const timestamp = Date.now();
    const randomSalt = Math.random().toString(36).substring(2, 15);
    const combined = `${jsonString}_${timestamp}_${randomSalt}`;

    // Simple hash function (in production, use a proper cryptographic hash)
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16).padStart(16, "0");
  }

  /**
   * Hash security PIN (simple implementation - use bcrypt in production)
   */
  hashSecurityPin(pin: string): string {
    return btoa(pin + "security_salt").replace(/[+/=]/g, "");
  }

  /**
   * Upload document files to storage
   */
  async uploadDocuments(
    documentFile?: File,
    documentBackFile?: File,
    touristId?: string
  ): Promise<{
    frontUrl?: string;
    backUrl?: string;
  }> {
    const results: { frontUrl?: string; backUrl?: string } = {};

    try {
      if (documentFile && touristId) {
        const frontFileName = `${touristId}_document_front_${Date.now()}.${documentFile.name
          .split(".")
          .pop()}`;
        const { data: frontData, error: frontError } = await supabase.storage
          .from("documents")
          .upload(frontFileName, documentFile);

        if (frontError) {
          console.error("Front document upload error:", frontError);
        } else {
          const {
            data: { publicUrl: frontUrl },
          } = supabase.storage.from("documents").getPublicUrl(frontFileName);
          results.frontUrl = frontUrl;
        }
      }

      if (documentBackFile && touristId) {
        const backFileName = `${touristId}_document_back_${Date.now()}.${documentBackFile.name
          .split(".")
          .pop()}`;
        const { data: backData, error: backError } = await supabase.storage
          .from("documents")
          .upload(backFileName, documentBackFile);

        if (backError) {
          console.error("Back document upload error:", backError);
        } else {
          const {
            data: { publicUrl: backUrl },
          } = supabase.storage.from("documents").getPublicUrl(backFileName);
          results.backUrl = backUrl;
        }
      }
    } catch (error) {
      console.error("Document upload error:", error);
    }

    return results;
  }

  /**
   * Register a new tourist with complete information
   */
  async registerTourist(
    registrationData: TouristRegistrationData
  ): Promise<DigitalTouristProfile> {
    try {
      // Generate blockchain identifiers
      const blockchainId = this.generateBlockchainId(
        registrationData.personalInfo
      );
      const blockchainHash = this.generateBlockchainHash({
        ...registrationData.personalInfo,
        ...registrationData.documents,
        blockchainId,
        timestamp: Date.now(),
      });

      // Create a simplified trip itinerary from the registration data
      const tripItinerary = `Tourist from ${registrationData.personalInfo.nationality}. Contact: ${registrationData.personalInfo.phone}. Emergency contacts: ${registrationData.emergencyContacts.length} provided.`;

      // Prepare the record data to match current schema
      const touristRecord = {
        tourist_name: registrationData.personalInfo.fullName,
        aadhaar_number:
          registrationData.documents.documentType === "aadhaar"
            ? registrationData.documents.documentNumber
            : null,
        passport_number:
          registrationData.documents.documentType === "passport"
            ? registrationData.documents.documentNumber
            : null,
        trip_itinerary: tripItinerary,
        emergency_contacts: registrationData.emergencyContacts,
        blockchain_hash: blockchainHash,
        status: "active",
        valid_from: new Date().toISOString(),
        valid_to: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year from now
      };

      // Insert the record into the database
      const { data, error } = await supabase
        .from("digital_tourist_ids")
        .insert([touristRecord])
        .select()
        .single();

      if (error) {
        console.error("Database insert error:", error);
        throw new Error(`Registration failed: ${error.message}`);
      }

      // Store additional registration data in localStorage for now
      localStorage.setItem(
        `tourist_extended_${data.id}`,
        JSON.stringify(registrationData)
      );

      // Return the tourist profile
      return this.mapDatabaseRecordToProfile(data);
    } catch (error) {
      console.error("Tourist registration error:", error);
      throw error;
    }
  }

  /**
   * Get tourist by ID (simplified version)
   */
  async getTouristById(id: string): Promise<DigitalTouristProfile | null> {
    try {
      // For now, try to get from localStorage
      const extendedData = localStorage.getItem(`tourist_extended_${id}`);
      if (extendedData) {
        const data = JSON.parse(extendedData);
        // Create a mock profile from the stored data
        return {
          id: id,
          blockchainId: this.generateBlockchainId(data.personalInfo),
          touristName: data.personalInfo.fullName,
          aadhaarNumber:
            data.documents.documentType === "aadhaar"
              ? data.documents.documentNumber
              : undefined,
          passportNumber:
            data.documents.documentType === "passport"
              ? data.documents.documentNumber
              : undefined,
          tripItinerary: `Tourist from ${data.personalInfo.nationality}`,
          emergencyContacts: data.emergencyContacts,
          status: "active",
          issuedAt: new Date(),
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          blockchainHash: this.generateBlockchainHash(data),
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching tourist:", error);
      return null;
    }
  }

  /**
   * Verify security PIN
   */
  verifySecurityPin(inputPin: string, hashedPin: string): boolean {
    const hashedInput = this.hashSecurityPin(inputPin);
    return hashedInput === hashedPin;
  }

  /**
   * Map database record to DigitalTouristProfile
   */
  private mapDatabaseRecordToProfile(
    record: Record<string, unknown>
  ): DigitalTouristProfile {
    return {
      id: record.id as string,
      blockchainId: record.blockchain_hash as string, // Using blockchain_hash as ID for now
      touristName: record.tourist_name as string,
      aadhaarNumber: record.aadhaar_number as string,
      passportNumber: record.passport_number as string,
      tripItinerary: record.trip_itinerary as string,
      emergencyContacts:
        (record.emergency_contacts as EmergencyContact[]) || [],
      status:
        (record.status as
          | "active"
          | "pending_verification"
          | "expired"
          | "revoked") || "active",
      issuedAt: new Date(record.issued_at as string),
      validFrom: new Date(record.valid_from as string),
      validTo: new Date(record.valid_to as string),
      blockchainHash: record.blockchain_hash as string,
    };
  }

  /**
   * Validate Aadhaar number format
   */
  validateAadhaarNumber(aadhaar: string): boolean {
    return /^\d{12}$/.test(aadhaar.replace(/\s/g, ""));
  }

  /**
   * Validate passport number format
   */
  validatePassportNumber(passport: string): boolean {
    return /^[A-Z][0-9]{7}$/.test(passport.toUpperCase());
  }

  /**
   * Format document number for display
   */
  formatDocumentNumber(documentType: string, documentNumber: string): string {
    if (documentType === "aadhaar") {
      return documentNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
    }
    return documentNumber;
  }
}

export default TouristRegistrationService;
