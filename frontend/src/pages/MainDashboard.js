import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const MainDashboard = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <Title>Main Dashboard</Title>
      <ButtonContainer>
        <Button onClick={() => navigate('/uploadDashboard')}>Upload File</Button>
        <Button onClick={() => navigate('/removeDashboard')}>Remove File</Button>
        <Button onClick={() => navigate('/reports')}>Reports</Button> 
      </ButtonContainer>
    </Container>
  );
};

export default MainDashboard;

const Container = styled.div`
  text-align: center;
  margin-top: 50px;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 0 10px;
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
`;