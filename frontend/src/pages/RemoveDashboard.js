import React, { useState, useEffect } from "react";
import Select from "react-select";
import styled from "styled-components";
import axios from "axios";

const RemoveDashboard = () => {
  const [excelSheets, setExcelSheets] = useState([]); // List of Excel sheets
  const [selectedSheet, setSelectedSheet] = useState(null); // Selected sheet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(""); // Success message

  // Fetch Excel sheets on component mount
  useEffect(() => {
    fetchExcelSheets();
  }, []);

  const fetchExcelSheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:5000/api/remove/get-excel-sheets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.length > 0) {
        const options = response.data.map((sheet) => ({
          value: sheet.ExcelSheetID, // Dropdown value
          label: `ID: ${sheet.ExcelSheetID} - ${sheet.ExcelSheetName} (Records: ${sheet.RecordsCount})`, // Dropdown label
        }));

        setExcelSheets(options); // Update dropdown state
      } else {
        setExcelSheets([]); // Set empty array if no data
      }
    } catch (error) {
      setError("Failed to load Excel sheets. Please try again.");
      console.error("Error fetching Excel sheets:", error); // Log full error in the console
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedSheet) {
      alert("Please select an Excel sheet.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");


    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/remove",
        { ExcelSheetID: selectedSheet.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message); // Show success message from backend
      setError("");


      // Reset form state and reload data
      setSelectedSheet(null);
      fetchExcelSheets();
    } catch (error) {
      console.error("Error removing Excel sheet:", error);

      if (error.response) {
        setError(error.response?.data?.error || "Failed to remove file. Check console for details.");
      } else {
        setError("An error occurred. Please try again.");
      }

      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Remove File</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      <Form>
        <Select
          placeholder={loading ? "Loading..." : "Search and Select Excel Sheet"}
          options={excelSheets} // Pass options to dropdown
          value={selectedSheet} // Bind selected value
          onChange={setSelectedSheet} // Handle selection
          isSearchable // Enable search functionality
          isDisabled={loading || excelSheets.length === 0}
        />
        <Button
          disabled={!selectedSheet || loading}
          onClick={handleRemove}
        >
          {loading ? "Removing..." : "Remove"}
        </Button>
      </Form>
    </Container>
  );
};

export default RemoveDashboard;

const Container = styled.div`
  text-align: center;
  margin-top: 50px;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #7b241c;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgb(0 0 0 / 30%);
  }
  &:disabled {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 1rem;
  margin-bottom: 10px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 10px;
`;




////////////////////////////////////////////////////////////////////




// import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import styled from "styled-components";
// import axios from "axios";

// const RemoveDashboard = () => {
//   const [excelSheets, setExcelSheets] = useState([]); // List of Excel sheets
//   const [selectedSheet, setSelectedSheet] = useState(null); // Selected sheet
//   const [sheetName, setSheetName] = useState(""); // Entered sheet name
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch Excel sheets on component mount
//   useEffect(() => {
//     fetchExcelSheets();
//   }, []);

//   const fetchExcelSheets = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const token = localStorage.getItem("token");

//       const response = await axios.get("http://localhost:5000/api/remove/get-excel-sheets", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       console.log("API Response:", response.data); // Debugging log

//       if (response.data.length > 0) {
//         const options = response.data.map((sheet) => ({
//           value: sheet.ExcelSheetID,  // Dropdown value
//           label: `${sheet.ExcelSheetName} (Records: ${sheet.RecordsCount})`, // Dropdown label
//         }));

//         console.log("Dropdown Options:", options); // Debugging log
//         setExcelSheets(options); // Update dropdown state
//       } else {
//         setExcelSheets([]); // Set empty array if no data
//       }
//     } catch (error) {
//       console.error("Error fetching Excel sheets:", error);
//       setError("Failed to load Excel sheets. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemove = async () => {
//     if (!selectedSheet || !sheetName) {
//       alert("Please select an Excel sheet and enter its name.");
//       return;
//     }

//     try {
//         const token = localStorage.getItem("token");
//         const response = await axios.post(
//           "http://localhost:5000/api/remove",
//           { ExcelSheetID: selectedSheet.value, ExcelSheetName: sheetName },
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//       alert(response.data.message);
//     setSelectedSheet(null);
//     setSheetName("");
//     fetchExcelSheets();
//   } catch (error) {
//     console.error("❌ Error removing file:", error.response?.data || error.message);
//     alert(error.response?.data?.error || "Failed to remove file. Check console for details.");
//   }
// };

//   return (
//     <Container>
//       <Title>Remove File</Title>
//       {error && <ErrorMessage>{error}</ErrorMessage>}
//       <Form>
//         <Select
//           placeholder={loading ? "Loading..." : "Search and Select Excel Sheet"}
//           options={excelSheets} // Pass options to dropdown
//           value={selectedSheet} // Bind selected value
//           onChange={setSelectedSheet} // Handle selection
//           isSearchable // Enable search functionality
//           isDisabled={loading || excelSheets.length === 0}
//         />
//         <Input
//           type="text"
//           placeholder="Enter Excel Sheet Name"
//           value={sheetName}
//           onChange={(e) => setSheetName(e.target.value)}
//         />
//         <Button
//           disabled={!selectedSheet || !sheetName}
//           onClick={handleRemove}
//         >
//           Remove
//         </Button>
//       </Form>
//     </Container>
//   );
// };

// export default RemoveDashboard;

// const Container = styled.div`
//   text-align: center;
//   margin-top: 50px;
// `;

// const Title = styled.h2`
//   font-size: 2rem;
//   margin-bottom: 20px;
// `;

// const Form = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// `;

// const Input = styled.input`
//   padding: 10px;
//   margin: 10px 0;
//   border: none;
//   border-radius: 5px;
//   font-size: 1rem;
//   box-shadow: 0 2px 5px rgb(0 0 0 / 20%);
// `;

// const Button = styled.button`
//   padding: 10px 20px;
//   margin-top: 20px;
//   background-color: #7b241c;
//   color: white;
//   border: none;
//   border-radius: 5px;
//   font-size: 1rem;
//   font-weight: bold;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   &:hover {
//     background-color: #c0392b;
//     transform: translateY(-2px);
//     box-shadow: 0 6px 15px rgb(0 0 0 / 30%);
//   }
//   &:disabled {
//     background-color: #ccc;
//     color: #666;
//     cursor: not-allowed;
//   }
// `;

// const ErrorMessage = styled.p`
//   color: red;
//   font-size: 1rem;
//   margin-bottom: 10px;
// `;
