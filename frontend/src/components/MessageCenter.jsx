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
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSearch,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../config";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

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
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleNewChat = async () => {
    if (!currentUser) return;

    try {
      setStartingNewChat(true);
      const token = localStorage.getItem("token");

      let response;
      if (currentUser.role === "Donor") {
        response = await axios.get(
          `${API_URL}/api/messages/donor/available-schools`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (currentUser.role === "School") {
        response = await axios.get(
          `${API_URL}/api/messages/school/available-donors/${currentUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setAvailableUsers(response.data);
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  const startNewConversation = (userId) => {
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

  return (
    <Container fluid>
      <Row>
        <Col md={4}>
          <Card className={`mb-3 ${darkMode ? "bg-dark text-light" : ""}`}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Conversations</span>
              <Button
                variant={darkMode ? "outline-light" : "outline-primary"}
                size="sm"
                onClick={handleNewChat}
              >
                New Chat
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Form className="p-2">
                <Form.Control
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={darkMode ? "bg-dark text-light" : ""}
                />
              </Form>

              {startingNewChat && (
                <div className="p-2 border-bottom">
                  <h6>Start a new conversation</h6>
                  <Form.Select
                    value={newChatUserId}
                    onChange={(e) => setNewChatUserId(e.target.value)}
                    className={darkMode ? "bg-dark text-light" : ""}
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
                  <div className="d-flex mt-2">
                    <Button
                      variant={darkMode ? "outline-light" : "primary"}
                      size="sm"
                      className="me-2"
                      onClick={() => startNewConversation(newChatUserId)}
                      disabled={!newChatUserId}
                    >
                      Start Chat
                    </Button>
                    <Button
                      variant={
                        darkMode ? "outline-danger" : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => setStartingNewChat(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

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
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div
                          className="text-truncate"
                          style={{ maxWidth: "75%" }}
                        >
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
                            <small className="d-block text-muted">
                              {conv.schoolName}
                            </small>
                          )}
                          <small
                            className="d-block text-truncate"
                            style={{ maxWidth: "200px" }}
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
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          {selectedConversation ? (
            <Card className={darkMode ? "bg-dark text-light" : ""}>
              <Card.Header>
                Conversation with{" "}
                {
                  conversations.find((c) => c.userId === selectedConversation)
                    ?.name
                }
              </Card.Header>
              <Card.Body style={{ height: "400px", overflowY: "auto" }}>
                {loading ? (
                  <div className="text-center py-4">
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
                          className={`p-3 rounded ${
                            message.sender._id === userId
                              ? darkMode
                                ? "bg-primary text-light"
                                : "bg-primary text-white"
                              : darkMode
                              ? "bg-secondary text-light"
                              : "bg-light text-dark"
                          }`}
                          style={{ maxWidth: "70%" }}
                        >
                          {message.content}
                          <div className="text-end mt-1">
                            <small
                              className={darkMode ? "text-light" : "text-muted"}
                              style={{ opacity: 0.7 }}
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
                  <div className="text-center py-4">
                    <p>
                      Start a conversation with{" "}
                      {
                        conversations.find(
                          (c) => c.userId === selectedConversation
                        )?.name
                      }
                    </p>
                  </div>
                )}
              </Card.Body>
              <Card.Footer>
                <Form.Group className="d-flex">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className={darkMode ? "bg-dark text-light" : ""}
                  />
                  <Button
                    variant="primary"
                    onClick={sendMessage}
                    className="ms-2"
                    disabled={!newMessage.trim()}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </Button>
                </Form.Group>
              </Card.Footer>
            </Card>
          ) : (
            <Card className={darkMode ? "bg-dark text-light" : ""}>
              <Card.Body className="text-center py-5">
                <h4>Welcome to the Message Center</h4>
                <p>
                  Select a conversation to start messaging or start a new chat.
                </p>
                <Button
                  variant={darkMode ? "outline-light" : "primary"}
                  onClick={handleNewChat}
                >
                  Start a New Conversation
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MessageCenter;
