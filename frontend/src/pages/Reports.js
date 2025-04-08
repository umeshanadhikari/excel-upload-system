import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Select from "react-select";
import { fetchDistributors, fetchAgencies, fetchProducts } from "../api";

const Reports = () => {
  const [distributors, setDistributors] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch dropdown data from the backend
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }
        const distributorsData = await fetchDistributors(token);
        const agenciesData = await fetchAgencies(token);
        const productsData = await fetchProducts(token);

        // Add "Select All" option
        setDistributors([{ id: "all", name: "Select All" }, ...distributorsData]);
        setAgencies([{ id: "all", name: "Select All" }, ...agenciesData]);
        setProducts([{ id: "all", name: "Select All" }, ...productsData]);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setError("Failed to fetch dropdown data. Please try again.");
      }
    };
    fetchDropdownData();
  }, []);

  const handleSelectAll = (selectedOptions, setSelected, allOptions) => {
    if (selectedOptions && selectedOptions.some((option) => option.id === "all")) {
      setSelected(allOptions.filter((option) => option.id !== "all"));
    } else {
      setSelected(selectedOptions || []);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Validate date inputs
      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        setError("From date cannot be later than To date");
        setIsLoading(false);
        return;
      }

      // Prepare the payload
      const payload = {
        distributor: selectedDistributors.map((d) => d.name).join(",") || "",
        agency: selectedAgencies.map((a) => a.name).join(",") || "",
        product: selectedProducts.map((p) => p.name).join(",") || "",
        fromDate,
        toDate,
      };

      // Make the API request
      const response = await axios.post(
        "http://localhost:5000/api/files/generate-report",
        payload,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.size === 0) {
        setError("No data found for the selected filters.");
        setIsLoading(false);
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Distributor_Agency_Product_Report.pdf");
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error downloading report:", error);
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
    <Container>
      <Title>Reports Page</Title>
      <Form>
        <DropdownContainer>
          <Label>Distributors</Label>
          <Select
            options={distributors}
            getOptionLabel={(e) => e.name}
            getOptionValue={(e) => e.id}
            value={selectedDistributors}
            onChange={(selectedOptions) =>
              handleSelectAll(selectedOptions, setSelectedDistributors, distributors)
            }
            placeholder="Select Distributor(s)"
            isMulti
            isSearchable
            styles={customStyles}
          />
        </DropdownContainer>

        <DropdownContainer>
          <Label>Agency</Label>
          <Select
            options={agencies}
            getOptionLabel={(e) => e.name}
            getOptionValue={(e) => e.id}
            value={selectedAgencies}
            onChange={(selectedOptions) =>
              handleSelectAll(selectedOptions, setSelectedAgencies, agencies)
            }
            placeholder="Select Agency(s)"
            isMulti
            isSearchable
            styles={customStyles}
          />
        </DropdownContainer>

        <DropdownContainer>
          <Label>Product</Label>
          <Select
            options={products}
            getOptionLabel={(e) => e.name}
            getOptionValue={(e) => e.id}
            value={selectedProducts}
            onChange={(selectedOptions) =>
              handleSelectAll(selectedOptions, setSelectedProducts, products)
            }
            placeholder="Select Product(s)"
            isMulti
            isSearchable
            styles={customStyles}
          />
        </DropdownContainer>

        <DateContainer>
          <Label>From Date</Label>
          <StyledInput
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </DateContainer>

        <DateContainer>
          <Label>To Date</Label>
          <StyledInput
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </DateContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button
          onClick={handleDownloadReport}
          disabled={isLoading || !fromDate || !toDate}
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </Button>

        {selectedProducts.length > 0 && (
          <SelectedProductsContainer>
            <Label>Selected Products:</Label>
            <ProductList>
              {selectedProducts.map((product) => (
                <ProductItem key={product.id}>{product.name}</ProductItem>
              ))}
            </ProductList>
          </SelectedProductsContainer>
        )}
      </Form>
    </Container>
  );
};

export default Reports;

// Custom styles for the dropdown
const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: "50px",
    fontSize: "1rem",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f0f0f0" : "#fff",
    color: "#333",
    fontSize: "1rem",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#333",
  }),
};

// Styled components
const Container = styled.div`
  text-align: center;
  margin: 50px auto;
  padding: 30px;
  max-width: 800px;
  background: linear-gradient(135deg, #7b241c, #cd6155);
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  color: white;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DropdownContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
`;

const Label = styled.label`
  font-size: 1.2rem;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  outline: none;
`;

const DateContainer = styled.div`
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #7b241c;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    background-color: #a9a9a9;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ffcccc;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  width: 100%;
  max-width: 400px;
`;

const SelectedProductsContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const ProductList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const ProductItem = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
`;