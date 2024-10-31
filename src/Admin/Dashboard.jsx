import React, { useState, useEffect } from "react";
import { get, patch, dele, post } from '../services/endPoints'
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await get("/api/v1/posts/get-post", {
                    withCredentials: true,
                });

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

    const handleDeletePost = async (postId) => {
        try {
            await dele(`/api/v1/posts/delete-post/${postId}`, {
                withCredentials: true,
            });
            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        } catch (error) {
            console.error("Error deleting post:", error);
            setError("Error deleting post. Please try again.");
        }
    };

    const handleEditPost = (post) => {
        setEditingPostId(post._id);
        setEditTitle(post.Title);
        setEditDescription(post.dsc);
    };

    const handleSaveEdit = async (postId) => {
        try {
            const response = await patch(
                `/api/v1/posts/update-post/${postId}`,
                { Title: editTitle, dsc: editDescription },
                { withCredentials: true }
            );

            if (response.data.success) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId ? { ...post, Title: editTitle, dsc: editDescription } : post
                    )
                );
                setEditingPostId(null);
                setEditTitle("");
                setEditDescription("");
            }
        } catch (error) {
            console.error("Error editing post:", error);
            setError("Error saving post changes. Please try again.");
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
        <div className="dashboardContainer">
            <div className="header">
                <h1 className="title">Dashboard</h1>
            </div>
            <div className="mainContent">
                <div className="postsSection">
                    {posts.map((post) => (
                        <div key={post._id} className="postCard">
                            <div className="postActions">
                                {editingPostId === post._id ? (
                                    <>
                                        <button className="saveButton" onClick={() => handleSaveEdit(post._id)}>
                                            Save
                                        </button>
                                        <button className="cancelButton" onClick={() => setEditingPostId(null)}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="editButton" onClick={() => handleEditPost(post)}>
                                            Edit
                                        </button>
                                        <button className="deleteButton" onClick={() => handleDeletePost(post._id)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                            {editingPostId === post._id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="editInput"
                                    />
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="editTextarea"
                                    />
                                </>
                            ) : (
                                <>
                                    <h2 className="postTitle">{post.Title}</h2>
                                    <img src={`https://blogapp-backend-822d.onrender.com/images/${post.image}`} alt={post.Title} className="postImage" />
                                    <p className="postDescription">{post.dsc}</p>
                                </>
                            )}
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
                            <img src={`https://blogapp-backend-822d.onrender.com/images/${profile.profile}`} alt={profile.userName} className="profileImage" />
                            <p><strong>Username:</strong> {profile.userName}</p>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Role:</strong> {profile.role}</p>
                            <button onClick={handleLogout} className="logoutButton">Logout</button>
                            <button onClick={() => navigate("/add-post")} className="addPostButton">Add Post</button>
                            <button onClick={() => navigate("/all-users")} className="allUsersButton">All Users</button>
                        </>
                    ) : (
                        <p>Loading profile...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
