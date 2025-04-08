// import React, { useState } from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Home from "./pages/Home";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";

// const App = () => {
//     const [token, setToken] = useState(localStorage.getItem("token"));

//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/login" element={<Login setToken={setToken} />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//             </Routes>
//         </Router>
//     );
// };

// export default App;

///////////////////////////////////////////////////////////////////////////////////////////



import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainDashboard from "./pages/MainDashboard";
import RemoveDashboard from "./pages/RemoveDashboard";
import Reports from "./pages/Reports";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/maindashboard" element={<MainDashboard />} />
        <Route path="/uploadDashboard" element={<Dashboard />} />
        <Route path="/removeDashboard" element={<RemoveDashboard />} />
        <Route path="/reports" element={<Reports />} /> 
      </Routes>
    </Router>
  );
};

export default App;
