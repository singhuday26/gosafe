import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/layouts/AuthLayout";
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
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";

// Indian phone validation: allow 10 digits starting 6-9 or +91 optional
const indianPhoneRegex = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(indianPhoneRegex, "Invalid Indian phone number"),
});

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contacts: z
    .array(contactSchema)
    .min(2, "Add at least 2 contacts")
    .max(3, "Maximum 3 contacts allowed"),
  documentFile: z.instanceof(File).optional(),
  confirm: z.boolean().refine((v) => v, "Please confirm your details"),
});

type FormValues = z.infer<typeof formSchema>;

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const defaultValues: FormValues = useMemo(
    () => ({
      fullName: "",
      email: "",
      password: "",
      contacts: [
        { name: "", phone: "" },
        { name: "", phone: "" },
      ],
      documentFile: undefined,
      confirm: false,
    }),
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const nextDisabled = useMemo(() => {
    if (step === 1) {
      const v = getValues();
      return (
        !v.fullName ||
        !v.email ||
        !v.password ||
        !!errors.fullName ||
        !!errors.email ||
        !!errors.password
      );
    }
    if (step === 2) {
      const v = getValues();
      return (
        v.contacts.filter((c) => c.name && c.phone).length < 2 ||
        !!errors.contacts
      );
    }
    if (step === 3) {
      const v = getValues();
      // document is optional, but if provided must be valid
      return !!errors.documentFile;
    }
    return false;
  }, [errors, getValues, step]);

  const onDropFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, JPG, PNG allowed",
          variant: "destructive",
        });
        setValue("documentFile", undefined, { shouldValidate: true });
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: "File too large",
          description: "Max size is 2MB",
          variant: "destructive",
        });
        setValue("documentFile", undefined, { shouldValidate: true });
        return;
      }
      setValue("documentFile", file, { shouldValidate: true });
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    },
    [setValue, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onDropFile(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
    [onDropFile]
  );

  const onBrowse = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onDropFile(file);
    },
    [onDropFile]
  );

  const addContact = () => {
    const contacts = [...getValues("contacts")];
    if (contacts.length < 3) {
      contacts.push({ name: "", phone: "" });
      setValue("contacts", contacts, { shouldValidate: true });
    }
  };

  const removeContact = (index: number) => {
    const contacts = [...getValues("contacts")];
    if (contacts.length > 2) {
      contacts.splice(index, 1);
      setValue("contacts", contacts, { shouldValidate: true });
    }
  };

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      setErrorMessage(null);
      const auth = AuthService.getInstance();

      // Optional upload
      let documentUrl: string | null = null;
      let documentHash: string | null = null;
      if (values.documentFile) {
        const { uploadDocument } = await import("../../lib/upload");
        const tmpUserId = crypto.randomUUID();
        const uploaded = await uploadDocument(values.documentFile, tmpUserId);
        documentUrl = uploaded.url;
        documentHash = uploaded.hash;
      }

      const contacts = values.contacts.map((c) => ({
        name: c.name.trim(),
        phone: c.phone.trim(),
      }));

      const result = await auth.registerTourist({
        email: values.email.trim(),
        password: values.password,
        name: values.fullName.trim(),
        role: "tourist",
        emergencyContactsJson: JSON.stringify(contacts),
        documentUrl: documentUrl || undefined,
        documentHash: documentHash || undefined,
      });

      // Persist minimal QR identifier; dashboard reads this
      const codeData = result.digitalId || result.id;
      localStorage.setItem("currentTouristId", codeData);
      localStorage.setItem("touristName", values.fullName);

      navigate("/tourist", {
        state: {
          justRegistered: true,
          qrValue: codeData,
          name: values.fullName,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setErrorMessage(message);
      setStep(4); // Keep on confirmation to show errors inline
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 4) * 100;

  const Summary = () => {
    const v = getValues();
    return (
      <div className="space-y-3">
        <div>
          <div className="text-sm text-muted-foreground">Full Name</div>
          <div className="font-medium">{v.fullName}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="font-medium">{v.email}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Contacts</div>
          <ul className="list-disc pl-5 space-y-1">
            {v.contacts.map((c, i) => (
              <li key={i}>
                <span className="font-medium">{c.name}</span> —{" "}
                <span className="tabular-nums">{c.phone}</span>
              </li>
            ))}
          </ul>
        </div>
        {previewUrl && (
          <div>
            <div className="text-sm text-muted-foreground">
              Document Preview
            </div>
            <img
              src={previewUrl}
              alt="Document preview"
              className="mt-2 max-h-48 rounded border"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthLayout>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Tourist Registration</CardTitle>
          <CardDescription>
            Complete your onboarding in a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="text-sm text-destructive" role="alert">
              {errorMessage}
            </div>
          )}
          <Progress value={progress} className="h-2" />

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="mb-0">Emergency Contacts (2–3)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                  disabled={getValues("contacts").length >= 3}
                >
                  Add Contact
                </Button>
              </div>
              {getValues("contacts").map((c, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label>Name</Label>
                    <Input
                      value={c.name}
                      onChange={(e) => {
                        const cs = [...getValues("contacts")];
                        cs[index].name = e.target.value;
                        setValue("contacts", cs, { shouldValidate: true });
                      }}
                    />
                  </div>
                  <div className="col-span-5">
                    <Label>Phone</Label>
                    <Input
                      value={c.phone}
                      onChange={(e) => {
                        const cs = [...getValues("contacts")];
                        cs[index].phone = e.target.value;
                        setValue("contacts", cs, { shouldValidate: true });
                      }}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeContact(index)}
                      disabled={getValues("contacts").length <= 2}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {errors.contacts && (
                <p className="text-sm text-destructive mt-1">
                  {errors.contacts.message as string}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Label id="doc-label">
                Document Upload (Passport/ID) — PDF/JPG/PNG, max 2MB
              </Label>
              <div
                ref={dropRef}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={onDrop}
                className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/30 cursor-pointer"
                aria-labelledby="doc-label"
                onClick={() =>
                  dropRef.current
                    ?.querySelector<HTMLInputElement>("input[type=file]")
                    ?.click()
                }
              >
                <p>Drag & drop your file here, or click to browse</p>
                <input
                  aria-label="Upload document"
                  type="file"
                  className="hidden"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={onBrowse}
                />
              </div>
              {previewUrl && (
                <div>
                  <div className="text-sm text-muted-foreground">Preview</div>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 max-h-48 rounded border"
                  />
                </div>
              )}
              {errors.documentFile && (
                <p className="text-sm text-destructive mt-1">
                  {errors.documentFile.message as string}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Summary />
              <div className="flex items-center gap-2">
                <input id="confirm" type="checkbox" {...register("confirm")} />
                <Label htmlFor="confirm">
                  I confirm the above details are correct.
                </Label>
              </div>
              {errors.confirm && (
                <p className="text-sm text-destructive mt-1">
                  {errors.confirm.message as string}
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 1 || isSubmitting}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={goNext} disabled={nextDisabled}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
