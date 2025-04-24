import React, { useState } from "react";
import styled from "styled-components";
import { uploadFile } from "../api";

const FileUpload = ({ token, dataSheetID, excelSheetName, onFilePathChange }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      onFilePathChange(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      setSuccess("");
      return;
    }
    if (!excelSheetName) {
      setError("Please enter an Excel Sheet Name.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await uploadFile(file, dataSheetID, token, excelSheetName);
      setSuccess("File uploaded successfully!");
      setError("");
    } catch (err) {
      setSuccess("");
      console.error("File upload error:", err);
      if (err.response) {
        setError(`File upload failed: ${err.response.data.message || err.message}`);
      } else if (err.request) {
        setError("No response received from the server.");
      } else {
        setError(`File upload failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <UploadContainer>
      <Form onSubmit={handleSubmit}>
        <Title>Upload Excel File</Title>
        <UploadBox>
          <FileInputContainer>
            <StyledFileInput 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileChange} 
              id="file-upload" 
            />
            <UploadLabel htmlFor="file-upload">
              <UploadIcon>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </UploadIcon>
              <UploadText>
                {file ? file.name : "Choose a file"}
              </UploadText>
              <BrowseButton>Browse Files</BrowseButton>
            </UploadLabel>
          </FileInputContainer>
          
          <ButtonContainer>
            <StyledButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Uploading...
                </>
              ) : (
                "Upload File"
              )}
            </StyledButton>
          </ButtonContainer>
        </UploadBox>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Form>
    </UploadContainer>
  );
};

export default FileUpload;

// Styled components
const UploadContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const UploadBox = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
  &:hover {
    border-color: #C62828;
  }
`;

const FileInputContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const StyledFileInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 100%;
`;

const UploadIcon = styled.div`
  margin-bottom: 1rem;
  color: #C62828;
  svg {
    width: 48px;
    height: 48px;
  }
`;

const UploadText = styled.div`
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BrowseButton = styled.span`
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  background-color: #C62828;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: #EF5350;
    transform: translateY(-2px);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledButton = styled.button`
  padding: 0.75rem 1.5rem;
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
  gap: 0.5rem;
  &:hover {
    background-color: #EF5350;
    transform: translateY(-2px);
  }
  &:disabled {
    background-color: #B0BEC5;
    cursor: not-allowed;
    transform: none;
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
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #388E3C;
  background-color: #E8F5E9;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
`;



