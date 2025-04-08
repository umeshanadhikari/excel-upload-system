import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { login } from "../api";

const Login = ({ setToken }) => {
  const [user, setUser] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      alert("Login successful");
      navigate("/maindashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <Container>
      <Title>Login</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          required
        />
        <Button type="submit">Login</Button>
      </Form>
    </Container>
  );
};

export default Login;

const Container = styled.div`
  text-align: center;
  margin-top: 50px;
  padding: 20px;
  background: linear-gradient(135deg, #7b241c, #d98880);
  border-radius: 15px;
  box-shadow: 0 8px 20px rgb(0 0 0 / 20%);
  color: white;
  max-width: 400px;
  margin: 50px auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Input = styled.input`
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgb(0 0 0 / 20%);
`;

const Button = styled.button`
  padding: 10px;
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