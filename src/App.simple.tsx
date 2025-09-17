import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Minimal test app to isolate the issue
const TestHome = () => {
  console.log("TestHome: Rendering");
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">GoSafe Website</h1>
        <p className="text-lg text-gray-600">
          Website is working with Auth! 🎉
        </p>
        <p className="text-sm text-gray-500 mt-2">
          If you can see this, the React app, routing, and auth are loading
          properly.
        </p>
      </div>
    </div>
  );
};

const App = () => {
  console.log("App: Rendering - With Auth");
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TestHome />} />
          <Route path="*" element={<TestHome />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
