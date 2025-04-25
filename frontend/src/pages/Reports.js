import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Select, { components } from "react-select";
import {
  fetchDistributors,
  fetchAgencies,
  fetchProducts,
  fetchSalesReps,
  fetchCustomers,
  fetchAreas
} from "../api";

const Reports = () => {
  const [distributors, setDistributors] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState([]);
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // Custom components for dropdowns
  const CheckboxOption = ({ innerProps, label, isSelected }) => (
    <div {...innerProps} style={{
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Checkbox type="checkbox" checked={isSelected} readOnly style={{ marginRight: '8px' }}/>
      {label}
    </div>
  );

  const CountValueContainer = ({ children, ...props }) => {
    const selectedCount = props.getValue().length;
    return (
      <div className="css-1hwfws3" style={{ paddingLeft: '8px' }}>
        {selectedCount > 0 ? `${selectedCount} ${props.selectProps.name || 'Items'} Selected` : props.selectProps.placeholder}
        {React.Children.map(children, child => 
          child && [0, 1].indexOf(child.type) === -1 ? child : null
        )}
      </div>
    );
  };

  const MenuWithSelectAll = ({ children, ...props }) => {
    const options = props.options;
    const allSelected = props.getValue().length === options.length;
    
    return (
      <components.MenuList {...props}>
        <div
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: props.isFocused ? '#f5f5f5' : 'white'
          }}
          onClick={() => {
            if (allSelected) {
              props.setValue([]);
            } else {
              props.setValue(options);
            }
          }}
        >
          <Checkbox type="checkbox" checked={allSelected} readOnly style={{ marginRight: '8px' }}/>
          {allSelected ? 'Deselect All' : 'Select All'}
        </div>
        {children}
      </components.MenuList>
    );
  };

  const dropdownComponents = {
    Option: CheckboxOption,
    ValueContainer: CountValueContainer,
    MenuList: MenuWithSelectAll,
    IndicatorSeparator: () => null
  };

  const dropdownStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '48px',
      border: '1px solid #ddd',
      '&:hover': {
        borderColor: '#C62828',
      },
    }),
    menu: provided => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#C62828' : state.isFocused ? '#FFEBEE' : 'white',
      color: state.isSelected ? 'white' : '#333',
      '&:active': {
        backgroundColor: state.isSelected ? '#C62828' : '#FFEBEE',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      display: 'none',
    }),
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsFetching(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          setIsFetching(false);
          return;
        }

        // Fetch all data in parallel
        const [
          distributorsData,
          agenciesData,
          productsData,
          salesRepsData,
          customersData,
          areasData
        ] = await Promise.all([
          fetchDistributors(token),
          fetchAgencies(token),
          fetchProducts(token),
          fetchSalesReps(token),
          fetchCustomers(token),
          fetchAreas(token)
        ]);

        setDistributors(distributorsData);
        setAgencies(agenciesData);
        setProducts(productsData);
        setSalesReps(salesRepsData);
        setCustomers(customersData);
        setAreas(areasData);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setError("Failed to fetch dropdown data. Please try again.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleDownloadReport = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Validate distributor selection
      if (!Array.isArray(selectedDistributor)) {
        throw new Error("Invalid distributor selection format");
      }

      if (selectedDistributor.length === 0) {
        throw new Error("Please select at least one distributor");
      }

      // Validate dates
      if (!fromDate || !toDate) {
        throw new Error("Both date fields are required");
      }

      if (new Date(fromDate) > new Date(toDate)) {
        throw new Error("From date cannot be later than To date");
      }

      // Prepare payload
      const payload = {
        distributor: selectedDistributor.map(d => d.name).join(";"),
        salesRep: selectedSalesRep?.name || null,
        agency: selectedAgencies.length > 0 ? selectedAgencies.map(a => a.name).join(";") : null,
        product: selectedProducts.length > 0 ? selectedProducts.map(p => p.name).join(";") : null,
        customer: selectedCustomers.length > 0 ? selectedCustomers.map(c => c.name).join(";") : null,
        area: selectedAreas.length > 0 ? selectedAreas.map(a => a.name).join(";") : null,
        fromDate: new Date(fromDate).toISOString().split('T')[0],
        toDate: new Date(toDate).toISOString().split('T')[0]
      };

      // Make the request
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/files/generate-report",
        payload,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500
        }
      );

      // Handle 400 errors
      if (response.status === 400) {
        const errorData = await response.data.text();
        throw new Error(errorData.message || "Invalid request parameters");
      }

      // Handle successful response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Report_${new Date().toISOString()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Report Generation Error:", {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setError(error.message || "Report generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReportsContainer>
      <ReportsCard>
        <ReportsHeader>
          <ReportsTitle>Generate Report</ReportsTitle>
          <ReportsSubtitle>Customize your report with filters</ReportsSubtitle>
        </ReportsHeader>

        {isFetching ? (
          <LoadingOverlay>
            <Spinner />
            Loading filter options...
          </LoadingOverlay>
        ) : (
          <ReportsContent>
            <FilterGroup>
              <FilterLabel>Distributor (Required)</FilterLabel>
              <StyledSelect
                name="Distributors"
                options={distributors.map(d => ({
                  value: d.id,
                  label: d.name,
                  original: d
                }))}
                value={selectedDistributor}
                onChange={(selectedOptions) => {
                  const selected = selectedOptions ? 
                    selectedOptions.map(option => ({
                      ...option.original,
                      id: option.value,
                      name: option.label
                    })) : [];
                  setSelectedDistributor(selected);
                }}
                placeholder="Select Distributor(s)"
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={dropdownComponents}
                styles={dropdownStyles}
                getOptionValue={(option) => option.value}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Sales Representative</FilterLabel>
              <StyledSelect
                name="Sales Rep"
                options={salesReps.map(s => ({ value: s.id, label: s.name }))}
                value={selectedSalesRep ? { value: selectedSalesRep.id, label: selectedSalesRep.name } : null}
                onChange={(selected) => setSelectedSalesRep(selected ? salesReps.find(s => s.id === selected.value) : null)}
                placeholder="Select Sales Rep"
                isSearchable
                isClearable
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={dropdownComponents}
                styles={dropdownStyles}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Agency</FilterLabel>
              <StyledSelect
                name="Agencies"
                options={agencies.map(a => ({ value: a.id, label: a.name }))}
                value={selectedAgencies}
                onChange={(selected) => setSelectedAgencies(selected || [])}
                placeholder="Select Agency(s)"
                isSearchable
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={dropdownComponents}
                styles={dropdownStyles}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Products</FilterLabel>
              <StyledSelect
                name="Products"
                options={products.map(p => ({ value: p.id, label: p.name }))}
                value={selectedProducts}
                onChange={(selected) => setSelectedProducts(selected || [])}
                placeholder="Select Product(s)"
                isSearchable
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={dropdownComponents}
                styles={dropdownStyles}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Customer</FilterLabel>
              <StyledSelect
                name="Customers"
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                value={selectedCustomers}
                onChange={(selected) => setSelectedCustomers(selected || [])}
                placeholder="Select Customer(s)"
                isSearchable
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={dropdownComponents}
                styles={dropdownStyles}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Area</FilterLabel>
              <StyledSelect
                name="Areas"
                options={areas.map(a => ({ value: a.id, label: a.name }))}
                value={selectedAreas}
                onChange={(selected) => setSelectedAreas(selected || [])}
                placeholder="Select Area(s)"
                isSearchable
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={dropdownComponents}
                styles={dropdownStyles}
              />
            </FilterGroup>

            <DateRangeGroup>
              <DateInputGroup>
                <FilterLabel>From Date (Required)</FilterLabel>
                <StyledDateInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </DateInputGroup>
              <DateInputGroup>
                <FilterLabel>To Date (Required)</FilterLabel>
                <StyledDateInput
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </DateInputGroup>
            </DateRangeGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <GenerateButton
              onClick={handleDownloadReport}
              disabled={isLoading || selectedDistributor.length === 0 || !fromDate || !toDate}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Generating Report...
                </>
              ) : (
                "Download Report"
              )}
            </GenerateButton>
          </ReportsContent>
        )}
      </ReportsCard>
    </ReportsContainer>
  );
};

