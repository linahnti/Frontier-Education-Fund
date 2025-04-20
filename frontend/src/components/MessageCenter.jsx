import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Form,
  Button,
  Badge,
  Spinner
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSearch,
  faCircle,
  faPlus,
  faComment,
  faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../config";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import AlertModal from "../components/AlertModal"; 

const MessageCenter = ({ userId }) => {
  const { darkMode } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startingNewChat, setStartingNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newChatUserId, setNewChatUserId] = useState("");
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setErrorMessage("Failed to load conversations. Please try again.");
      setShowErrorModal(true);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMessages(data);
      setSelectedConversation(otherUserId);
      setLoading(false);

      await fetch(`${API_URL}/api/messages/${otherUserId}/mark-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchConversations();
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
      setErrorMessage("Failed to load messages. Please try again.");
      setShowErrorModal(true);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
        setNewMessage("");
        fetchConversations();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage(error.message || "Failed to send message. Please try again.");
      setShowErrorModal(true);
    }
  };

  const handleNewChat = async () => {
    if (!currentUser) {
      setErrorMessage("Please log in to start a new chat");
      setShowErrorModal(true);
      return;
    }

    try {
      setStartingNewChat(true);
      const token = localStorage.getItem("token");

      let endpoint;
      if (currentUser.role === "Donor") {
        endpoint = `${API_URL}/api/messages/donor/available-schools`;
      } else if (currentUser.role === "School") {
        endpoint = `${API_URL}/api/messages/school/available-donors/${currentUser._id}`;
      } else {
        throw new Error("Invalid user role");
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response?.data) {
        throw new Error("No data received from server");
      }

      setAvailableUsers(response.data);
    } catch (error) {
      console.error("Error fetching available users:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load available users. Please try again."
      );
      setShowErrorModal(true);
      setStartingNewChat(false);
    }
  };

  const startNewConversation = (userId) => {
    if (!userId) {
      setErrorMessage("Please select a user to chat with");
      setShowErrorModal(true);
      return;
    }
    
    setNewChatUserId("");
    setStartingNewChat(false);
    setSelectedConversation(userId);
    setMessages([]);
    fetchMessages(userId);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  // Find the selected conversation details
  const selectedConversationDetails = conversations.find(
    (c) => c.userId === selectedConversation
  );

  const cardHeaderStyle = {
    background: darkMode ? "#2b3035" : "#f8f9fa", 
    borderBottom: `1px solid ${darkMode ? "#454d55" : "#dee2e6"}`,
    padding: "15px 20px",
    fontWeight: "600"
  };
  
  const cardStyle = {
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    height: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column"
  };

  const messageListStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column"
  };

  return (
    <Container fluid className="py-4">
      {/* Use AlertModal instead of the undefined ErrorModal */}
      <AlertModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        variant="danger"
      />
      
      <Row>
        <Col md={4}>
          <Card 
            className={darkMode ? "bg-dark text-light" : ""}
            style={cardStyle}
          >
            <Card.Header style={cardHeaderStyle} className="d-flex justify-content-between align-items-center">
              <span>
                <FontAwesomeIcon icon={faComment} className="me-2" />
                Conversations
              </span>
              <Button
                variant={darkMode ? "outline-light" : "outline-primary"}
                size="sm"
                onClick={handleNewChat}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" /> New Chat
              </Button>
            </Card.Header>
            
            <div className="p-3">
              <Form.Control
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`mb-3 ${darkMode ? "bg-dark text-light border-secondary" : ""}`}
                style={{ borderRadius: "20px" }}
                prefix={<FontAwesomeIcon icon={faSearch} />}
              />
            </div>

            {startingNewChat && (
              <div className="px-3 pb-3">
                <Card className={darkMode ? "bg-dark text-light border-secondary" : ""}>
                  <Card.Body>
                    <h6 className="mb-3">Start a new conversation</h6>
                    <Form.Select
                      value={newChatUserId}
                      onChange={(e) => setNewChatUserId(e.target.value)}
                      className={`mb-3 ${darkMode ? "bg-dark text-light border-secondary" : ""}`}
                    >
                      <option value="">
                        Select {currentUser.role === "Donor" ? "School" : "Donor"}
                      </option>
                      {availableUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.schoolName || user.name}
                          {user.email ? ` (${user.email})` : ""}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="d-flex">
                      <Button
                        variant={darkMode ? "outline-light" : "primary"}
                        className="me-2"
                        onClick={() => startNewConversation(newChatUserId)}
                        disabled={!newChatUserId}
                      >
                        Start Chat
                      </Button>
                      <Button
                        variant={darkMode ? "outline-danger" : "outline-secondary"}
                        onClick={() => setStartingNewChat(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto" }}>
              <ListGroup variant="flush">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <ListGroup.Item
                      key={conv.userId}
                      action
                      active={selectedConversation === conv.userId}
                      onClick={() => fetchMessages(conv.userId)}
                      className={
                        darkMode ? "bg-dark text-light border-secondary" : ""
                      }
                      style={{
                        transition: "all 0.2s ease",
                        borderLeft: selectedConversation === conv.userId ? 
                          `4px solid ${darkMode ? "#0d6efd" : "#0d6efd"}` : 
                          `4px solid transparent`,
                        padding: "12px 16px"
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-truncate" style={{ maxWidth: "75%" }}>
                          <div className="d-flex align-items-center">
                            {conv.unreadCount > 0 && (
                              <FontAwesomeIcon
                                icon={faCircle}
                                className="me-2"
                                style={{ color: "#0d6efd", fontSize: "8px" }}
                              />
                            )}
                            <strong>{conv.name}</strong>
                          </div>
                          {conv.role === "School" && conv.schoolName && (
                            <small className={`d-block ${darkMode ? "text-light" : "text-muted"}`} style={{ opacity: 0.7 }}>
                              {conv.schoolName}
                            </small>
                          )}
                          <small
                            className={`d-block text-truncate ${darkMode ? "text-light" : "text-muted"}`}
                            style={{ maxWidth: "200px", opacity: 0.7 }}
                          >
                            {conv.lastMessage}
                          </small>
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge pill bg="primary">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item
                    className={
                      darkMode ? "bg-dark text-light border-secondary" : ""
                    }
                  >
                    {searchTerm
                      ? "No matching conversations"
                      : "No conversations yet"}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card 
            className={darkMode ? "bg-dark text-light" : ""}
            style={cardStyle}
          >
            {selectedConversation ? (
              <>
                <Card.Header style={cardHeaderStyle}>
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faUserCircle} className="me-2" size="lg" />
                    <div>
                      <div className="fw-bold">{selectedConversationDetails?.name}</div>
                      {selectedConversationDetails?.role === "School" && 
                        selectedConversationDetails?.schoolName && (
                          <small className={darkMode ? "text-light" : "text-muted"} style={{ opacity: 0.7 }}>
                            {selectedConversationDetails.schoolName}
                          </small>
                        )
                      }
                    </div>
                  </div>
                </Card.Header>
                
                <div style={messageListStyle}>
                  {loading ? (
                    <div className="text-center my-auto">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading messages...</p>
                    </div>
                  ) : messages.length > 0 ? (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`mb-3 d-flex ${
                            message.sender._id === userId
                              ? "justify-content-end"
                              : "justify-content-start"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-3 ${
                              message.sender._id === userId
                                ? darkMode
                                  ? "bg-primary text-light"
                                  : "bg-primary text-white"
                                : darkMode
                                ? "bg-secondary text-light"
                                : "bg-light"
                            }`}
                            style={{ 
                              maxWidth: "70%",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              borderTopRightRadius: message.sender._id === userId ? "4px" : "16px",
                              borderTopLeftRadius: message.sender._id === userId ? "16px" : "4px",
                            }}
                          >
                            <div style={{ wordBreak: "break-word" }}>
                              {message.content}
                            </div>
                            <div className="text-end mt-1">
                              <small
                                className={darkMode ? "text-light" : "text-muted"}
                                style={{ opacity: 0.7, fontSize: "0.75rem" }}
                              >
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="text-center my-auto py-5">
                      <FontAwesomeIcon icon={faComment} size="3x" className="mb-3 text-muted" />
                      <p>
                        Start a conversation with{" "}
                        {selectedConversationDetails?.name}
                      </p>
                    </div>
                  )}
                </div>
                
                <Card.Footer className={darkMode ? "bg-dark border-secondary" : ""} style={{ padding: "15px" }}>
                  <Form.Group className="d-flex">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message here..."
                      className={`${darkMode ? "bg-dark text-light border-secondary" : ""}`}
                      style={{ 
                        resize: "none",
                        borderRadius: "20px",
                        padding: "10px 15px"
                      }}
                    />
                    <Button
                      variant="primary"
                      onClick={sendMessage}
                      className="ms-2"
                      disabled={!newMessage.trim()}
                      style={{ 
                        borderRadius: "50%", 
                        width: "46px", 
                        height: "46px",
                        display: "flex",
                        alignItems: "center", 
                        justifyContent: "center" 
                      }}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </Button>
                  </Form.Group>
                </Card.Footer>
              </>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <FontAwesomeIcon icon={faComment} size="3x" className="mb-3 text-muted" />
                <h4>Welcome to the Message Center</h4>
                <p className="text-center mb-4">
                  Select a conversation to start messaging or start a new chat.
                </p>
                <Button
                  variant={darkMode ? "outline-light" : "primary"}
                  onClick={handleNewChat}
                  style={{ borderRadius: "20px", padding: "8px 20px" }}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Start a New Conversation
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MessageCenter;