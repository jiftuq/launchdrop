import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import StoreBuilder from "./components/StoreBuilder";
import StorePreview from "./components/StorePreview";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/build/:storeId" element={<StoreBuilder />} />
      <Route path="/preview/:storeId" element={<StorePreview />} />
    </Routes>
  );
}
