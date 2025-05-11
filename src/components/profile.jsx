import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newFullName, setNewFullName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("csrid");
            if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:8080/users/details", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }), // send as { token: ... }
                });

                if (response.status === 401) {
                    setError("Unauthorized: Token expired or invalid.");
                    setLoading(false);
                    return;
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setNewFullName(user.fullname);
    };

    const handleSave = async () => {
        const token = localStorage.getItem("csrid");
        if (!token) {
            setError("Authentication required");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/users/updateprofile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, fullname: newFullName }), // Only send fullname
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text();
            if (data.includes("401")) {
                setError("Unauthorized: Token expired or invalid.");
            } else {
                setUser({ ...user, fullname: newFullName });
                setIsEditing(false);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("csrid");
        navigate("/"); // Redirect to weather.jsx (home)
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Profile</h1>
            {user && (
                <>
                    {isEditing ? (
                        <div>
                            <label>
                                <strong>Full Name:</strong>
                                <input
                                    type="text"
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                />
                            </label>
                            <br />
                            <button onClick={handleSave}>Save</button>
                        </div>
                    ) : (
                        <div>
                            <p><strong>Full Name:</strong> {user.fullname}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            {/* Add more user details here if available */}
                            <button onClick={handleEdit}>Edit</button>
                            <button onClick={handleLogout} style={{ marginLeft: 12, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>Logout</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Profile;