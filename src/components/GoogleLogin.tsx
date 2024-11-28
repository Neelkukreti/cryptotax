import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

interface GoogleLoginProps {
  setUser: (user: any) => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ setUser }) => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return <button onClick={handleLogin}>Login with Google</button>;
};

export default GoogleLogin;
