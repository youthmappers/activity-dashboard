import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { useTheme } from '../contexts/ThemeContext'
import './Header.css'

function Header() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src="/assets/img/ym_logo_transparent_small.png" 
            alt="YouthMappers Logo" 
            height="40" 
            className="me-2"
          />
          YouthMappers Activity Dashboard
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Map</Nav.Link>
            <Nav.Link as={Link} to="/numbers">Numbers</Nav.Link>
            {/* <Nav.Link as={Link} to="/live">Live</Nav.Link> */}
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>
          
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? '☀️' : '🌙'}
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header