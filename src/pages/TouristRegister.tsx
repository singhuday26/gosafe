import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Shield, ArrowLeft, UserCheck, FileText, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BlockchainService, DigitalTouristID, EmergencyContact } from "@/lib/blockchain";

const TouristRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedID, setGeneratedID] = useState<DigitalTouristID | null>(null);
  
  const [formData, setFormData] = useState({
    touristName: "",
    aadhaarNumber: "",
    passportNumber: "",
    tripItinerary: "",
    validFrom: "",
    validTo: "",
    emergencyContact1Name: "",
    emergencyContact1Relationship: "",
    emergencyContact1Phone: "",
    emergencyContact1Email: "",
    emergencyContact2Name: "",
    emergencyContact2Relationship: "",
    emergencyContact2Phone: "",
    emergencyContact2Email: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const emergencyContacts: EmergencyContact[] = [
        {
          name: formData.emergencyContact1Name,
          relationship: formData.emergencyContact1Relationship,
          phone: formData.emergencyContact1Phone,
          email: formData.emergencyContact1Email || undefined
        }
      ];

      if (formData.emergencyContact2Name) {
        emergencyContacts.push({
          name: formData.emergencyContact2Name,
          relationship: formData.emergencyContact2Relationship,
          phone: formData.emergencyContact2Phone,
          email: formData.emergencyContact2Email || undefined
        });
      }

      const blockchain = BlockchainService.getInstance();
      const digitalID = blockchain.generateDigitalID({
        touristName: formData.touristName,
        aadhaarNumber: formData.aadhaarNumber,
        passportNumber: formData.passportNumber || undefined,
        tripItinerary: formData.tripItinerary,
        emergencyContacts,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo)
      });

      setGeneratedID(digitalID);
      
      toast({
        title: "Digital Tourist ID Generated!",
        description: "Your blockchain-based Digital Tourist ID has been created successfully.",
      });

      // Store in localStorage for demo purposes
      localStorage.setItem('currentTouristId', digitalID.id);

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error generating your Digital Tourist ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedID) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full gradient-primary mb-4 mx-auto">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
            <p className="text-muted-foreground">Your Digital Tourist ID has been generated</p>
          </div>

          <Card className="gradient-card shadow-medium">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="mx-auto mb-4 bg-safety/10 text-safety border-safety/20">
                <Shield className="mr-1 h-3 w-3" />
                Blockchain Verified
              </Badge>
              <CardTitle className="text-2xl">Digital Tourist ID</CardTitle>
              <CardDescription>Valid for your entire trip duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tourist ID</Label>
                  <p className="font-mono text-sm bg-muted/50 p-2 rounded">{generatedID.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant="secondary" className="bg-safety/10 text-safety border-safety/20">
                    {generatedID.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tourist Name</Label>
                <p className="font-semibold">{generatedID.touristName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Valid From</Label>
                  <p>{generatedID.validFrom.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Valid To</Label>
                  <p>{generatedID.validTo.toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Blockchain Hash</Label>
                <p className="font-mono text-xs bg-muted/50 p-2 rounded break-all">
                  {generatedID.blockchainHash}
                </p>
              </div>

              <Separator />

              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/tourist')}
                  className="flex-1"
                >
                  Access Tourist Portal
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <Shield className="mr-2 h-4 w-4" />
            Blockchain Registration
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Generate Digital Tourist ID</h1>
          <p className="text-muted-foreground">
            Create your secure, blockchain-based digital identity for safe tourism
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Enter your basic details for identity verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="touristName">Full Name *</Label>
                  <Input
                    id="touristName"
                    placeholder="Enter your full name"
                    value={formData.touristName}
                    onChange={(e) => handleInputChange('touristName', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                    <Input
                      id="aadhaarNumber"
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportNumber">Passport Number (Optional)</Label>
                    <Input
                      id="passportNumber"
                      placeholder="Enter passport number"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Information */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-tourism" />
                  Trip Information
                </CardTitle>
                <CardDescription>
                  Provide your travel itinerary and validity period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tripItinerary">Trip Itinerary *</Label>
                  <Textarea
                    id="tripItinerary"
                    placeholder="Describe your travel plans, destinations, and activities..."
                    value={formData.tripItinerary}
                    onChange={(e) => handleInputChange('tripItinerary', e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">
                      <Calendar className="inline mr-1 h-4 w-4" />
                      Valid From *
                    </Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => handleInputChange('validFrom', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="validTo">
                      <Calendar className="inline mr-1 h-4 w-4" />
                      Valid To *
                    </Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => handleInputChange('validTo', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-danger" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>
                  Add emergency contacts for safety purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Contact */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Primary Emergency Contact *</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact1Name">Name</Label>
                      <Input
                        id="emergencyContact1Name"
                        placeholder="Contact name"
                        value={formData.emergencyContact1Name}
                        onChange={(e) => handleInputChange('emergencyContact1Name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact1Relationship">Relationship</Label>
                      <Input
                        id="emergencyContact1Relationship"
                        placeholder="e.g., Spouse, Parent"
                        value={formData.emergencyContact1Relationship}
                        onChange={(e) => handleInputChange('emergencyContact1Relationship', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact1Phone">Phone Number</Label>
                      <Input
                        id="emergencyContact1Phone"
                        placeholder="+91-XXXXX-XXXXX"
                        value={formData.emergencyContact1Phone}
                        onChange={(e) => handleInputChange('emergencyContact1Phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact1Email">Email (Optional)</Label>
                      <Input
                        id="emergencyContact1Email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.emergencyContact1Email}
                        onChange={(e) => handleInputChange('emergencyContact1Email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Secondary Contact */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Secondary Emergency Contact (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact2Name">Name</Label>
                      <Input
                        id="emergencyContact2Name"
                        placeholder="Contact name"
                        value={formData.emergencyContact2Name}
                        onChange={(e) => handleInputChange('emergencyContact2Name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact2Relationship">Relationship</Label>
                      <Input
                        id="emergencyContact2Relationship"
                        placeholder="e.g., Friend, Sibling"
                        value={formData.emergencyContact2Relationship}
                        onChange={(e) => handleInputChange('emergencyContact2Relationship', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact2Phone">Phone Number</Label>
                      <Input
                        id="emergencyContact2Phone"
                        placeholder="+91-XXXXX-XXXXX"
                        value={formData.emergencyContact2Phone}
                        onChange={(e) => handleInputChange('emergencyContact2Phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact2Email">Email (Optional)</Label>
                      <Input
                        id="emergencyContact2Email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.emergencyContact2Email}
                        onChange={(e) => handleInputChange('emergencyContact2Email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating Digital ID...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Generate Digital Tourist ID
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TouristRegister;