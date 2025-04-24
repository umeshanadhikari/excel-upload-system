import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const MainDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Alaris Lanka Dashboard</DashboardTitle>
        <DashboardSubtitle>Manage your data efficiently</DashboardSubtitle>
      </DashboardHeader>
      
      <DashboardGrid>
        <DashboardCard onClick={() => navigate('/UploadDashboard')}>
          <CardIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </CardIcon>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>Upload new Excel files to the system</CardDescription>
        </DashboardCard>
        
        <DashboardCard onClick={() => navigate('/removeDashboard')}>
          <CardIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </CardIcon>
          <CardTitle>Remove Files</CardTitle>
          <CardDescription>Manage or delete existing files</CardDescription>
        </DashboardCard>
        
        <DashboardCard onClick={() => navigate('/reports')}>
          <CardIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </CardIcon>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Generate detailed reports</CardDescription>
        </DashboardCard>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default MainDashboard;

// Styled components
const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background-color: #F5F5F5;
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const DashboardTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const DashboardSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardCard = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, rgba(198, 40, 40, 0.05), rgba(239, 83, 80, 0.02));
  }
`;

const CardIcon = styled.div`
  margin-bottom: 1.5rem;
  svg {
    width: 48px;
    height: 48px;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
`;








// import React from "react";
// import { useNavigate } from "react-router-dom";
// import styled from "styled-components";

// const MainDashboard = () => {
//   const navigate = useNavigate();
//   return (
//     <Container>
//       <Title>Main Dashboard</Title>
//       <ButtonContainer>
//         <Button onClick={() => navigate('/uploadDashboard')}>Upload File</Button>
//         <Button onClick={() => navigate('/removeDashboard')}>Remove File</Button>
//         <Button onClick={() => navigate('/reports')}>Reports</Button> 
//       </ButtonContainer>
//     </Container>
//   );
// };

// export default MainDashboard;

// const Container = styled.div`
//   text-align: center;
//   margin-top: 50px;
// `;

// const Title = styled.h2`
//   font-size: 2rem;
//   margin-bottom: 20px;
// `;

// const ButtonContainer = styled.div`
//   display: flex;
//   justify-content: center;
// `;

// const Button = styled.button`
//   padding: 10px 20px;
//   margin: 0 10px;
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
// `;