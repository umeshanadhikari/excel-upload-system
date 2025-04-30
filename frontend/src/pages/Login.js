import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { login } from "../api";
import { Link } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data } = await login(user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      navigate("/maindashboard");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <AuthLogo>
            <span style={{ color: '#C62828' }}>Alaris</span> Lanka
          </AuthLogo>
          <AuthTitle>Sign In</AuthTitle>
          <AuthSubtitle>Enter your credentials to access your account</AuthSubtitle>
        </AuthHeader>
        
        <AuthForm onSubmit={handleSubmit}>
          {error && <AuthError>{error}</AuthError>}
          
          <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormInput
              type="text"
              placeholder="Enter your username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
            />
          </FormGroup>
          
          <AuthButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </AuthButton>
        </AuthForm>
        
        <AuthFooter>
          Don't have an account? <AuthLink to="/register">Register</AuthLink>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
};

export default Login;

// Styled components
const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #F5F5F5;
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const AuthHeader = styled.div`
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(198, 40, 40, 0.1), rgba(239, 83, 80, 0.05));
`;

const AuthLogo = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const AuthTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const AuthSubtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const AuthForm = styled.form`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.5rem;
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

const AuthButton = styled.button`
  width: 100%;
  padding: 0.75rem;
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
  justify-content: center;
  gap: 0.5rem;
  &:hover {
    background-color: #EF5350;
  }
  &:disabled {
    background-color: #B0BEC5;
    cursor: not-allowed;
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

const AuthError = styled.div`
  color: #D32F2F;
  background-color: #FFEBEE;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const AuthFooter = styled.div`
  padding: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  border-top: 1px solid #eee;
`;

const AuthLink = styled(Link)`
  color: #C62828;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;








// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import styled from "styled-components";
// import { login } from "../api";

// const Login = ({ setToken }) => {
//   const [user, setUser] = useState({ username: "", password: "" });
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await login(user);
//       setToken(data.token);
//       localStorage.setItem("token", data.token);
//       alert("Login successful");
//       navigate("/maindashboard");
//     } catch (err) {
//       alert("Invalid credentials");
//     }
//   };

//   return (
//     <Container>
//       <Title>Login</Title>
//       <Form onSubmit={handleSubmit}>
//         <Input
//           type="text"
//           placeholder="Username"
//           onChange={(e) => setUser({ ...user, username: e.target.value })}
//           required
//         />
//         <Input
//           type="password"
//           placeholder="Password"
//           onChange={(e) => setUser({ ...user, password: e.target.value })}
//           required
//         />
//         <Button type="submit">Login</Button>
//       </Form>
//     </Container>
//   );
// };

// export default Login;

// const Container = styled.div`
//   text-align: center;
//   margin-top: 50px;
//   padding: 20px;
//   background: linear-gradient(135deg, #7b241c, #d98880);
//   border-radius: 15px;
//   box-shadow: 0 8px 20px rgb(0 0 0 / 20%);
//   color: white;
//   max-width: 400px;
//   margin: 50px auto;
// `;

// const Title = styled.h2`
//   font-size: 2rem;
//   margin-bottom: 20px;
// `;

// const Form = styled.form`
//   display: flex;
//   flex-direction: column;
//   width: 100%;
// `;

// const Input = styled.input`
//   padding: 10px;
//   margin: 10px 0;
//   border: none;
//   border-radius: 5px;
//   font-size: 1rem;
//   box-shadow: 0 2px 5px rgb(0 0 0 / 20%);
// `;

// const Button = styled.button`
//   padding: 10px;
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