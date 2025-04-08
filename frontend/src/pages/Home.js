import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Home = () => {
    return (
        <Container>
            <Title>Welcome to the Excel Upload System</Title>
            <Subtitle>Please register or login to continue.</Subtitle>
            <ButtonContainer>
                <StyledLink to="/register">
                    <Button>Register</Button>
                </StyledLink>
                <StyledLink to="/login">
                    <Button>Login</Button>
                </StyledLink>
            </ButtonContainer>
        </Container>
    );
};

export default Home;

const Container = styled.div`
    text-align: center;
    margin-top: 50px;
    padding: 20px;
    background: linear-gradient(135deg, #641e16, #cd6155);
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    color: white;
    max-width: 600px;
    margin: 50px auto;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #fff;
`;

const Subtitle = styled.p`
    font-size: 1.2rem;
    margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
    margin-top: 20px;
`;

const StyledLink = styled(Link)`
    margin: 0 10px;
`;

const Button = styled.button`
    padding: 10px 20px;
    cursor: pointer;
    background-color: #641e16;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: bold;
    transition: all 0.3s ease;

    &:hover {
        background-color: #c0392b;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    }
`;
