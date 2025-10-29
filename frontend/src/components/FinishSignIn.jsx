import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, isSignInWithEmailLink, signInWithEmailLink } from '../components/firebase';
import { toast } from "react-hot-toast";
import { useUser } from "./UserContext";

const FinishSignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserDetails } = useUser(); // ✅ useUser context

  useEffect(() => {
    const completeSignIn = async () => {
      const params = new URLSearchParams(location.search);
      let email = params.get("email");
      let name = params.get("name");

      if (!email) {
        email = window.prompt("Please enter your email:");
      }

      try {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        const user = result.user;

        setUserDetails({ email: user.email, name }); // ✅ Set to context

        toast.success("Signed in! Set a password to finish setup.");
        navigate("/set-password");
      } catch (error) {
        toast.error("Error signing in: " + error.message);
      }
    };

    if (isSignInWithEmailLink(auth, window.location.href)) {
      completeSignIn();
    }
  }, [navigate, location.search, setUserDetails]);

  return <div>Finishing sign-in… redirecting to setup password...</div>;
};

export default FinishSignIn; 