import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <Logo>
          <span style={{ color: '#C62828' }}>Alaris</span> Lanka
        </Logo>
        <HeroTitle>Welcome to the Data Management System</HeroTitle>
        <HeroSubtitle>Streamline your data workflows with our powerful tools</HeroSubtitle>
        
        <AuthButtons>
          <AuthButton to="/register">
            Get Started
          </AuthButton>
          <AuthButtonSecondary to="/login">
            Login
          </AuthButtonSecondary>
        </AuthButtons>
      </HeroSection>
      
      <FeaturesSection>
        <FeatureTitle>Key Features</FeatureTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </FeatureIcon>
            <FeatureText>Easy File Uploads</FeatureText>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </FeatureIcon>
            <FeatureText>Data Validation</FeatureText>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </FeatureIcon>
            <FeatureText>Advanced Reporting</FeatureText>
          </FeatureCard>
        </FeatureGrid>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default Home;

// Styled components
const HomeContainer = styled.div`
  min-height: 100vh;
  background-color: #F5F5F5;
`;

const HeroSection = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(198, 40, 40, 0.1), rgba(239, 83, 80, 0.05));
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #555;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.5;
`;

const AuthButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const AuthButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: #C62828;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
  &:hover {
    background-color: #EF5350;
    transform: translateY(-2px);
  }
`;

const AuthButtonSecondary = styled(Link)`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #C62828;
  background-color: white;
  border: 1px solid #C62828;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
  &:hover {
    background-color: #FFEBEE;
    transform: translateY(-2px);
  }
`;

const FeaturesSection = styled.div`
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  margin-bottom: 1rem;
  svg {
    width: 48px;
    height: 48px;
  }
`;

const FeatureText = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
`;










// import React from "react";
// import { Link } from "react-router-dom";
// import styled from "styled-components";

// const Home = () => {
//     return (
//         <Container>
//             <Title>Welcome to the Excel Upload System</Title>
//             <Subtitle>Please register or login to continue.</Subtitle>
//             <ButtonContainer>
//                 <StyledLink to="/register">
//                     <Button>Register</Button>
//                 </StyledLink>
//                 <StyledLink to="/login">
//                     <Button>Login</Button>
//                 </StyledLink>
//             </ButtonContainer>
//         </Container>
//     );
// };

// export default Home;

// const Container = styled.div`
//     text-align: center;
//     margin-top: 50px;
//     padding: 20px;
//     background: linear-gradient(135deg, #641e16, #cd6155);
//     border-radius: 15px;
//     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
//     color: white;
//     max-width: 600px;
//     margin: 50px auto;
// `;

// const Title = styled.h1`
//     font-size: 2.5rem;
//     margin-bottom: 10px;
//     color: #fff;
// `;

// const Subtitle = styled.p`
//     font-size: 1.2rem;
//     margin-bottom: 20px;
// `;

// const ButtonContainer = styled.div`
//     margin-top: 20px;
// `;

// const StyledLink = styled(Link)`
//     margin: 0 10px;
// `;

// const Button = styled.button`
//     padding: 10px 20px;
//     cursor: pointer;
//     background-color: #641e16;
//     color: white;
//     border: none;
//     border-radius: 5px;
//     font-size: 1rem;
//     font-weight: bold;
//     transition: all 0.3s ease;

//     &:hover {
//         background-color: #c0392b;
//         transform: translateY(-2px);
//         box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
//     }
// `;
