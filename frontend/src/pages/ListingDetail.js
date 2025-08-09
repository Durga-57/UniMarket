import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col md={8}>
          <div className="d-flex flex-column gap-3">
            {listing.images.split(',').map((image, index) => (
              <Image
                key={index}
                src={`http://localhost:5000/api/uploads/${image}`}
                fluid
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x600';
                }}
              />
            ))}
            {listing.video && (
              <video
                src={`http://localhost:5000/api/uploads/${listing.video}`}
                controls
                className="w-100"
              />
            )}
          </div>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>{listing.title}</Card.Title>
              <Card.Text>
                <strong>Price:</strong> ₹{listing.price}<br />
                <strong>Category:</strong> {listing.category}<br />
                {listing.is_rental && (
                  <>
                    <strong>Rental Duration:</strong> {listing.rental_duration} hours<br />
                  </>
                )}
              </Card.Text>
              <Card.Text>{listing.description}</Card.Text>
              <Card.Text>
                <strong>Seller:</strong> {listing.seller.username}
              </Card.Text>
              {user && user.id !== listing.seller_id && (
                <Button variant="primary" className="w-100">
                  Message Seller
                </Button>
              )}
              {user && user.id === listing.seller_id && (
                <Button variant="danger" className="w-100">
                  Edit Listing
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ListingDetail;
