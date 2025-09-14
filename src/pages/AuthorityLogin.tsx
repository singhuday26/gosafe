import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AuthorityLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    department: "",
    station: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication - In real app, this would be proper auth
      if (formData.username && formData.password && formData.department) {
        // Store auth data for demo
        localStorage.setItem('authorityAuth', JSON.stringify({
          username: formData.username,
          department: formData.department,
          station: formData.station,
          loginTime: new Date().toISOString()
        }));

        toast({
          title: "Authentication Successful",
          description: `Welcome to the ${formData.department} Dashboard`,
        });

        navigate('/authority');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <span className="font-semibold">Authority Portal</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full gradient-primary mb-4 mx-auto">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Authority Login</h1>
            <p className="text-muted-foreground">
              Secure access for police and tourism officials
            </p>
            <Badge variant="outline" className="mt-4">
              Smart India Hackathon 2025
            </Badge>
          </div>

          <Card className="gradient-card shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Official Authentication
              </CardTitle>
              <CardDescription>
                Enter your official credentials to access the monitoring dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="police">Police Department</SelectItem>
                      <SelectItem value="tourism">Tourism Department</SelectItem>
                      <SelectItem value="home-affairs">Ministry of Home Affairs</SelectItem>
                      <SelectItem value="emergency">Emergency Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="station">Station/Office</Label>
                  <Input
                    id="station"
                    placeholder="e.g., Central Police Station, Tourism Office"
                    value={formData.station}
                    onChange={(e) => handleInputChange('station', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="username">Official ID / Username *</Label>
                  <Input
                    id="username"
                    placeholder="Enter your official ID"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-primary text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Demo Credentials:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Username:</strong> demo_officer</p>
                  <p><strong>Password:</strong> demo123</p>
                  <p><strong>Department:</strong> Any department</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;