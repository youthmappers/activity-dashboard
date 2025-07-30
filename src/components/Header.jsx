import { NavLink } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import './Header.css'

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="md" fixed="top">
      <Container fluid>
        <NavLink to="/" className="navbar-brand">
          <img 
            className="navbar-logo" 
            width="40" 
            src="/assets/img/ym_logo_transparent.png" 
            alt="youthmappers-logo"
          />
          YouthMappers Activity
        </NavLink>
        <Navbar.Toggle aria-controls="navbarCollapse" />
        <Navbar.Collapse id="navbarCollapse">
          <Nav className="me-auto mb-2 mb-md-0 p-1">
            <Nav.Item>
              <NavLink to="/" className={({ isActive }) => 
                "nav-link" + (isActive ? " active" : "")
              }>
                Map
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/numbers" className={({ isActive }) => 
                "nav-link" + (isActive ? " active" : "")
              }>
                Numbers
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/live" className={({ isActive }) => 
                "nav-link" + (isActive ? " active" : "")
              }>
                Live Tracker
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/about" className={({ isActive }) => 
                "nav-link" + (isActive ? " active" : "")
              }>
                About
              </NavLink>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
