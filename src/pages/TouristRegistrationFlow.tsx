import React, { useState, useCallback } from "react";
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
  CreditCard,
  Upload,
  Check,
  Camera,
  Fingerprint,
  Globe,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Save,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/LanguageSelector";
import TouristRegistrationService, {
  TouristRegistrationData,
} from "@/services/touristRegistrationService";

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
    preferredBlockchain: z.enum(
      ["ethereum", "polygon", "binance", "generate_new"],
      {
        errorMap: () => ({ message: "Please select blockchain preference" }),
      }
    ),
    walletAddress: z.string().optional(),
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

const formSchema = z.object({
  personalInfo: personalInfoSchema,
  blockchainInfo: blockchainInfoSchema,
  documents: documentSchema,
  emergencyContacts: z
    .array(emergencyContactSchema)
    .min(2, "At least 2 emergency contacts required")
    .max(3, "Maximum 3 emergency contacts allowed"),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
  dataConsent: z
    .boolean()
    .refine((val) => val === true, "You must provide data consent"),
});

type FormData = z.infer<typeof formSchema>;

const TouristRegistrationFlow: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedBlockchainId, setGeneratedBlockchainId] =
    useState<string>("");
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentBackPreview, setDocumentBackPreview] = useState<string | null>(
    null
  );
  const [showSecurityPin, setShowSecurityPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const totalSteps = 6; // Personal Info, Blockchain Setup, Document Upload, Emergency Contacts, Review & Submit, Completion

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        nationality: "Indian",
        dateOfBirth: "",
        gender: undefined,
        address: "",
      },
      blockchainInfo: {
        preferredBlockchain: "generate_new",
        walletAddress: "",
        backupEmail: "",
        securityPin: "",
        confirmSecurityPin: "",
      },
      documents: {
        documentType: "aadhaar",
        documentNumber: "",
        documentFile: undefined,
        documentBackFile: undefined,
      },
      emergencyContacts: [
        { name: "", relationship: "", phone: "", email: "", address: "" },
        { name: "", relationship: "", phone: "", email: "", address: "" },
      ],
      termsAccepted: false,
      dataConsent: false,
    },
  });

  const watchedValues = watch();
  const progress = (currentStep / totalSteps) * 100;

  const getStepTitle = (step: number): string => {
    const titles = {
      1: "Personal Information",
      2: "Blockchain Setup",
      3: "Identity Documents",
      4: "Emergency Contacts",
      5: "Review & Submit",
      6: "Registration Complete",
    };
    return titles[step as keyof typeof titles] || "";
  };

  const getStepIcon = (step: number) => {
    const icons = {
      1: <User className="h-6 w-6" />,
      2: <Fingerprint className="h-6 w-6" />,
      3: <CreditCard className="h-6 w-6" />,
      4: <Phone className="h-6 w-6" />,
      5: <CheckCircle className="h-6 w-6" />,
      6: <Shield className="h-6 w-6" />,
    };
    return icons[step as keyof typeof icons] || null;
  };

  const nextStep = async () => {
    let isStepValid = false;

    // Validate current step
    switch (currentStep) {
      case 1:
        isStepValid = await trigger("personalInfo");
        break;
      case 2:
        isStepValid = await trigger("blockchainInfo");
        break;
      case 3:
        isStepValid = await trigger("documents");
        break;
      case 4:
        isStepValid = await trigger("emergencyContacts");
        break;
      case 5:
        isStepValid = await trigger(["termsAccepted", "dataConsent"]);
        break;
      default:
        isStepValid = true;
    }

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
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
        { name: "", relationship: "", phone: "", email: "", address: "" },
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

  const handleFileUpload = useCallback(
    (file: File, type: "front" | "back") => {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (type === "front") {
            setDocumentPreview(result);
            setValue("documents.documentFile", file);
          } else {
            setDocumentBackPreview(result);
            setValue("documents.documentBackFile", file);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue]
  );

  const generateBlockchainId = () => {
    const formData = getValues();
    const baseString = `${formData.personalInfo.fullName}_${
      formData.personalInfo.email
    }_${Date.now()}`;
    const hash = btoa(baseString).slice(0, 16);
    const blockchainId = `BTC_${hash.toUpperCase()}`;
    setGeneratedBlockchainId(blockchainId);

    toast({
      title: "Blockchain ID Generated",
      description: `Your unique blockchain ID: ${blockchainId}`,
    });
  };

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.personalInfo.fullName ||
        !formData.personalInfo.email ||
        !formData.personalInfo.phone ||
        !formData.personalInfo.nationality ||
        !formData.personalInfo.dateOfBirth ||
        !formData.personalInfo.gender ||
        !formData.personalInfo.address
      ) {
        throw new Error("Please complete all personal information fields");
      }

      if (
        !formData.blockchainInfo.preferredBlockchain ||
        !formData.blockchainInfo.backupEmail ||
        !formData.blockchainInfo.securityPin
      ) {
        throw new Error("Please complete all blockchain information fields");
      }

      if (
        !formData.documents.documentType ||
        !formData.documents.documentNumber
      ) {
        throw new Error("Please complete all document information");
      }

      // Validate emergency contacts
      const validContacts = formData.emergencyContacts.filter(
        (contact) =>
          contact.name &&
          contact.relationship &&
          contact.phone &&
          contact.address
      );

      if (validContacts.length < 2) {
        throw new Error(
          "Please provide at least 2 complete emergency contacts"
        );
      }

      // Generate final blockchain ID if not already done
      if (!generatedBlockchainId) {
        generateBlockchainId();
      }

      // Prepare registration data with validated fields
      const registrationData: TouristRegistrationData = {
        personalInfo: {
          fullName: formData.personalInfo.fullName,
          email: formData.personalInfo.email,
          phone: formData.personalInfo.phone,
          nationality: formData.personalInfo.nationality,
          dateOfBirth: formData.personalInfo.dateOfBirth,
          gender: formData.personalInfo.gender,
          address: formData.personalInfo.address,
        },
        blockchainInfo: {
          preferredBlockchain: formData.blockchainInfo.preferredBlockchain,
          walletAddress: formData.blockchainInfo.walletAddress,
          backupEmail: formData.blockchainInfo.backupEmail,
          securityPin: formData.blockchainInfo.securityPin,
        },
        documents: {
          documentType: formData.documents.documentType,
          documentNumber: formData.documents.documentNumber,
          documentFile: formData.documents.documentFile,
          documentBackFile: formData.documents.documentBackFile,
        },
        emergencyContacts: validContacts.map((contact) => ({
          name: contact.name!,
          relationship: contact.relationship!,
          phone: contact.phone!,
          email: contact.email,
          address: contact.address!,
        })),
      };

      // Use the registration service
      const registrationService = TouristRegistrationService.getInstance();
      const touristProfile = await registrationService.registerTourist(
        registrationData
      );

      // Store registration data for the demo
      localStorage.setItem(
        "touristRegistration",
        JSON.stringify(registrationData)
      );
      localStorage.setItem("currentTouristId", touristProfile.id);
      localStorage.setItem("touristName", formData.personalInfo.fullName);

      // Update generated blockchain ID
      setGeneratedBlockchainId(touristProfile.blockchainId);

      // Move to completion step
      setCurrentStep(6);

      toast({
        title: "Registration Successful!",
        description: "Your digital tourist ID has been created successfully.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error ? error.message : "Please try again later.",
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
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                {getStepIcon(1)}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Personal Information
              </h3>
              <p className="text-muted-foreground">
                Enter your basic personal details for registration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name as per ID"
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
                <Select
                  value={watchedValues.personalInfo?.gender}
                  onValueChange={(value) =>
                    setValue(
                      "personalInfo.gender",
                      value as "male" | "female" | "other"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.personalInfo?.gender && (
                  <p className="text-sm text-destructive">
                    {errors.personalInfo.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter your complete address"
                rows={3}
                {...register("personalInfo.address")}
              />
              {errors.personalInfo?.address && (
                <p className="text-sm text-destructive">
                  {errors.personalInfo.address.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                {getStepIcon(2)}
              </div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Setup</h3>
              <p className="text-muted-foreground">
                Configure your blockchain digital identity
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Blockchain Preference *</Label>
                <Select
                  value={watchedValues.blockchainInfo?.preferredBlockchain}
                  onValueChange={(value) =>
                    setValue(
                      "blockchainInfo.preferredBlockchain",
                      value as
                        | "ethereum"
                        | "polygon"
                        | "binance"
                        | "generate_new"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose blockchain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate_new">
                      Generate New ID (Recommended)
                    </SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="binance">Binance Smart Chain</SelectItem>
                  </SelectContent>
                </Select>
                {errors.blockchainInfo?.preferredBlockchain && (
                  <p className="text-sm text-destructive">
                    {errors.blockchainInfo.preferredBlockchain.message}
                  </p>
                )}
              </div>

              {watchedValues.blockchainInfo?.preferredBlockchain !==
                "generate_new" && (
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">
                    Existing Wallet Address (Optional)
                  </Label>
                  <Input
                    id="walletAddress"
                    placeholder="0x..."
                    {...register("blockchainInfo.walletAddress")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="backupEmail">Backup Email *</Label>
                <Input
                  id="backupEmail"
                  type="email"
                  placeholder="backup@example.com"
                  {...register("blockchainInfo.backupEmail")}
                />
                {errors.blockchainInfo?.backupEmail && (
                  <p className="text-sm text-destructive">
                    {errors.blockchainInfo.backupEmail.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="securityPin">
                    Security PIN (6-8 digits) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="securityPin"
                      type={showSecurityPin ? "text" : "password"}
                      placeholder="Enter 6-8 digit PIN"
                      {...register("blockchainInfo.securityPin")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSecurityPin(!showSecurityPin)}
                    >
                      {showSecurityPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.blockchainInfo?.securityPin && (
                    <p className="text-sm text-destructive">
                      {errors.blockchainInfo.securityPin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmSecurityPin">
                    Confirm Security PIN *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmSecurityPin"
                      type={showConfirmPin ? "text" : "password"}
                      placeholder="Confirm your PIN"
                      {...register("blockchainInfo.confirmSecurityPin")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                    >
                      {showConfirmPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.blockchainInfo?.confirmSecurityPin && (
                    <p className="text-sm text-destructive">
                      {errors.blockchainInfo.confirmSecurityPin.message}
                    </p>
                  )}
                </div>
              </div>

              {watchedValues.blockchainInfo?.preferredBlockchain ===
                "generate_new" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Fingerprint className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Generate Blockchain ID
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        We'll create a unique blockchain-based digital identity
                        for you.
                      </p>
                    </div>
                  </div>
                  {!generatedBlockchainId && (
                    <Button
                      type="button"
                      onClick={generateBlockchainId}
                      className="mt-3"
                      size="sm"
                    >
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Generate ID Now
                    </Button>
                  )}
                  {generatedBlockchainId && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-green-800">
                        Generated ID:
                      </p>
                      <p className="font-mono text-sm text-green-700">
                        {generatedBlockchainId}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                {getStepIcon(3)}
              </div>
              <h3 className="text-xl font-semibold mb-2">Identity Documents</h3>
              <p className="text-muted-foreground">
                Upload your government-issued identification
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select
                  value={watchedValues.documents?.documentType}
                  onValueChange={(value) =>
                    setValue(
                      "documents.documentType",
                      value as
                        | "aadhaar"
                        | "passport"
                        | "voter_id"
                        | "driving_license"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="voter_id">Voter ID Card</SelectItem>
                    <SelectItem value="driving_license">
                      Driving License
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.documents?.documentType && (
                  <p className="text-sm text-destructive">
                    {errors.documents.documentType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">
                  {watchedValues.documents?.documentType === "aadhaar" &&
                    "Aadhaar Number *"}
                  {watchedValues.documents?.documentType === "passport" &&
                    "Passport Number *"}
                  {watchedValues.documents?.documentType === "voter_id" &&
                    "Voter ID Number *"}
                  {watchedValues.documents?.documentType ===
                    "driving_license" && "License Number *"}
                </Label>
                <Input
                  id="documentNumber"
                  placeholder={
                    watchedValues.documents?.documentType === "aadhaar"
                      ? "1234 5678 9012"
                      : watchedValues.documents?.documentType === "passport"
                      ? "A1234567"
                      : "Enter document number"
                  }
                  {...register("documents.documentNumber")}
                />
                {errors.documents?.documentNumber && (
                  <p className="text-sm text-destructive">
                    {errors.documents.documentNumber.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Upload Document (Front Side) *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "front");
                      }}
                      className="hidden"
                      id="documentFile"
                    />
                    <label htmlFor="documentFile" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or PDF (max 5MB)
                      </p>
                    </label>
                  </div>
                  {documentPreview && (
                    <div className="mt-2">
                      <img
                        src={documentPreview}
                        alt="Document preview"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Upload Document (Back Side)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "back");
                      }}
                      className="hidden"
                      id="documentBackFile"
                    />
                    <label
                      htmlFor="documentBackFile"
                      className="cursor-pointer"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or PDF (max 5MB)
                      </p>
                    </label>
                  </div>
                  {documentBackPreview && (
                    <div className="mt-2">
                      <img
                        src={documentBackPreview}
                        alt="Document back preview"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ensure your documents are clear, readable, and all corners are
                  visible. Your information will be verified and kept secure.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                {getStepIcon(4)}
              </div>
              <h3 className="text-xl font-semibold mb-2">Emergency Contacts</h3>
              <p className="text-muted-foreground">
                Add at least 2 emergency contacts for safety purposes
              </p>
            </div>

            <div className="space-y-6">
              {watchedValues.emergencyContacts?.map((contact, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">
                      Emergency Contact {index + 1}
                    </h4>
                    {watchedValues.emergencyContacts &&
                      watchedValues.emergencyContacts.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEmergencyContact(index)}
                        >
                          Remove
                        </Button>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Name *</Label>
                      <Input
                        placeholder="Full name"
                        value={contact.name}
                        onChange={(e) => {
                          const contacts = [...getValues("emergencyContacts")];
                          contacts[index].name = e.target.value;
                          setValue("emergencyContacts", contacts);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Relationship *</Label>
                      <Input
                        placeholder="e.g., Parent, Spouse, Friend"
                        value={contact.relationship}
                        onChange={(e) => {
                          const contacts = [...getValues("emergencyContacts")];
                          contacts[index].relationship = e.target.value;
                          setValue("emergencyContacts", contacts);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={contact.phone}
                        onChange={(e) => {
                          const contacts = [...getValues("emergencyContacts")];
                          contacts[index].phone = e.target.value;
                          setValue("emergencyContacts", contacts);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email (Optional)</Label>
                      <Input
                        type="email"
                        placeholder="contact@example.com"
                        value={contact.email}
                        onChange={(e) => {
                          const contacts = [...getValues("emergencyContacts")];
                          contacts[index].email = e.target.value;
                          setValue("emergencyContacts", contacts);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Address *</Label>
                    <Textarea
                      placeholder="Complete address"
                      rows={2}
                      value={contact.address}
                      onChange={(e) => {
                        const contacts = [...getValues("emergencyContacts")];
                        contacts[index].address = e.target.value;
                        setValue("emergencyContacts", contacts);
                      }}
                    />
                  </div>

                  {errors.emergencyContacts?.[index] && (
                    <div className="mt-2 text-sm text-destructive">
                      Please fill in all required fields for this contact.
                    </div>
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
                    <Phone className="mr-2 h-4 w-4" />
                    Add Another Emergency Contact
                  </Button>
                )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                {getStepIcon(5)}
              </div>
              <h3 className="text-xl font-semibold mb-2">Review & Submit</h3>
              <p className="text-muted-foreground">
                Please review your information before submitting
              </p>
            </div>

            <div className="space-y-4">
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
                      <span className="font-medium">Name:</span>{" "}
                      {watchedValues.personalInfo?.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {watchedValues.personalInfo?.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {watchedValues.personalInfo?.phone}
                    </div>
                    <div>
                      <span className="font-medium">Nationality:</span>{" "}
                      {watchedValues.personalInfo?.nationality}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Info Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blockchain Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>
                      <span className="font-medium">Blockchain:</span>{" "}
                      {watchedValues.blockchainInfo?.preferredBlockchain}
                    </div>
                    {generatedBlockchainId && (
                      <div>
                        <span className="font-medium">Generated ID:</span>{" "}
                        {generatedBlockchainId}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Backup Email:</span>{" "}
                      {watchedValues.blockchainInfo?.backupEmail}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identity Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div>
                      <span className="font-medium">Document Type:</span>{" "}
                      {watchedValues.documents?.documentType}
                    </div>
                    <div>
                      <span className="font-medium">Document Number:</span>{" "}
                      {watchedValues.documents?.documentNumber}
                    </div>
                    <div>
                      <span className="font-medium">Files Uploaded:</span>{" "}
                      {documentPreview ? "✓" : "✗"} Front{" "}
                      {documentBackPreview ? ", ✓ Back" : ""}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contacts Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  {watchedValues.emergencyContacts?.map((contact, index) => (
                    <div
                      key={index}
                      className="text-sm mb-2 pb-2 border-b last:border-b-0"
                    >
                      <div>
                        <span className="font-medium">{contact.name}</span> (
                        {contact.relationship})
                      </div>
                      <div>Phone: {contact.phone}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Terms and Consent */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={watchedValues.termsAccepted}
                    onCheckedChange={(checked) =>
                      setValue("termsAccepted", checked as boolean)
                    }
                  />
                  <Label htmlFor="termsAccepted" className="text-sm">
                    I agree to the{" "}
                    <span className="text-primary underline">
                      Terms and Conditions
                    </span>
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-sm text-destructive">
                    {errors.termsAccepted.message}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dataConsent"
                    checked={watchedValues.dataConsent}
                    onCheckedChange={(checked) =>
                      setValue("dataConsent", checked as boolean)
                    }
                  />
                  <Label htmlFor="dataConsent" className="text-sm">
                    I consent to the processing of my personal data for
                    registration and safety purposes
                  </Label>
                </div>
                {errors.dataConsent && (
                  <p className="text-sm text-destructive">
                    {errors.dataConsent.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex p-6 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold text-green-800">
              Registration Complete!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your digital tourist ID has been created successfully. You can now
              access all safety features.
            </p>

            {generatedBlockchainId && (
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Your Digital Tourist ID
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-mono text-lg font-bold text-center">
                      {generatedBlockchainId}
                    </p>
                  </div>
                  <Alert>
                    <Save className="h-4 w-4" />
                    <AlertDescription>
                      Save this ID securely. You'll need it to access your
                      tourist dashboard.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() =>
                  navigate("/tourist", {
                    state: {
                      justRegistered: true,
                      qrValue: generatedBlockchainId,
                      name: watchedValues.personalInfo?.fullName,
                    },
                  })
                }
                size="lg"
                className="px-8"
              >
                <Shield className="mr-2 h-5 w-5" />
                Access Tourist Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} size="lg">
                Back to Home
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <h1 className="text-lg font-bold">Tourist Registration</h1>
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
                {currentStep < 5 ? (
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
                        Creating Registration...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Complete Registration
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

export default TouristRegistrationFlow;
