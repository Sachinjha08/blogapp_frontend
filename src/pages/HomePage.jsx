import React, { useState, useEffect } from "react";
import axios from "axios";
import { get, post } from '../services/endPoints';
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await get("/api/v1/posts/get-post", {
                    withCredentials: true,
                });

                // Fetch usernames for each comment
                const postsWithUsernames = await Promise.all(
                    response.data.post.map(async (post) => {
                        const commentsWithUsernames = await Promise.all(
                            post.comment.map(async (cmt) => {
                                const userResponse = await get(`/api/v1/users/user/${cmt.userId}`, {
                                    withCredentials: true,
                                });
                                return {
                                    ...cmt,
                                    userName: userResponse.data.user.userName,
                                };
                            })
                        );
                        return { ...post, comment: commentsWithUsernames };
                    })
                );

                setPosts(postsWithUsernames);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        const fetchProfile = async () => {
            const userId = localStorage.getItem("userId");
            if (userId) {
                try {
                    const response = await get(`/api/v1/users/user/${userId}`, {
                        withCredentials: true,
                    });
                    setProfile(response.data.user);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };

        fetchPosts();
        fetchProfile();
    }, []);

    const handleCommentSubmit = async (postId) => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                setError("You need to be logged in to comment.");
                return;
            }

            const response = await post(
                "/api/v1/comment/comment",
                { postId, userId, comment: commentText },
                { withCredentials: true }
            );

            if (response.data.success) {
                const newComment = response.data.comment;

                // Fetch username for the new comment
                const userResponse = await get(`/api/v1/users/user/${newComment.userId}`, {
                    withCredentials: true,
                });

                setCommentText("");
                setError(null);

                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId
                            ? {
                                ...post,
                                comment: [
                                    ...post.comment,
                                    { ...newComment, userName: userResponse.data.user.userName },
                                ],
                            }
                            : post
                    )
                );
            }
        } catch (error) {
            setError("Error posting comment. Please try again.");
            console.error("Error posting comment:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await post("/api/v1/users/logout", {}, { withCredentials: true });
            localStorage.removeItem("userId");
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="homePageContainer">
            <div className="header">
                <h1 className="title">Welcome to Our Blog</h1>
                <p>This is your go-to place for amazing stories, insights, and ideas shared by our community.</p>
            </div>
            <div className="mainContent">
                <div className="postsSection">
                    {posts.map((post) => (
                        <div key={post._id} className="postCard">
                            <h2 className="postTitle">{post.Title}</h2>
                            <img src={`http://localhost:8000/images/${post.image}`} alt={post.Title} className="postImage" />
                            <p className="postDescription">{post.dsc}</p>
                            <div className="commentsSection">
                                <h3>Comments</h3>
                                {post.comment.map((cmt) => (
                                    <p key={cmt._id} className="comment">
                                        <strong className="user">{cmt.userName}</strong>: {cmt.comment}
                                    </p>
                                ))}
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment"
                                    className="commentInput"
                                />
                                <button onClick={() => handleCommentSubmit(post._id)} className="commentButton">
                                    Post Comment
                                </button>
                            </div>
                            {error && <p className="errorMessage">{error}</p>}
                        </div>
                    ))}
                </div>
                <div className="profileSection">
                    {profile ? (
                        <>
                            <h3 className="title">Profile</h3>
                            <img src={`http://localhost:8000/images/${profile.profile}`} alt={profile.userName} className="profileImage" />
                            <p><strong>Username:</strong> {profile.userName}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Role:</strong> {profile.role}</p>
                            <button onClick={handleLogout} className="logoutButton">Logout</button>
                        </>
                    ) : (
                        <p>Loading profile...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
