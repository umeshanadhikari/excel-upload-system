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
//             navigate("/login"); // ✅ Redirect to Login Page
//         } catch (err) {
//             alert("Error registering user");
//         }
//     };

//     return (
//         <Container>
//             <h2>Register</h2>
//             <Form onSubmit={handleSubmit}>
//                 <Input type="text" placeholder="Username" onChange={(e) => setUser({ ...user, username: e.target.value })} required />
//                 <Input type="password" placeholder="Password" onChange={(e) => setUser({ ...user, password: e.target.value })} required />
//                 <Button type="submit">Register</Button>
//             </Form>
//         </Container>
//     );
// };

// export default Register;

// const Container = styled.div`
//     text-align: center;
//     margin-top: 50px;
// `;

// const Form = styled.form`
//     display: flex;
//     flex-direction: column;
//     width: 300px;
//     margin: auto;
// `;

// const Input = styled.input`
//     padding: 10px;
//     margin: 5px 0;
// `;

// const Button = styled.button`
//     padding: 10px;
//     background-color: green;
//     color: white;
//     cursor: pointer;
// `;



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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { register } from "../api";

const Register = () => {
    const [user, setUser] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(user);
            alert("Registration successful!");
            navigate("/login");
        } catch (err) {
            alert("Error registering user");
        }
    };

    return (
        <Container>
            <Title>Register</Title>
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
                <Button type="submit">Register</Button>
            </Form>
        </Container>
    );
};

export default Register;


const Container = styled.div`
    text-align: center;
    margin-top: 50px;
    padding: 20px;
    background: linear-gradient(135deg, #7b241c, #cd6155);
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const Button = styled.button`
    padding: 10px;
    background-color: #641e16;
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
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    }
`;