// Styled components
const Checkbox = styled.input`
  margin-right: 8px;
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #555;
  gap: 1rem;
`;

const ReportsContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background-color: #F5F5F5;
`;

const ReportsCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const ReportsHeader = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #C62828, #EF5350);
  color: white;
`;

const ReportsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ReportsSubtitle = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const ReportsContent = styled.div`
  padding: 2rem;
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterLabel = styled.label`
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

const DateRangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DateInputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDateInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.3s ease;
  &:focus {
    border-color: #C62828;
    outline: none;
    box-shadow: 0 0 0 1px #C62828;
  }
`;

const GenerateButton = styled.button`
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

export default Reports;
 



// import React, { useState, useEffect } from "react";
// import styled from "styled-components";
// import axios from "axios";
// import Select from "react-select";

// import { 
//   fetchDistributors, 
//   fetchAgencies, 
//   fetchProducts, 
//   fetchSalesReps,
//   fetchCustomers,
//   fetchAreas 
// } from "../api";

// const Reports = () => {
//   const [distributors, setDistributors] = useState([]);
//   const [agencies, setAgencies] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [salesReps, setSalesReps] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [areas, setAreas] = useState([]);
  
//   const [selectedDistributor, setSelectedDistributor] = useState(null);
//   const [selectedAgencies, setSelectedAgencies] = useState([]);
//   const [selectedProducts, setSelectedProducts] = useState([]);
//   const [selectedSalesRep, setSelectedSalesRep] = useState(null);
//   const [selectedCustomers, setSelectedCustomers] = useState([]);
//   const [selectedAreas, setSelectedAreas] = useState([]);
  
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchDropdownData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           console.error("No token found in localStorage");
//           return;
//         }

