import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import axios from 'axios';

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/listings');
      setListings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/listings', {
        params: {
          search: searchTerm,
          category,
          min_price: minPrice,
          max_price: maxPrice
        }
      });
      setListings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error searching listings:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h2 className="mb-4">All Listings</h2>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Sports Equipment">Sports Equipment</option>
                <option value="Clothing">Clothing</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Control
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Control
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button variant="primary" type="submit">
              Search
            </Button>
          </Col>
        </Row>
      </Form>

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

export default Listings;
