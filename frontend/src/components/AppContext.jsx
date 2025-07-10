import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/check", { withCredentials: true });
        if (res.data.loggedIn) {
          setUser({ userid: res.data.userid, role: res.data.role });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return <AppContext.Provider value={{ user, setUser, loading }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
