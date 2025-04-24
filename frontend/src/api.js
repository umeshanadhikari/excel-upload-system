import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Register function for user registration
export const register = (userData) => {
  return axios.post(`${API_URL}/auth/register`, userData)
    .catch((err) => {
      console.error("Registration failed:", err);
      throw err; // Re-throw to handle it on the frontend
    });
};

// Login function for user authentication
export const login = (userData) => {
  return axios.post(`${API_URL}/auth/login`, userData)
    .catch((err) => {
      console.error("Login failed:", err);
      throw err; // Re-throw to handle it on the frontend
    });
};

// Upload file function that now includes dataSheetID and excelSheetName
export const uploadFile = (file, dataSheetID, token, excelSheetName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('dataSheetID', dataSheetID);
  formData.append('excelSheetName', excelSheetName);
  
  return axios.post(`${API_URL}/files/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  }).catch((err) => {
    console.error("File upload failed:", err);
    if (err.response) {
      console.error("Response error:", err.response.data);
    }
    throw err;
  });
};

// Fetch the next ExcelSheetID from the backend
export const getNextExcelSheetID = (token) => {
  return axios.get(`${API_URL}/files/next-excel-sheet-id`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((response) => response.data)
    .catch((err) => {
      console.error("Error fetching next ExcelSheetID:", err);
      throw err;
    });
};

// Fetch distributors
export const fetchDistributors = (token) => {
  return axios.get(`${API_URL}/files/distributors`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((response) => response.data)
    .catch((err) => {
      console.error("Error fetching distributors:", err.response?.data || err.message);
      throw err;
    });
};

export const fetchSalesReps = (token) => {
  return axios.get(`${API_URL}/files/sales-reps`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((response) => response.data)
    .catch((err) => {
      console.error("Error fetching sales reps:", err.response?.data || err.message);
      throw err;
    });
};

// Fetch agencies
export const fetchAgencies = (token) => {
  return axios.get(`${API_URL}/files/agencies`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((response) => response.data)
    .catch((err) => {
      console.error("Error fetching agencies:", err.response?.data || err.message);
      throw err;
    });
};

// Fetch products
export const fetchProducts = (token) => {
  return axios.get(`${API_URL}/files/products`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((response) => response.data)
    .catch((err) => {
      console.error("Error fetching products:", err.response?.data || err.message);
      throw err;
    });
};

// Fetch customers
export const fetchCustomers = (token) => {
  return axios.get(`${API_URL}/files/customers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((response) => response.data)
    .catch((err) => {
      console.error("Error fetching customers:", err.response?.data || err.message);
      throw err;
    });
};

// Fetch areas
export const fetchAreas = (token) => {
  return axios.get(`${API_URL}/files/areas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then((response) => response.data)
    .catch((err) => {
      console.error("Error fetching areas:", err.response?.data || err.message);
      throw err;
    });
};

// Function to remove an Excel sheet
export const removeExcelSheet = (ExcelSheetID, token) => {
  return axios.post(`${API_URL}/remove`, { ExcelSheetID }, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).catch((err) => {
    console.error("Error removing Excel sheet:", err);
    if (err.response) {
      console.error("Response error:", err.response.data);
    }
    throw err;
  });
};


// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';

// // Register function for user registration
// export const register = (userData) => {
//     return axios.post(`${API_URL}/auth/register`, userData)
//         .catch((err) => {
//             console.error("Registration failed:", err);
//             throw err;  // Re-throw to handle it on the frontend
//         });
// };

// // Login function for user authentication
// export const login = (userData) => {
//     return axios.post(`${API_URL}/auth/login`, userData)
//         .catch((err) => {
//             console.error("Login failed:", err);
//             throw err;  // Re-throw to handle it on the frontend
//         });
// };

// // Upload file function that now includes dataSheetID and excelSheetName
// export const uploadFile = (file, dataSheetID, token, excelSheetName) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('dataSheetID', dataSheetID); // Add dataSheetID to the form data
//     formData.append('excelSheetName', excelSheetName); // Add excelSheetName to the form data

//     return axios.post(`${API_URL}/files/upload`, formData, {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//         },
//     }).catch((err) => {
//         console.error("File upload failed:", err);
//         // You can inspect the error for more details
//         if (err.response) {
//             console.error("Response error:", err.response.data);
//         }
//         throw err;  // Re-throw to handle it on the frontend
//     });
// };

// // Fetch the next ExcelSheetID from the backend
// export const getNextExcelSheetID = (token) => {
//     return axios.get(`${API_URL}/files/next-excel-sheet-id`, {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//         },
//     }).then((response) => response.data)
//     .catch((err) => {
//         console.error("Error fetching next ExcelSheetID:", err);
//         throw err;  // Re-throw to handle it on the frontend
//     });
// };

// // Fetch distributors
// export const fetchDistributors = (token) => {
//     console.log("Fetching distributors with token:", token); // Debugging
//     return axios.get(`${API_URL}/files/distributors`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     }).then((response) => {
//       console.log("Distributors response:", response.data); // Debugging
//       return response.data;
//     }).catch((err) => {
//       console.error("Error fetching distributors:", err.response?.data || err.message);
//       throw err;
//     });
//   };


//   export const fetchSalesReps = (token) => {
//     console.log("Fetching sales reps with token:", token);
//     return axios.get(`${API_URL}/sales-reps`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     }).then((response) => {
//       console.log("Sales reps response:", response.data);
//       return response.data;
//     }).catch((err) => {
//       console.error("Error fetching sales reps:", err.response?.data || err.message);
//       throw err;
//     });
//   };


// // Fetch agencies
// export const fetchAgencies = (token) => {
//     console.log("Fetching agencies with token:", token); // Debugging
//     return axios.get(`${API_URL}/files/agencies`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     }).then((response) => {
//       console.log("Agencies response:", response.data); // Debugging
//       return response.data;
//     }).catch((err) => {
//       console.error("Error fetching agencies:", err.response?.data || err.message); // Log the error
//       throw err;
//     });
//   };

// // Fetch products
// export const fetchProducts = (token) => {
//     console.log("Fetching products with token:", token); // Debugging
//     return axios.get(`${API_URL}/files/products`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     }).then((response) => {
//       console.log("Products response:", response.data); // Debugging
//       return response.data;
//     }).catch((err) => {
//       console.error("Error fetching products:", err.response?.data || err.message); // Log the error
//       throw err;
//     });
//   };

//   export const fetchCustomers = (token) => {
//     return axios.get(`${API_URL}/files/customers`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     }).then((response) => {
//       return response.data;
//     }).catch((err) => {
//       console.error("Error fetching customers:", err.response?.data || err.message);
//       throw err;
//     });
//   };
  
//   export const fetchAreas = (token) => {
//     return axios.get(`${API_URL}/files/areas`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     }).then((response) => {
//       return response.data;
//     }).catch((err) => {
//       console.error("Error fetching areas:", err.response?.data || err.message);
//       throw err;
//     });
//   };

// // Function to remove an Excel sheet
// export const removeExcelSheet = (ExcelSheetID, token) => {
//     return axios.post(`${API_URL}/remove`, { ExcelSheetID }, {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//         },
//     }).catch((err) => {
//         console.error("Error removing Excel sheet:", err);
//         // Handle error response if available
//         if (err.response) {
//             console.error("Response error:", err.response.data);
//         }
//         throw err;  // Re-throw to handle it on the frontend
//     });
// };
