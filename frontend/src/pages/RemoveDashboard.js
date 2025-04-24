import React, { useState, useEffect } from "react";
import Select from "react-select";
import styled from "styled-components";
import axios from "axios";

const RemoveDashboard = () => {
  const [excelSheets, setExcelSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

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
          value: sheet.ExcelSheetID,
          label: `ID: ${sheet.ExcelSheetID} - ${sheet.ExcelSheetName} (Records: ${sheet.RecordsCount})`,
        }));
        setExcelSheets(options);
      } else {
        setExcelSheets([]);
      }
    } catch (error) {
      setError("Failed to load Excel sheets. Please try again.");
      console.error("Error fetching Excel sheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedSheet) {
      setError("Please select an Excel sheet.");
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

      setSuccess(response.data.message);
      setError("");
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
    <DashboardContainer>
      <DashboardCard>
        <DashboardHeader>
          <DashboardTitle>Remove File</DashboardTitle>
          <DashboardSubtitle>Select a file to remove from the system</DashboardSubtitle>
        </DashboardHeader>
        
        <DashboardContent>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <FormGroup>
            <FormLabel>Select Excel Sheet</FormLabel>
            <StyledSelect
              placeholder={loading ? "Loading..." : "Search and Select Excel Sheet"}
              options={excelSheets}
              value={selectedSheet}
              onChange={setSelectedSheet}
              isSearchable
              isDisabled={loading || excelSheets.length === 0}
              styles={selectStyles}
            />
          </FormGroup>
          
          <RemoveButton
            onClick={handleRemove}
            disabled={!selectedSheet || loading}
          >
            {loading ? (
              <>
                <Spinner />
                Removing...
              </>
            ) : (
              "Remove Selected File"
            )}
          </RemoveButton>
        </DashboardContent>
      </DashboardCard>
    </DashboardContainer>
  );
};

export default RemoveDashboard;

// Styled components
const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background-color: #F5F5F5;
`;

const DashboardCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #C62828, #EF5350);
  color: white;
`;

const DashboardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const DashboardSubtitle = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const DashboardContent = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
`;

const StyledSelect = styled(Select)`
  .react-select__control {
    min-height: 48px;
    border: 1px solid #ddd;
    &:hover {
      border-color: #C62828;
    }
  }
  
  .react-select__control--is-focused {
    border-color: #C62828;
    box-shadow: 0 0 0 1px #C62828;
  }
`;

const selectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '48px',
    border: '1px solid #ddd',
    '&:hover': {
      borderColor: '#C62828',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#C62828' : state.isFocused ? '#FFEBEE' : 'white',
    color: state.isSelected ? 'white' : '#333',
  }),
};

const RemoveButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: #C62828;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  &:hover {
    background-color: #EF5350;
  }
  &:disabled {
    background-color: #B0BEC5;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #D32F2F;
  background-color: #FFEBEE;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #388E3C;
  background-color: #E8F5E9;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;



// import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import styled from "styled-components";
// import axios from "axios";

// const RemoveDashboard = () => {
//   const [excelSheets, setExcelSheets] = useState([]); // List of Excel sheets
//   const [selectedSheet, setSelectedSheet] = useState(null); // Selected sheet
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(""); // Success message

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

//       if (response.data.length > 0) {
//         const options = response.data.map((sheet) => ({
//           value: sheet.ExcelSheetID, // Dropdown value
//           label: `ID: ${sheet.ExcelSheetID} - ${sheet.ExcelSheetName} (Records: ${sheet.RecordsCount})`, // Dropdown label
//         }));

//         setExcelSheets(options); // Update dropdown state
//       } else {
//         setExcelSheets([]); // Set empty array if no data
//       }
//     } catch (error) {
//       setError("Failed to load Excel sheets. Please try again.");
//       console.error("Error fetching Excel sheets:", error); // Log full error in the console
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemove = async () => {
//     if (!selectedSheet) {
//       alert("Please select an Excel sheet.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setSuccess("");


//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         "http://localhost:5000/api/remove",
//         { ExcelSheetID: selectedSheet.value },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setSuccess(response.data.message); // Show success message from backend
//       setError("");


//       // Reset form state and reload data
//       setSelectedSheet(null);
//       fetchExcelSheets();
//     } catch (error) {
//       console.error("Error removing Excel sheet:", error);

//       if (error.response) {
//         setError(error.response?.data?.error || "Failed to remove file. Check console for details.");
//       } else {
//         setError("An error occurred. Please try again.");
//       }

//       setSuccess("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container>
//       <Title>Remove File</Title>
//       {error && <ErrorMessage>{error}</ErrorMessage>}
//       {success && <SuccessMessage>{success}</SuccessMessage>}
//       <Form>
//         <Select
//           placeholder={loading ? "Loading..." : "Search and Select Excel Sheet"}
//           options={excelSheets} // Pass options to dropdown
//           value={selectedSheet} // Bind selected value
//           onChange={setSelectedSheet} // Handle selection
//           isSearchable // Enable search functionality
//           isDisabled={loading || excelSheets.length === 0}
//         />
//         <Button
//           disabled={!selectedSheet || loading}
//           onClick={handleRemove}
//         >
//           {loading ? "Removing..." : "Remove"}
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

// const SuccessMessage = styled.div`
//   color: green;
//   margin-top: 10px;
// `;

