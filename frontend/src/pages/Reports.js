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
     const [selectedSalesRep, setSelectedSalesRep] = useState([]);
     const [selectedCustomers, setSelectedCustomers] = useState([]);
     const [selectedAreas, setSelectedAreas] = useState([]);
     const [fromDate, setFromDate] = useState("");
     const [toDate, setToDate] = useState("");
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState("");
     const [isFetching, setIsFetching] = useState(false);
 
     // Custom dropdown components (unchanged from original)
     const CheckboxOption = ({ innerProps, label, isSelected }) => (
         <div {...innerProps} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
             <input type="checkbox" checked={isSelected} readOnly style={{ marginRight: '8px' }} />
             {label}
         </div>
     );
 
     const CountValueContainer = ({ children, ...props }) => {
         const selectedCount = props.getValue().length;
         return (
             <div style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                 {selectedCount > 0 ? `${selectedCount} selected` : props.selectProps.placeholder}
                 {React.Children.toArray(children).find(child => child && child.type === Input)}
             </div>
         );
     };
 
     const Input = (props) => <components.Input {...props} />;
 
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
                             props.setValue(options.filter(opt => opt.value !== "all"));
                         }
                     }}
                 >
                     <input type="checkbox" checked={allSelected} readOnly style={{ marginRight: '8px' }} />
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
         IndicatorSeparator: () => null,
         Input: Input
     };
 
     const customStyles = {
         control: (provided) => ({
             ...provided,
             minHeight: '48px',
             border: '1px solid #ddd',
             '&:hover': {
                 borderColor: '#C62828',
             }
         }),
         menu: (provided) => ({
             ...provided,
             zIndex: 9999,
         }),
         option: (provided, state) => ({
             ...provided,
             backgroundColor: state.isSelected ? '#C62828' : state.isFocused ? '#FFEBEE' : 'white',
             color: state.isSelected ? 'white' : '#333',
             '&:active': {
                 backgroundColor: state.isSelected ? '#C62828' : '#FFEBEE',
             }
         }),
         multiValue: () => ({
             display: 'none'
         }),
         input: (provided) => ({
             ...provided,
             padding: '8px',
             width: '100%'
         }),
         multiValueLabel: (provided) => ({
             ...provided,
             color: '#C62828',
             fontWeight: '500',
         }),
         multiValueRemove: (provided) => ({
             ...provided,
             color: '#C62828',
             ':hover': {
                 backgroundColor: '#EF5350',
                 color: 'white',
             }
         })
     };
 
     useEffect(() => {
         const fetchDropdownData = async () => {
             try {
                 setIsFetching(true);
                 const token = localStorage.getItem("token");
                 if (!token) {
                     console.error("No token found in localStorage");
                     return;
                 }
 
                 const [
                     distributorsData,
                     agenciesData,
                     productsData,
                     salesRepsData,
                     customersData,
                     areasData
                 ] = await Promise.all([
                     fetchDistributors(token).then(res => Array.isArray(res) ? res : []),
                     fetchAgencies(token).then(res => Array.isArray(res) ? res : []),
                     fetchProducts(token).then(res => Array.isArray(res) ? res : []),
                     fetchSalesReps(token).then(res => Array.isArray(res) ? res : []),
                     fetchCustomers(token).then(res => Array.isArray(res) ? res : []),
                     fetchAreas(token).then(res => Array.isArray(res) ? res.map(area => ({ id: area.name, name: area.name })) : [])
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
 
             
        // Validate required fields
        if (!fromDate || !toDate) {
          setError("Please select both From Date and To Date");
          setIsLoading(false);
          return;
      }

      if (new Date(fromDate) > new Date(toDate)) {
          setError("From date cannot be later than To date");
          setIsLoading(false);
          return;
      }

      console.log("Preparing payload with selections:", {
        distributor: selectedDistributor,
        salesRep: selectedSalesRep,
        agency: selectedAgencies,
        product: selectedProducts,
        customer: selectedCustomers,
        area: selectedAreas,
        fromDate,
        toDate,
    });

    // Prepare payload
    const payload = {
        distributor: selectedDistributor.length > 0 ? selectedDistributor.map(d => d.label).join(";") : "",
        salesRep: selectedSalesRep.length > 0 ? selectedSalesRep.map(s => s.label).join(";") : "",
        agency: selectedAgencies.length > 0 ? selectedAgencies.map(a => a.label).join(";") : "",
        product: selectedProducts.length > 0 ? selectedProducts.map(p => p.label).join(";") : "",
        customer: selectedCustomers.length > 0 ? selectedCustomers.map(c => c.label).join(";") : "",
        area: selectedAreas.length > 0 ? selectedAreas.map(r => r.label).join(";") : "",
        fromDate,
        toDate,
    };

    console.log("Sending payload to backend:", payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 30 seconds timeout
 
    const response = await axios.post(
        "http://localhost:5000/api/files/generate-report",
        payload,
        {
            responseType: "blob",
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );

            clearTimeout(timeoutId);

                  console.log("Received response from backend:", response);
 
             if (response.data.size === 0) {
                 setError("No data found for the selected filters.");
                 setIsLoading(false);
                 return;
             }
 
             const url = window.URL.createObjectURL(new Blob([response.data]));
             const link = document.createElement("a");
             link.href = url;
             link.setAttribute("download", "Distributor_Agency_Product_Report.pdf");
             document.body.appendChild(link);
             link.click();
             window.URL.revokeObjectURL(url);
             document.body.removeChild(link);
             setIsLoading(false);
         } catch (error) {
             setIsLoading(false);
             console.error("Error downloading report.", error);
             if (error.response) {
                 if (error.response.status === 404) {
                     setError("No data found for the given filters.");
                 } else if (error.response.status === 500) {
                     setError("An error occurred while generating the report. Please try again.");
                 } else {
                     setError(`Error: ${error.response.data.message || "Unknown error occurred."}`);
                 }
             } else {
                 setError("Unable to connect to the server. Please check your network connection.");
             }
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
                         <FilterRow>
                             <FilterGroup>
                                 <FilterLabel>Distributor</FilterLabel>
                                 <StyledSelect
                                     options={distributors.map(d => ({ value: d.id, label: d.name }))}
                                     value={selectedDistributor}
                                     onChange={(selectedOptions) => setSelectedDistributor(selectedOptions || [])}
                                     placeholder="Select Distributor"
                                     isMulti
                                     isSearchable
                                     components={dropdownComponents}
                                     styles={customStyles}
                                     closeMenuOnSelect={false}
                                     hideSelectedOptions={false}
                                     filterOption={(option, inputValue) =>
                                         option.label.toLowerCase().includes(inputValue.toLowerCase())
                                     }
                                 />
                             </FilterGroup>
                             <FilterGroup>
                                 <FilterLabel>Sales Representative</FilterLabel>
                                 <StyledSelect
                                     options={salesReps.map(s => ({ value: s.id, label: s.name }))}
                                     value={selectedSalesRep}
                                     onChange={(selectedOptions) => {
                                         if (selectedOptions && selectedOptions.some(opt => opt.id === "all")) {
                                             setSelectedSalesRep(salesReps);
                                         } else {
                                             setSelectedSalesRep(selectedOptions || []);
                                         }
                                     }}
                                     placeholder="Select Sales Rep"
                                     isMulti
                                     isSearchable
                                     components={dropdownComponents}
                                     styles={customStyles}
                                     closeMenuOnSelect={false}
                                     hideSelectedOptions={false}
                                 />
                             </FilterGroup>
                         </FilterRow>
                         <FilterRow>
                             <FilterGroup>
                                 <FilterLabel>Agency</FilterLabel>
                                 <StyledSelect
                                     options={agencies.map(a => ({ value: a.id, label: a.name }))}
                                     value={selectedAgencies}
                                     onChange={(selectedOptions) => {
                                         if (selectedOptions && selectedOptions.some(opt => opt.id === "all")) {
                                             setSelectedAgencies(agencies);
                                         } else {
                                             setSelectedAgencies(selectedOptions || []);
                                         }
                                     }}
                                     placeholder="Select Agency"
                                     isMulti
                                     isSearchable
                                     components={dropdownComponents}
                                     styles={customStyles}
                                     closeMenuOnSelect={false}
                                     hideSelectedOptions={false}
                                 />
                             </FilterGroup>
                             <FilterGroup>
                                 <FilterLabel>Products</FilterLabel>
                                 <StyledSelect
                                     options={products.map(p => ({ value: p.id, label: p.name }))}
                                     value={selectedProducts}
                                     onChange={(selectedOptions) => {
                                         if (selectedOptions && selectedOptions.some(opt => opt.id === "all")) {
                                             setSelectedProducts(products);
                                         } else {
                                             setSelectedProducts(selectedOptions || []);
                                         }
                                     }}
                                     placeholder="Select Products"
                                     isMulti
                                     isSearchable
                                     components={dropdownComponents}
                                     styles={customStyles}
                                     closeMenuOnSelect={false}
                                     hideSelectedOptions={false}
                                 />
                             </FilterGroup>
                         </FilterRow>
                         <FilterRow>
                             <FilterGroup>
                                 <FilterLabel>Customer</FilterLabel>
                                 <StyledSelect
                                     options={customers.map(c => ({ value: c.id, label: c.name }))}
                                     value={selectedCustomers}
                                     onChange={(selectedOptions) => {
                                         if (selectedOptions && selectedOptions.some(opt => opt.id === "all")) {
                                             setSelectedCustomers(customers);
                                         } else {
                                             setSelectedCustomers(selectedOptions || []);
                                         }
                                     }}
                                     placeholder="Select Customers"
                                     isMulti
                                     isSearchable
                                     components={dropdownComponents}
                                     styles={customStyles}
                                     closeMenuOnSelect={false}
                                     hideSelectedOptions={false}
                                 />
                             </FilterGroup>
                             <FilterGroup>
                                 <FilterLabel>Area</FilterLabel>
                                 <StyledSelect
                                     options={areas.map(r => ({ value: r.id, label: r.name }))}
                                     value={selectedAreas}
                                     onChange={(selectedOptions) => {
                                         if (selectedOptions && selectedOptions.some(opt => opt.id === "all")) {
                                             setSelectedAreas(areas);
                                         } else {
                                             setSelectedAreas(selectedOptions || []);
                                         }
                                     }}
                                     placeholder="Select Area"
                                     isMulti
                                     isSearchable
                                     components={dropdownComponents}
                                     styles={customStyles}
                                     closeMenuOnSelect={false}
                                     hideSelectedOptions={false}
                                 />
                             </FilterGroup>
                         </FilterRow>
                         <DateRangeGroup>
                             <DateInputGroup>
                                 <FilterLabel>From Date</FilterLabel>
                                 <StyledDateInput
                                     type="date"
                                     value={fromDate}
                                     onChange={(e) => setFromDate(e.target.value)}
                                     required
                                 />
                             </DateInputGroup>
                             <DateInputGroup>
                                 <FilterLabel>To Date</FilterLabel>
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
                             disabled={isLoading || !fromDate || !toDate}
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
 
 export default Reports;
 
 // Styled components (unchanged from original)
 const LoadingOverlay = styled.div`
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     padding: 2rem;
     color: #555;
 `;
 
 const ReportsContainer = styled.div`
     min-height: 100vh;
     padding: 2rem;
     background-color: #FFFFFF;
 `;
 
 const ReportsCard = styled.div`
     max-width: 1000px;
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
 
 const FilterRow = styled.div`
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 1.5rem;
     margin-bottom: 1.5rem;
     @media (max-width: 768px) {
         grid-template-columns: 1fr;
     }
 `;
 
 const FilterGroup = styled.div`
     margin-bottom: 0;
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
     gap: 1.5rem;
     margin-bottom: 1.5rem;
     @media (max-width: 768px) {
         grid-template-columns: 1fr;
     }
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

