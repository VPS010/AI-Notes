import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Dashboard from "./components/Dashboard";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </Router>
  );
};

export default App;
