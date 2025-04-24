import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import FileUpload from "../components/FileUpload";
import axios from "axios";

const Dashboard = () => {
  const [token] = useState(localStorage.getItem("token"));
  const [dataSheetID, setDataSheetID] = useState("");
  const [excelSheetName, setExcelSheetName] = useState("");
  const [filePath, setFilePath] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("Unauthorized! Please login.");
      navigate("/login");
    } else {
      axios.get("http://localhost:5000/api/files/next-excel-sheet-id", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setDataSheetID(response.data.nextExcelSheetID))
      .catch((error) => console.error("Error fetching next ExcelSheetID:", error));
    }
  }, [token, navigate]);

  const handleExcelSheetNameChange = (e) => {
    setExcelSheetName(e.target.value);
  };

  const handleFilePathChange = (path) => {
    setFilePath(path);
  };

  return (
    <DashboardWrapper>
      <DashboardCard>
        <DashboardHeader>
          <DashboardTitle>Upload Dashboard</DashboardTitle>
          <DashboardSubtitle>Alaris Lanka - Data Management System</DashboardSubtitle>
        </DashboardHeader>
        
        <DashboardContent>
          <InputGroup>
            <InputLabel>Excel Sheet ID:</InputLabel>
            <StyledInput
              type="text"
              value={dataSheetID}
              readOnly
              placeholder="Next Excel Sheet ID"
            />
          </InputGroup>

          <InputGroup>
            <InputLabel>Excel Sheet Name:</InputLabel>
            <StyledInput
              type="text"
              value={excelSheetName}
              onChange={handleExcelSheetNameChange}
              placeholder="Enter Excel Sheet Name"
              required
            />
          </InputGroup>

          <FileUpload
            token={token}
            dataSheetID={dataSheetID}
            excelSheetName={excelSheetName}
            onFilePathChange={handleFilePathChange}
          />

          {filePath && (
            <FilePreview>
              <FileIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </FileIcon>
              <FileName>Selected File: {filePath}</FileName>
            </FilePreview>
          )}
        </DashboardContent>
      </DashboardCard>
    </DashboardWrapper>
  );
};

export default Dashboard;

// Styled components
const DashboardWrapper = styled.div`
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
  font-size: 1.75rem;
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

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.3s ease;
  &:focus {
    border-color: #C62828;
    outline: none;
    box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1);
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background-color: #F5F5F5;
  border-radius: 6px;
  font-size: 0.9rem;
`;

const FileIcon = styled.div`
  margin-right: 0.5rem;
`;

const FileName = styled.span`
  color: #333;
`;