//         const [
//           distributorsData, 
//           agenciesData, 
//           productsData, 
//           salesRepsData,
//           customersData,
//           areasData
//         ] = await Promise.all([
//           fetchDistributors(token),
//           fetchAgencies(token),
//           fetchProducts(token),
//           fetchSalesReps(token),
//           fetchCustomers(token),
//           fetchAreas(token)
//         ]);

//         setDistributors(distributorsData);
//         setAgencies(agenciesData);
//         setProducts(productsData);
//         setSalesReps(salesRepsData);
//         setCustomers(customersData);
//         setAreas(areasData.map(area => ({ id: area.name, name: area.name })));
//       } catch (error) {
//         console.error("Error fetching dropdown data:", error);
//         setError("Failed to fetch dropdown data. Please try again.");
//       }
//     };

//     fetchDropdownData();
//   }, []);

//   const handleSelectAll = (selectedOptions, setSelected, allOptions) => {
//     if (selectedOptions && selectedOptions.some(option => option.id === "all")) {
//       setSelected(allOptions.filter(option => option.id !== "all"));
//     } else {
//       setSelected(selectedOptions || []);
//     }
//   };

//   const handleDownloadReport = async () => {
//     try {
//       setIsLoading(true);
//       setError("");

//       if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
//         setError("From date cannot be later than To date");
//         setIsLoading(false);
//         return;
//       }

//       const payload = {
//         distributor: selectedDistributor ? selectedDistributor.name : "",
//         salesRep: selectedSalesRep ? selectedSalesRep.name : "",
//         agency: selectedAgencies.map(a => a.name).join(";"),
//         product: selectedProducts.map(p => p.name).join(","),
//         customer: selectedCustomers.map(c => c.name).join(","),
//         area: selectedAreas.map(a => a.name).join(","),
//         fromDate,
//         toDate,
//       };

//       const response = await axios.post(
//         "http://localhost:5000/api/files/generate-report",
//         payload,
//         {
//           responseType: "blob",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (response.data.size === 0) {
//         setError("No data found for the selected filters.");
//         setIsLoading(false);
//         return;
//       }

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "Distributor_Agency_Product_Report.pdf");
//       document.body.appendChild(link);
//       link.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(link);
//       setIsLoading(false);
//     } catch (error) {
//       setIsLoading(false);
//       console.error("Error downloading report.", error);
//       if (error.response) {
//         if (error.response.status === 404) {
//           setError("No data found for the given filters.");
//         } else if (error.response.status === 500) {
//           setError("An error occurred while generating the report. Please try again.");
//         } else {
//           setError(`Error: ${error.response.data.message || "Unknown error occurred."}`);
//         }
//       } else {
//         setError("Unable to connect to the server. Please check your network connection.");
//       }
//     }
//   };

