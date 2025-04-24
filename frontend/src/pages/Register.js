import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { register } from "../api";
import { Link } from 'react-router-dom';

const Register = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await register(user);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", err);
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
          <AuthTitle>Create Account</AuthTitle>
          <AuthSubtitle>Get started with your new account</AuthSubtitle>
        </AuthHeader>
        
        <AuthForm onSubmit={handleSubmit}>
          {error && <AuthError>{error}</AuthError>}
          
          <FormGroup>
            <FormLabel>Username</FormLabel>
            <FormInput
              type="text"
              placeholder="Choose a username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Create a password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
            />
          </FormGroup>
          
          <AuthButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </AuthButton>
        </AuthForm>
        
        <AuthFooter>
          Already have an account? <AuthLink to="/login">Sign In</AuthLink>
        </AuthFooter>
      </AuthCard>
    </AuthContainer>
  );
};

export default Register;

// Styled components (same as Login.js)
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
// import { register } from "../api";

// const Register = () => {
//     const [user, setUser] = useState({ username: "", password: "" });
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await register(user);
//             alert("Registration successful!");
//             navigate("/login");
//         } catch (err) {
//             alert("Error registering user");
//         }
//     };

//     return (
//         <Container>
//             <Title>Register</Title>
//             <Form onSubmit={handleSubmit}>
//                 <Input
//                     type="text"
//                     placeholder="Username"
//                     onChange={(e) => setUser({ ...user, username: e.target.value })}
//                     required
//                 />
//                 <Input
//                     type="password"
//                     placeholder="Password"
//                     onChange={(e) => setUser({ ...user, password: e.target.value })}
//                     required
//                 />
//                 <Button type="submit">Register</Button>
//             </Form>
//         </Container>
//     );
// };

// export default Register;


// const Container = styled.div`
//     text-align: center;
//     margin-top: 50px;
//     padding: 20px;
//     background: linear-gradient(135deg, #7b241c, #cd6155);
//     border-radius: 15px;
//     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
//     color: white;
//     max-width: 400px;
//     margin: 50px auto;
// `;

// const Title = styled.h2`
//     font-size: 2rem;
//     margin-bottom: 20px;
// `;

// const Form = styled.form`
//     display: flex;
//     flex-direction: column;
//     width: 100%;
// `;

// const Input = styled.input`
//     padding: 10px;
//     margin: 10px 0;
//     border: none;
//     border-radius: 5px;
//     font-size: 1rem;
//     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
// `;

// const Button = styled.button`
//     padding: 10px;
//     background-color: #641e16;
//     color: white;
//     border: none;
//     border-radius: 5px;
//     font-size: 1rem;
//     font-weight: bold;
//     cursor: pointer;
//     transition: all 0.3s ease;

//     &:hover {
//         background-color: #c0392b;
//         transform: translateY(-2px);
//         box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
//     }
// `;