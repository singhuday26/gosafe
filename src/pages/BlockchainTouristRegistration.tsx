import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Fingerprint,
  Globe,
  AlertTriangle,
  Loader2,
  CreditCard,
  Upload,
  Check,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { BlockchainService, DigitalTouristID } from "@/lib/blockchain";
import { useAuth } from "@/hooks/useAuth";
import LanguageSelector from "@/components/LanguageSelector";

// Validation schemas
const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^(?:\+?91[-\s]?)?[6-9]\d{9}$/, "Invalid Indian phone number"),
  nationality: z.string().min(1, "Nationality is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select gender" }),
  }),
  address: z
    .string()
    .min(10, "Full address is required (minimum 10 characters)"),
});

const blockchainInfoSchema = z
  .object({
    walletAddress: z.string().optional(),
    preferredBlockchain: z.enum(
      ["ethereum", "polygon", "binance", "generate_new"],
      {
        errorMap: () => ({ message: "Please select blockchain preference" }),
      }
    ),
    backupEmail: z.string().email("Valid backup email is required"),
    securityPin: z
      .string()
      .min(6, "Security PIN must be at least 6 digits")
      .max(8, "Security PIN cannot exceed 8 digits"),
    confirmSecurityPin: z.string(),
  })
  .refine((data) => data.securityPin === data.confirmSecurityPin, {
    message: "Security PINs don't match",
    path: ["confirmSecurityPin"],
  });

const documentSchema = z.object({
  documentType: z.enum(["aadhaar", "passport", "voter_id", "driving_license"], {
    errorMap: () => ({ message: "Please select document type" }),
  }),
  documentNumber: z.string().min(6, "Document number is required"),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar number must be 12 digits")
    .optional(),
  passportNumber: z.string().optional(),
  voterIdNumber: z.string().optional(),
  drivingLicenseNumber: z.string().optional(),
  documentFile: z.instanceof(File).optional(),
  documentBackFile: z.instanceof(File).optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(2, "Contact name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  phone: z
    .string()
    .regex(/^(?:\+?91[-\s]?)?[6-9]\d{9}$/, "Invalid Indian phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().min(5, "Contact address is required"),
});

const tripInfoSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  purpose: z.enum(
    ["tourism", "business", "education", "medical", "religious", "other"],
    {
      errorMap: () => ({ message: "Please select trip purpose" }),
    }
  ),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 day")
    .max(365, "Duration cannot exceed 365 days"),
  accommodation: z.string().min(1, "Accommodation details are required"),
  plannedActivities: z
    .string()
    .min(10, "Please provide planned activities (minimum 10 characters)"),
  estimatedBudget: z.string().min(1, "Estimated budget is required"),
  transportMode: z.enum(["flight", "train", "bus", "car", "other"], {
    errorMap: () => ({ message: "Please select transport mode" }),
  }),
});

const formSchema = z.object({
  personalInfo: personalInfoSchema,
  blockchainInfo: blockchainInfoSchema,
  documents: documentSchema,
  emergencyContacts: z
    .array(emergencyContactSchema)
    .min(2, "At least 2 emergency contacts required")
    .max(3, "Maximum 3 emergency contacts allowed"),
  tripInfo: tripInfoSchema,
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
  dataConsent: z
    .boolean()
    .refine((val) => val === true, "You must provide data consent"),
});

type FormData = z.infer<typeof formSchema>;

const BlockchainTouristRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedID, setGeneratedID] = useState<DigitalTouristID | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentBackPreview, setDocumentBackPreview] = useState<string | null>(
    null
  );

  const totalSteps = 7; // Personal Info, Blockchain Setup, Documents, Emergency Contacts, Trip Info, Review, Registration Complete

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        nationality: "",
        dateOfBirth: "",
        gender: undefined,
        address: "",
      },
      blockchainInfo: {
        walletAddress: "",
        preferredBlockchain: "generate_new",
        backupEmail: "",
        securityPin: "",
        confirmSecurityPin: "",
      },
      documents: {
        documentType: "aadhaar",
        documentNumber: "",
        aadhaarNumber: "",
        passportNumber: "",
        voterIdNumber: "",
        drivingLicenseNumber: "",
        documentFile: undefined,
        documentBackFile: undefined,
      },
      emergencyContacts: [
        { name: "", relationship: "", phone: "", email: "", address: "" },
        { name: "", relationship: "", phone: "", email: "", address: "" },
      ],
      tripInfo: {
        destination: "",
        purpose: undefined,
        duration: 1,
        accommodation: "",
        plannedActivities: "",
        estimatedBudget: "",
        transportMode: undefined,
      },
      termsAccepted: false,
      dataConsent: false,
    },
  });

  const watchedValues = watch();

  const progress = (currentStep / totalSteps) * 100;

  const nextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const addEmergencyContact = () => {
    const contacts = getValues("emergencyContacts");
    if (contacts.length < 3) {
      setValue("emergencyContacts", [
        ...contacts,
        { name: "", relationship: "", phone: "", email: "" },
      ]);
    }
  };

  const removeEmergencyContact = (index: number) => {
    const contacts = getValues("emergencyContacts");
    if (contacts.length > 2) {
      setValue(
        "emergencyContacts",
        contacts.filter((_, i) => i !== index)
      );
    }
  };

  const generateBlockchainID = async (
    formData: FormData
  ): Promise<DigitalTouristID> => {
    const blockchainService = BlockchainService.getInstance();

    // Prepare emergency contacts for blockchain
    const emergencyContacts = formData.emergencyContacts.map((contact) => ({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || undefined,
    }));

    // Create trip itinerary summary
    const tripItinerary = `Destination: ${formData.tripInfo.destination}, Purpose: ${formData.tripInfo.purpose}, Duration: ${formData.tripInfo.duration} days, Accommodation: ${formData.tripInfo.accommodation}, Activities: ${formData.tripInfo.plannedActivities}`;

    // Generate blockchain-based digital ID
    const digitalID = blockchainService.generateDigitalID({
      touristName: formData.personalInfo.fullName,
      aadhaarNumber: formData.documents.aadhaarNumber,
      passportNumber: formData.documents.passportNumber,
      tripItinerary,
      emergencyContacts,
      validFrom: new Date(),
      validTo: new Date(
        Date.now() + formData.tripInfo.duration * 24 * 60 * 60 * 1000
      ), // Duration in milliseconds
    });

    return digitalID;
  };

  const generateQRCode = (digitalID: DigitalTouristID): string => {
    // Create QR code data with blockchain hash and tourist info
    const qrData = {
      id: digitalID.id,
      name: digitalID.touristName,
      blockchainHash: digitalID.blockchainHash,
      validFrom: digitalID.validFrom.toISOString(),
      validTo: digitalID.validTo.toISOString(),
      status: digitalID.status,
    };

    // In a real implementation, you'd use a QR code library
    // For now, we'll return a mock QR code URL
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="12">
          ${digitalID.id}
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="monospace" font-size="8">
          Blockchain ID
        </text>
      </svg>
    `)}`;
  };

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      // Step 1: Generate Blockchain ID
      const digitalID = await generateBlockchainID(formData);
      setGeneratedID(digitalID);

      // Step 2: Generate QR Code
      const qrCodeUrl = generateQRCode(digitalID);
      setQrCode(qrCodeUrl);

      // Step 3: Register user with Supabase Auth
      const { error } = await signUp(
        formData.personalInfo.email,
        "temp_password_123", // This will be changed after email verification
        {
          full_name: formData.personalInfo.fullName,
          phone_number: formData.personalInfo.phone,
          role: "tourist",
          blockchain_id: digitalID.id,
          blockchain_hash: digitalID.blockchainHash,
        }
      );

      if (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }

      // Step 4: Move to success step
      setCurrentStep(totalSteps);

      toast({
        title: "Blockchain Registration Successful!",
        description:
          "Your digital tourist ID has been created and secured on the blockchain.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Personal Information
              </h3>
              <p className="text-muted-foreground">
                Enter your basic personal details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...register("personalInfo.fullName")}
                />
                {errors.personalInfo?.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.personalInfo.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("personalInfo.email")}
                />
                {errors.personalInfo?.email && (
                  <p className="text-sm text-destructive">
                    {errors.personalInfo.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  {...register("personalInfo.phone")}
                />
                {errors.personalInfo?.phone && (
                  <p className="text-sm text-destructive">
                    {errors.personalInfo.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  placeholder="Indian"
                  {...register("personalInfo.nationality")}
                />
                {errors.personalInfo?.nationality && (
                  <p className="text-sm text-destructive">
                    {errors.personalInfo.nationality.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("personalInfo.dateOfBirth")}
                />
                {errors.personalInfo?.dateOfBirth && (
                  <p className="text-sm text-destructive">
                    {errors.personalInfo.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  {...register("personalInfo.gender")}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.personalInfo?.gender && (
                  <p className="text-sm text-destructive">
                    {errors.personalInfo.gender.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Document Verification
              </h3>
              <p className="text-muted-foreground">
                Verify your identity with official documents
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <select
                  id="documentType"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  {...register("documents.documentType")}
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="passport">Passport</option>
                  <option value="both">Both Aadhaar and Passport</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                <Input
                  id="aadhaarNumber"
                  placeholder="1234 5678 9012"
                  maxLength={12}
                  {...register("documents.aadhaarNumber")}
                />
                {errors.documents?.aadhaarNumber && (
                  <p className="text-sm text-destructive">
                    {errors.documents.aadhaarNumber.message}
                  </p>
                )}
              </div>

              {watchedValues.documents?.documentType === "passport" && (
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    placeholder="A1234567"
                    {...register("documents.passportNumber")}
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Blockchain Security
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your documents will be cryptographically hashed and stored
                    on the blockchain for maximum security and privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Emergency Contacts</h3>
              <p className="text-muted-foreground">
                Add 2-3 emergency contacts for your safety
              </p>
            </div>

            <div className="space-y-4">
              {watchedValues.emergencyContacts?.map((contact, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Name *</Label>
                      <Input
                        placeholder="Full name"
                        {...register(`emergencyContacts.${index}.name`)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Relationship *</Label>
                      <Input
                        placeholder="e.g., Parent, Spouse, Friend"
                        {...register(`emergencyContacts.${index}.relationship`)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        placeholder="+91 98765 43210"
                        {...register(`emergencyContacts.${index}.phone`)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email (Optional)</Label>
                      <Input
                        type="email"
                        placeholder="contact@example.com"
                        {...register(`emergencyContacts.${index}.email`)}
                      />
                    </div>
                  </div>

                  {watchedValues.emergencyContacts &&
                    watchedValues.emergencyContacts.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => removeEmergencyContact(index)}
                      >
                        Remove Contact
                      </Button>
                    )}
                </Card>
              ))}

              {watchedValues.emergencyContacts &&
                watchedValues.emergencyContacts.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEmergencyContact}
                    className="w-full"
                  >
                    + Add Emergency Contact
                  </Button>
                )}

              {errors.emergencyContacts && (
                <p className="text-sm text-destructive">
                  {errors.emergencyContacts.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trip Information</h3>
              <p className="text-muted-foreground">
                Tell us about your travel plans
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Goa, Kerala, Delhi"
                  {...register("tripInfo.destination")}
                />
                {errors.tripInfo?.destination && (
                  <p className="text-sm text-destructive">
                    {errors.tripInfo.destination.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Trip Purpose *</Label>
                <select
                  id="purpose"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  {...register("tripInfo.purpose")}
                >
                  <option value="">Select Purpose</option>
                  <option value="tourism">Tourism</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
                {errors.tripInfo?.purpose && (
                  <p className="text-sm text-destructive">
                    {errors.tripInfo.purpose.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Trip Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="365"
                  {...register("tripInfo.duration", { valueAsNumber: true })}
                />
                {errors.tripInfo?.duration && (
                  <p className="text-sm text-destructive">
                    {errors.tripInfo.duration.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accommodation">Accommodation *</Label>
                <Input
                  id="accommodation"
                  placeholder="Hotel name, address, or type"
                  {...register("tripInfo.accommodation")}
                />
                {errors.tripInfo?.accommodation && (
                  <p className="text-sm text-destructive">
                    {errors.tripInfo.accommodation.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedActivities">Planned Activities *</Label>
              <textarea
                id="plannedActivities"
                className="w-full px-3 py-2 border border-input rounded-md min-h-[100px]"
                placeholder="Describe your planned activities, places to visit, etc."
                {...register("tripInfo.plannedActivities")}
              />
              {errors.tripInfo?.plannedActivities && (
                <p className="text-sm text-destructive">
                  {errors.tripInfo.plannedActivities.message}
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Review & Confirm</h3>
              <p className="text-muted-foreground">
                Please review your information before proceeding
              </p>
            </div>

            <div className="space-y-6">
              {/* Personal Info Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong>{" "}
                      {watchedValues.personalInfo?.fullName}
                    </div>
                    <div>
                      <strong>Email:</strong>{" "}
                      {watchedValues.personalInfo?.email}
                    </div>
                    <div>
                      <strong>Phone:</strong>{" "}
                      {watchedValues.personalInfo?.phone}
                    </div>
                    <div>
                      <strong>Nationality:</strong>{" "}
                      {watchedValues.personalInfo?.nationality}
                    </div>
                    <div>
                      <strong>Date of Birth:</strong>{" "}
                      {watchedValues.personalInfo?.dateOfBirth}
                    </div>
                    <div>
                      <strong>Gender:</strong>{" "}
                      {watchedValues.personalInfo?.gender}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Document Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <strong>Document Type:</strong>{" "}
                    {watchedValues.documents?.documentType}
                  </div>
                  <div className="text-sm">
                    <strong>Aadhaar:</strong>{" "}
                    {watchedValues.documents?.aadhaarNumber}
                  </div>
                  {watchedValues.documents?.passportNumber && (
                    <div className="text-sm">
                      <strong>Passport:</strong>{" "}
                      {watchedValues.documents?.passportNumber}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contacts Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {watchedValues.emergencyContacts?.map((contact, index) => (
                      <div key={index} className="text-sm border-b pb-2">
                        <div>
                          <strong>{contact.name}</strong> (
                          {contact.relationship})
                        </div>
                        <div>Phone: {contact.phone}</div>
                        {contact.email && <div>Email: {contact.email}</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trip Info Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trip Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Destination:</strong>{" "}
                      {watchedValues.tripInfo?.destination}
                    </div>
                    <div>
                      <strong>Purpose:</strong>{" "}
                      {watchedValues.tripInfo?.purpose}
                    </div>
                    <div>
                      <strong>Duration:</strong>{" "}
                      {watchedValues.tripInfo?.duration} days
                    </div>
                    <div>
                      <strong>Accommodation:</strong>{" "}
                      {watchedValues.tripInfo?.accommodation}
                    </div>
                  </div>
                  <div className="text-sm">
                    <strong>Activities:</strong>{" "}
                    {watchedValues.tripInfo?.plannedActivities}
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Consent */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="termsAccepted"
                        {...register("termsAccepted")}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor="termsAccepted" className="font-medium">
                          Terms and Conditions *
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          I agree to the terms of service and understand that my
                          data will be processed according to the privacy
                          policy.
                        </p>
                        {errors.termsAccepted && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.termsAccepted.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="dataConsent"
                        {...register("dataConsent")}
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor="dataConsent" className="font-medium">
                          Data Consent *
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          I consent to the collection and processing of my
                          personal data for emergency response and safety
                          monitoring purposes.
                        </p>
                        {errors.dataConsent && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.dataConsent.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-green-100 mb-4">
                <Fingerprint className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-700">
                Blockchain Registration Complete!
              </h3>
              <p className="text-muted-foreground">
                Your digital tourist ID has been successfully created
              </p>
            </div>

            {generatedID && (
              <div className="space-y-6">
                {/* Digital ID Card */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <Shield className="h-6 w-6 text-primary" />
                      <span>Digital Tourist ID</span>
                    </CardTitle>
                    <Badge variant="secondary" className="w-fit mx-auto">
                      Blockchain Secured
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>ID:</strong>
                        <div className="font-mono text-xs bg-muted p-2 rounded mt-1">
                          {generatedID.id}
                        </div>
                      </div>
                      <div>
                        <strong>Name:</strong>
                        <div className="font-medium">
                          {generatedID.touristName}
                        </div>
                      </div>
                      <div>
                        <strong>Valid From:</strong>
                        <div>{generatedID.validFrom.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <strong>Valid To:</strong>
                        <div>{generatedID.validTo.toLocaleDateString()}</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <strong>Blockchain Hash:</strong>
                      <div className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                        {generatedID.blockchainHash}
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        Verified & Secured
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* QR Code */}
                {qrCode && (
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center space-x-2">
                        <QrCode className="h-5 w-5" />
                        <span>Digital ID QR Code</span>
                      </CardTitle>
                      <CardDescription>
                        Scan this QR code for quick verification at checkpoints
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <img
                          src={qrCode}
                          alt="Digital ID QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Keep this QR code safe for emergency verification
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      What's Next?
                    </h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex items-start space-x-2">
                        <Mail className="h-4 w-4 mt-0.5 text-blue-600" />
                        <span>Check your email for account verification</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Globe className="h-4 w-4 mt-0.5 text-blue-600" />
                        <span>
                          Access your tourist dashboard after verification
                        </span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
                        <span>Your data is secured on the blockchain</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button onClick={() => navigate("/auth")} className="px-8">
                    Continue to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = (step: number) => {
    const titles = [
      "Personal Information",
      "Document Verification",
      "Emergency Contacts",
      "Trip Information",
      "Review & Confirm",
      "Blockchain Registration",
    ];
    return titles[step - 1] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <h1 className="text-lg font-bold">
                  Blockchain Tourist Registration
                </h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {getStepTitle(currentStep)}
              </h2>
              <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Step Content */}
          <Card className="shadow-lg">
            <CardContent className="p-8">{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation */}
          {currentStep < totalSteps && (
            <div className="flex items-center justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentStep < totalSteps - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Blockchain ID...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Generate Blockchain ID
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainTouristRegistration;
