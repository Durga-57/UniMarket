import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!username.trim()) {
      setError('Please enter a username');
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Please enter an email');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password
      });

      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        navigate('/login');
      } else if (response.data.error) {
        setError(response.data.error);
      } else {
        setError('An unexpected error occurred during registration');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4">
            <Card.Title className="text-center mb-4">
              Create Account
            </Card.Title>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  isInvalid={error?.includes('username')}
                />
                {error?.includes('username') && (
                  <Form.Text className="text-danger">
                    {error}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group controlId="formEmail" className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                  isInvalid={error?.includes('email')}
                />
                {error?.includes('email') && (
                  <Form.Text className="text-danger">
                    {error}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  isInvalid={error?.includes('password')}
                />
                {error?.includes('password') && (
                  <Form.Text className="text-danger">
                    {error}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group controlId="formConfirmPassword" className="mt-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  isInvalid={password !== confirmPassword}
                />
                {password !== confirmPassword && (
                  <Form.Text className="text-danger">
                    Passwords do not match
                  </Form.Text>
                )}
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              <p>
                Already have an account?{' '}
                <a href="/login">Login here</a>
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
