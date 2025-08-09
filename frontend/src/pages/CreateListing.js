import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fileService } from '../services/fileService';

function CreateListing() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isRental, setIsRental] = useState(false);
  const [rentalDuration, setRentalDuration] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title || !description || !price) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Upload files first
      const uploadedImages = await fileService.uploadImages(images);
      const uploadedVideo = video ? await fileService.uploadVideo(video) : null;

      // Create listing
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          is_rental: isRental,
          rental_duration: isRental ? parseInt(rentalDuration) : 0,
          images: uploadedImages.join(','),
          video: uploadedVideo?.[0] || '',
          category,
        }),
      });

      if (response.ok) {
        navigate('/listings');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const categories = [
    'Electronics',
    'Books',
    'Sports Equipment',
    'Clothing',
    'Furniture',
    'Other'
  ];

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4">
            <Card.Title className="text-center mb-4">
              Create New Listing
            </Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  isInvalid={error?.includes('title')}
                />
              </Form.Group>

              <Form.Group controlId="formDescription" className="mt-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  isInvalid={error?.includes('description')}
                />
              </Form.Group>

              <Form.Group controlId="formPrice" className="mt-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  isInvalid={error?.includes('price')}
                />
              </Form.Group>

              <Form.Group controlId="formRental" className="mt-3">
                <Form.Check
                  type="switch"
                  id="isRental"
                  label="Is this a rental listing?"
                  checked={isRental}
                  onChange={(e) => setIsRental(e.target.checked)}
                />
              </Form.Group>

              {isRental && (
                <Form.Group controlId="formRentalDuration" className="mt-3">
                  <Form.Label>Rental Duration (hours)</Form.Label>
                  <Form.Control
                    type="number"
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    required
                    isInvalid={error?.includes('duration')}
                  />
                </Form.Group>
              )}

              <Form.Group controlId="formCategory" className="mt-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  isInvalid={error?.includes('category')}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="formImages" className="mt-3">
                <Form.Label>Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  isInvalid={error?.includes('images')}
                />
              </Form.Group>

              <Form.Group controlId="formVideo" className="mt-3">
                <Form.Label>Video (optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mt-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Creating Listing...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateListing;