//   return (
//     <ReportsContainer>
//       <ReportsCard>
//         <ReportsHeader>
//           <ReportsTitle>Generate Report</ReportsTitle>
//           <ReportsSubtitle>Customize your report with filters</ReportsSubtitle>
//         </ReportsHeader>
        
//         <ReportsContent>
//           <FilterRow>
//             <FilterGroup>
//               <FilterLabel>Distributor</FilterLabel>
//               <StyledSelect
//                 options={distributors}
//                 getOptionLabel={(e) => e.name}
//                 getOptionValue={(e) => e.id}
//                 value={selectedDistributor}
//                 onChange={(selectedOption) => setSelectedDistributor(selectedOption)}
//                 placeholder="Select Distributor"
//                 isSearchable
//                 styles={selectStyles}
//               />
//             </FilterGroup>
            
//             <FilterGroup>
//               <FilterLabel>Sales Representative</FilterLabel>
//               <StyledSelect
//                 options={salesReps}
//                 getOptionLabel={(e) => e.name}
//                 getOptionValue={(e) => e.id}
//                 value={selectedSalesRep}
//                 onChange={(selectedOption) => setSelectedSalesRep(selectedOption)}
//                 placeholder="Select Sales Rep"
//                 isSearchable
//                 styles={selectStyles}
//                 isClearable
//               />
//             </FilterGroup>
//           </FilterRow>
          
//           <FilterRow>
//             <FilterGroup>
//               <FilterLabel>Agency</FilterLabel>
//               <StyledSelect
//                 options={agencies}
//                 getOptionLabel={(e) => e.name}
//                 getOptionValue={(e) => e.id}
//                 value={selectedAgencies}
//                 onChange={(selectedOptions) =>
//                   handleSelectAll(selectedOptions, setSelectedAgencies, agencies)
//                 }
//                 placeholder="Select Agency(s)"
//                 isMulti
//                 isSearchable
//                 styles={selectStyles}
//               />
//             </FilterGroup>
            
//             <FilterGroup>
//               <FilterLabel>Product</FilterLabel>
//               <StyledSelect
//                 options={products}
//                 getOptionLabel={(e) => e.name}
//                 getOptionValue={(e) => e.id}
//                 value={selectedProducts}
//                 onChange={(selectedOptions) =>
//                   handleSelectAll(selectedOptions, setSelectedProducts, products)
//                 }
//                 placeholder="Select Product(s)"
//                 isMulti
//                 isSearchable
//                 styles={selectStyles}
//               />
//             </FilterGroup>
//           </FilterRow>
          
//           <FilterRow>
//             <FilterGroup>
//               <FilterLabel>Customer</FilterLabel>
//               <StyledSelect
//                 options={customers}
//                 getOptionLabel={(e) => e.name}
//                 getOptionValue={(e) => e.id}
//                 value={selectedCustomers}
//                 onChange={(selectedOptions) =>
//                   handleSelectAll(selectedOptions, setSelectedCustomers, customers)
//                 }
//                 placeholder="Select Customer(s)"
//                 isMulti
//                 isSearchable
//                 styles={selectStyles}
//               />
//             </FilterGroup>
            
//             <FilterGroup>
//               <FilterLabel>Area</FilterLabel>
//               <StyledSelect
//                 options={areas}
//                 getOptionLabel={(e) => e.name}
//                 getOptionValue={(e) => e.id}
//                 value={selectedAreas}
//                 onChange={(selectedOptions) =>
//                   handleSelectAll(selectedOptions, setSelectedAreas, areas)
//                 }
//                 placeholder="Select Area(s)"
//                 isMulti
//                 isSearchable
//                 styles={selectStyles}
//               />
//             </FilterGroup>
//           </FilterRow>
          
//           <DateRangeGroup>
//             <DateInputGroup>
//               <FilterLabel>From Date</FilterLabel>
//               <StyledDateInput
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 required
//               />
//             </DateInputGroup>
            
//             <DateInputGroup>
//               <FilterLabel>To Date</FilterLabel>
//               <StyledDateInput
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 required
//               />
//             </DateInputGroup>
//           </DateRangeGroup>
          
