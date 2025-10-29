// components/UserContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { apis } from "../utils/apis";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    _id: "",
    profileImage: "/default-avatar.png", // default
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(apis().user, {
          credentials: "include", // 👈 important for cookies
        });
        const data = await res.json();
        if (res.ok) {
          setUserDetails({
            _id: data._id,
            name: data.name,
            email: data.email,
            about: data.about || "",
            profileImage: data.profileImage || "/default-avatar.png",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};
