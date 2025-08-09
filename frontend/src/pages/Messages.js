import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages', {
        params: { user_id: user.id }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (listingId, receiverId) => {
    try {
      await axios.post('http://localhost:5000/api/messages', {
        listing_id: listingId,
        receiver_id: receiverId,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container>
      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Conversations</Card.Title>
              <ListGroup>
                {messages.map((message) => (
                  <ListGroup.Item
                    key={message.id}
                    active={selectedListing === message.listing_id}
                    onClick={() => setSelectedListing(message.listing_id)}
                  >
                    <div className="d-flex justify-content-between">
                      <span>
                        {message.sender_id === user.id
                          ? `To: ${message.receiver.username}`
                          : `From: ${message.sender.username}`}
                      </span>
                      <small>{message.timestamp}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          {selectedListing ? (
            <Card>
              <Card.Body>
                <Card.Title>Conversation</Card.Title>
                <ListGroup>
                  {messages
                    .filter((msg) => msg.listing_id === selectedListing)
                    .map((msg) => (
                      <ListGroup.Item
                        key={msg.id}
                        className={`d-flex ${
                          msg.sender_id === user.id ? 'justify-content-end' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded ${
                            msg.sender_id === user.id
                              ? 'bg-primary text-white'
                              : 'bg-light'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(
                      selectedListing,
                      messages.find((msg) => msg.listing_id === selectedListing)
                        .receiver_id
                    );
                  }}
                >
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary">
                    Send
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <div className="text-center py-5">
              <h4>Select a conversation to view</h4>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Messages;
