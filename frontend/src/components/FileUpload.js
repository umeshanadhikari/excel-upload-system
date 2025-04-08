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
            console.log("Resetting loading state");
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h2>Upload Excel File</h2>
            <FileInputContainer>
                <StyledFileInput
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    id="file-upload"
                />
                <BrowseButton htmlFor="file-upload">Browse</BrowseButton>
            </FileInputContainer>
            <ButtonContainer>
                <StyledButton type="submit" disabled={loading}>
                    {loading ? "Uploading..." : "Upload"}
                </StyledButton>
            </ButtonContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
        </Form>
    );
};

export default FileUpload;

// Styled components
const Form = styled.form`
    text-align: center;
    margin-top: 20px;
`;

const FileInputContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
`;

const StyledFileInput = styled.input`
    display: none;
`;

const BrowseButton = styled.label`
    display: inline-block;
    padding: 10px 25px;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #641e16, #a93226);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, #c0392b, #922b21);
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const ButtonContainer = styled.div`
    margin-top: 10px;
`;

const StyledButton = styled.button`
    margin-top: 15px;
    padding: 10px 25px;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #641e16, #a93226);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, #c0392b, #922b21);
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const ErrorMessage = styled.div`
    color: red;
    margin-top: 10px;
`;

const SuccessMessage = styled.div`
    color: green;
    margin-top: 10px;
`;
