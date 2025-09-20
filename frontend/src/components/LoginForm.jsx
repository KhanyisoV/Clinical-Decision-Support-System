import React, { useState } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebugInfo("");
    
    try {
      console.log("🔐 Login attempt:", { username, passwordLength: password.length });
      
      const res = await API.post("/auth/login", { 
        UserName: username, 
        Password: password  
      });
      
      // Debug: Log the full response
      console.log("📋 Full response object:", res);
      console.log("📋 Response data:", res.data);
      console.log("📋 Response status:", res.status);
      console.log("📋 Response headers:", res.headers);
      
      // Set debug info for user to see
      setDebugInfo(`
Response Status: ${res.status}
Response Data: ${JSON.stringify(res.data, null, 2)}
Available Properties: ${Object.keys(res.data || {}).join(', ')}
      `);
      
      // Check different possible property names
      const token = res.data.Token || res.data.token || res.data.access_token || res.data.accessToken;
      const role = res.data.Role || res.data.role || res.data.userRole;
      
      console.log("🔑 Token found:", token);
      console.log("👤 Role found:", role);
      
      if (!token) {
        // More specific error based on what we received
        if (res.data && Object.keys(res.data).length > 0) {
          throw new Error(`Server response missing token. Received: ${JSON.stringify(res.data)}`);
        } else {
          throw new Error("Server returned empty response");
        }
      }
      
      localStorage.setItem("token", token);

      try {
        const decoded = jwtDecode(token);
        console.log("🔓 Decoded token:", decoded);
      } catch (decodeError) {
        console.error("❌ Token decode failed:", decodeError);
        throw new Error(`Invalid token format: ${decodeError.message}`);
      }
      
      if (!role) {
        throw new Error("No role received from server");
      }

      console.log("✅ Login successful. Redirecting to:", role);
      
      if (role === "Doctor") navigate("/doctor");
      else if (role === "Admin") navigate("/admin");
      else if (role === "Client") navigate("/client");
      else navigate("/not-found");
      
    } catch (err) {
      console.error("❌ Login error:", err);
      
      if (err.response) {
        console.error("❌ Error response:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        setDebugInfo(`
Error Status: ${err.response.status}
Error Data: ${JSON.stringify(err.response.data, null, 2)}
        `);
        
        if (err.response.status === 401) {
          setError("Invalid username or password");
        } else if (err.response.status === 404) {
          setError("Login endpoint not found - check your AuthController");
        } else if (err.response.status === 500) {
          setError(`Server error: ${err.response.data || 'Internal server error'}`);
        } else {
          setError(`HTTP ${err.response.status}: ${err.response.data || err.response.statusText}`);
        }
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container">
      <h2>Login</h2>
      

      
      {error && <div style={{ color: "red", marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6' }}>
        <strong>Error:</strong> {error}
      </div>}
      
      {debugInfo && <div style={{ 
        backgroundColor: '#f0f8ff', 
        border: '1px solid #ccc',
        padding: '10px', 
        marginBottom: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        <strong>Debug Info:</strong>
        {debugInfo}
      </div>}
      
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <br/>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <br/>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

    </div>
  );
}

export default LoginForm;