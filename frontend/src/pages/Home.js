import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/listings');
        setListings(response.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h2 className="mb-4">Featured Items</h2>
      <Row xs={1} md={3} className="g-4">
        {listings.map((listing) => (
          <Col key={listing.id}>
            <Card>
              <Card.Img
                variant="top"
                src={`http://localhost:5000/api/uploads/${listing.images.split(',')[0]}`}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300';
                }}
              />
              <Card.Body>
                <Card.Title>{listing.title}</Card.Title>
                <Card.Text>
                  {listing.description.substring(0, 100)}...
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 mb-0">₹{listing.price}</span>
                  <Button variant="primary" as="a" href={`/listings/${listing.id}`}>
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Home;
