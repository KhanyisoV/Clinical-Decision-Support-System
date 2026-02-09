import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function ClientRegisterForm() {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebugInfo("");
    setSuccess("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Client registration attempt:", {
        userName: formData.userName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        passwordLength: formData.password.length
      });

      // Prepare registration data according to DTO
      const registrationData = {
        userName: formData.userName,
        password: formData.password,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        email: formData.email || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
      };

      const res = await API.post("/client/register", registrationData);

      // Debug: Log the full response
      console.log("📋 Registration response:", res);
      console.log("📋 Response data:", res.data);
      console.log("📋 Response status:", res.status);

      // Set debug info for user to see
      setDebugInfo(`
Response Status: ${res.status}
Response Data: ${JSON.stringify(res.data, null, 2)}
Available Properties: ${Object.keys(res.data || {}).join(', ')}
      `);

      // Check for success - improved logic
      const isSuccessful = (
        (res.data && res.data.success === true) ||  // New DTO format
        (res.status === 200 && res.data && typeof res.data === 'object' && !res.data.errors) ||  // Good response without errors
        (res.status === 200 && typeof res.data === 'string' && res.data.toLowerCase().includes('success'))  // Old string format
      );

      if (isSuccessful) {
        console.log("✅ Registration successful:", res.data);
        
        const displayName = res.data.data?.userName || 
                          res.data.data?.firstName || 
                          formData.firstName || 
                          formData.userName;
        
        setSuccess(`Registration successful! Welcome ${displayName}! Redirecting to login page...`);
        
        // Clear form
        setFormData({
          userName: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          email: "",
          dateOfBirth: ""
        });

        // Redirect to login after 3 seconds with countdown
        let countdown = 3;
        const timer = setInterval(() => {
          setSuccess(`Registration successful! Welcome ${displayName}! Redirecting to login page in ${countdown} seconds...`);
          countdown--;
          
          if (countdown < 0) {
            clearInterval(timer);
            navigate("/login");
          }
        }, 1000);

      } else {
        // Handle error cases
        const errorMessage = res.data?.message || res.data?.errors?.[0] || "Registration failed";
        throw new Error(errorMessage);
      }

    } catch (err) {
      console.error("❌ Registration error:", err);

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

        if (err.response.status === 400) {
          const errorMessage = err.response.data?.message || "Invalid registration data";
          const errors = err.response.data?.errors || [];
          setError(`${errorMessage}${errors.length > 0 ? '\n' + errors.join('\n') : ''}`);
        } else if (err.response.status === 500) {
          const errorMessage = err.response.data?.message || 'Internal server error';
          setError(`Server error: ${errorMessage}`);
        } else {
          const errorMessage = err.response.data?.message || err.response.statusText;
          setError(`HTTP ${err.response.status}: ${errorMessage}`);
        }
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register as Client</h2>

      {error && (
        <div style={{
          color: "red",
          marginBottom: '10px',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ffcccc',
          borderRadius: '4px',
          whiteSpace: 'pre-line'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{
          color: "green",
          marginBottom: '10px',
          padding: '10px',
          backgroundColor: '#e6ffe6',
          border: '1px solid #ccffcc',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          ✅ {success}
        </div>
      )}

      {debugInfo && (
        <details style={{ marginBottom: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#666' }}>Show Debug Info</summary>
          <div style={{
            backgroundColor: '#f0f8ff',
            border: '1px solid #ccc',
            padding: '10px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {debugInfo}
          </div>
        </details>
      )}

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="userName"
            placeholder="Username *"
            value={formData.userName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            name="password"
            placeholder="Password * (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Registering..." : "Register as Client"}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Already have an account?</p>
        <Link
          to="/login"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Login Here
        </Link>
        <span style={{ margin: '0 10px' }}>|</span>
        <Link
          to="/register-doctor"
          style={{
            color: '#28a745',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          Register as Doctor
        </Link>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <p>* Required fields</p>
      </div>
    </div>
  );
}

export default ClientRegisterForm;
