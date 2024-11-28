import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import SpotTaxCalculator from "./components/SpotTaxCalculator";
import FuturesTaxCalculator from "./components/FuturesTaxCalculator";
import UploadTransactions from "./components/UploadTransactions";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spot-tax-calculator" element={<SpotTaxCalculator />} />
        <Route path="/futures-tax-calculator" element={<FuturesTaxCalculator />} />
        <Route path="/upload-transactions" element={<UploadTransactions />} />
      </Routes>
    </Router>
  );
};

export default App;
