import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";

function AddPost() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset error state on submit

        if (!title || !description || !image) {
            setError("All fields are required.");
            return;
        }

        const formData = new FormData();
        formData.append("Title", title);  // Ensure the key matches the backend
        formData.append("dsc", description);  // Ensure the key matches the backend
        formData.append("image", image);  // This is for the image file

        try {
            const response = await axios.post(
                "http://localhost:8000/api/v1/posts/create-post",
                formData,
                { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.data.success) {
                navigate("/dashboard"); // Redirect to dashboard on success
            } else {
                setError(response.data.message); // Set error message from response
            }
        } catch (error) {
            console.error("Error adding post:", error);
            setError("Failed to add post. Please try again.");
        }
    };

    return (
        <div className="addPostContainer">
            <h2 className="pageTitle">Add New Post</h2>
            <form onSubmit={handleSubmit} className="addPostForm">
                {error && <p className="errorMessage">{error}</p>}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post Title"
                    className="inputField"
                    required
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Post Description"
                    className="textareaField"
                    required
                ></textarea>
                <input type="file" onChange={handleImageChange} className="fileInput" accept="image/*" required />
                <button type="submit" className="submitButton">Add Post</button>
            </form>
        </div>
    );
}

export default AddPost;
