import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import FileUpload from "../components/FileUpload";
import axios from "axios";

const Dashboard = () => {
    const [token] = useState(localStorage.getItem("token"));
    const [dataSheetID, setDataSheetID] = useState("");
    const [excelSheetName, setExcelSheetName] = useState("");
    const [filePath, setFilePath] = useState(""); // State to store the file path
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            alert("Unauthorized! Please login.");
            navigate("/login");
        } else {
            // Fetch the next ExcelSheetID from the backend
            axios.get("http://localhost:5000/api/files/next-excel-sheet-id", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => setDataSheetID(response.data.nextExcelSheetID))
            .catch((error) => console.error("Error fetching next ExcelSheetID:", error));
        }
    }, [token, navigate]);

    const handleExcelSheetNameChange = (e) => {
        setExcelSheetName(e.target.value); // Update the Excel Sheet Name
    };

    const handleFilePathChange = (path) => {
        setFilePath(path); // Update the file path
    };

    return (
        <DashboardContainer>
            <Title>Upload Dashboard</Title>
            <InputContainer>
                <Label>Excel Sheet ID:</Label>
                <StyledInput
                    type="text"
                    value={dataSheetID}
                    readOnly
                    placeholder="Next Excel Sheet ID"
                />
            </InputContainer>
            <InputContainer>
                <Label>Excel Sheet Name:</Label>
                <StyledInput
                    type="text"
                    value={excelSheetName}
                    onChange={handleExcelSheetNameChange}
                    placeholder="Enter Excel Sheet Name"
                    required
                />
            </InputContainer>
            <FileUpload
                token={token}
                dataSheetID={dataSheetID}
                excelSheetName={excelSheetName}
                onFilePathChange={handleFilePathChange}
            />
            {filePath && <FilePathDisplay>Selected File: {filePath}</FilePathDisplay>}
        </DashboardContainer>
    );
};

export default Dashboard;

const DashboardContainer = styled.div`
    text-align: center;
    margin: 50px auto;
    padding: 30px;
    max-width: 600px;
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

const InputContainer = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    font-size: 1.2rem;
    font-weight: bold;
    display: block;
    margin-bottom: 10px;
`;

const StyledInput = styled.input`
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    width: 80%;
    max-width: 400px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    outline: none;
    margin-top: 10px;
`;

const FilePathDisplay = styled.div`
    margin-top: 20px;
    font-size: 1rem;
    color: #fff;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 5px;
    word-wrap: break-word;
`;