//           {error && <ErrorMessage>{error}</ErrorMessage>}
          
//           <GenerateButton
//             onClick={handleDownloadReport}
//             disabled={isLoading || !fromDate || !toDate}
//           >
//             {isLoading ? (
//               <>
//                 <Spinner />
//                 Generating Report...
//               </>
//             ) : (
//               "Download Report"
//             )}
//           </GenerateButton>
//         </ReportsContent>
//       </ReportsCard>
//     </ReportsContainer>
//   );
// };



// export default Reports;

// // Styled components
// const ReportsContainer = styled.div`
//   min-height: 100vh;
//   padding: 2rem;
//   background-color: #F5F5F5;
// `;

// const ReportsCard = styled.div`
//   max-width: 1000px;
//   margin: 0 auto;
//   background: white;
//   border-radius: 12px;
//   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
//   overflow: hidden;
// `;

// const ReportsHeader = styled.div`
//   padding: 1.5rem 2rem;
//   background: linear-gradient(135deg, #C62828, #EF5350);
//   color: white;
// `;

// const ReportsTitle = styled.h2`
//   font-size: 1.5rem;
//   font-weight: 600;
//   margin-bottom: 0.25rem;
// `;

// const ReportsSubtitle = styled.p`
//   font-size: 0.9rem;
//   opacity: 0.9;
// `;

// const ReportsContent = styled.div`
//   padding: 2rem;
// `;

// const FilterRow = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 1.5rem;
//   margin-bottom: 1.5rem;
  
//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }
// `;

// const FilterGroup = styled.div`
//   margin-bottom: 0;
// `;

// const FilterLabel = styled.label`
//   display: block;
//   font-size: 0.9rem;
//   font-weight: 500;
//   color: #555;
//   margin-bottom: 0.5rem;
// `;

// const StyledSelect = styled(Select)`
//   .react-select__control {
//     min-height: 48px;
//     border: 1px solid #ddd;
//     &:hover {
//       border-color: #C62828;
//     }
//   }
  
//   .react-select__control--is-focused {
//     border-color: #C62828;
//     box-shadow: 0 0 0 1px #C62828;
//   }
// `;

// const selectStyles = {
//   control: (provided) => ({
//     ...provided,
//     minHeight: '48px',
//     border: '1px solid #ddd',
//     '&:hover': {
//       borderColor: '#C62828',
//     },
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: state.isSelected ? '#C62828' : state.isFocused ? '#FFEBEE' : 'white',
//     color: state.isSelected ? 'white' : '#333',
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: '#FFEBEE',
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: '#C62828',
//   }),
// };

// const DateRangeGroup = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 1.5rem;
//   margin-bottom: 1.5rem;
  
//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }
// `;

// const DateInputGroup = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const StyledDateInput = styled.input`
//   width: 100%;
//   padding: 0.75rem 1rem;
//   font-size: 1rem;
//   border: 1px solid #ddd;
//   border-radius: 6px;
//   transition: all 0.3s ease;
  
//   &:focus {
//     border-color: #C62828;
//     outline: none;
//     box-shadow: 0 0 0 1px #C62828;
//   }
// `;

// const GenerateButton = styled.button`
//   width: 100%;
//   padding: 0.75rem;
//   font-size: 1rem;
//   font-weight: 500;
//   color: white;
//   background-color: #C62828;
//   border: none;
//   border-radius: 6px;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 0.5rem;
  
//   &:hover {
//     background-color: #EF5350;
//   }
  
//   &:disabled {
//     background-color: #B0BEC5;
//     cursor: not-allowed;
//   }
// `;

// const Spinner = styled.div`
//   width: 16px;
//   height: 16px;
//   border: 2px solid rgba(255, 255, 255, 0.3);
//   border-radius: 50%;
//   border-top-color: white;
//   animation: spin 1s ease-in-out infinite;
  
//   @keyframes spin {
//     to { transform: rotate(360deg); }
//   }
// `;

// const ErrorMessage = styled.div`
//   color: #D32F2F;
//   background-color: #FFEBEE;
//   padding: 0.75rem 1rem;
//   border-radius: 6px;
//   font-size: 0.9rem;
//   margin-bottom: 1.5rem;
//   text-align: center;
// `;

