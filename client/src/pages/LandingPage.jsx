import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Landingpage.css';

const Landingpage = () => {
  return (
    <div className="landing-body min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">College Club</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {/* <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li> */}
              {/* <li className="nav-item"><a className="nav-link" href="#about">About Us</a></li> */}
              {/* <li className="nav-item"><a className="nav-link" href="#contact">Contact Us</a></li> */}
              <li className="nav-item ms-lg-3"><Link className="nav-link" to="/login">Login</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mt-4">
        <div className="hero-card shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070" 
            className="w-100" 
            style={{height: '450px', objectFit: 'cover'}} 
            alt="College Building"
          />
          <div className="hero-overlay text-center">
            <h1 className="display-4 fw-bold">Sports & Cultural</h1>
            <p className="fs-5">Participate in events and showcase your talent.</p>
            <button className="btn btn-primary-custom mt-3">Explore Clubs</button>
          </div>
        </div>
      </div>

      {/* Club Gallery */}
      <div className="container my-5">
        <h2 className="text-center fw-bold mb-5 text-info">Our Club Gallery</h2>
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="col-md-4" key={item}>
              <img 
                src={`https://picsum.photos/400/300?random=${item}`} 
                className="gallery-img" 
                alt="Gallery"
              />
            </div>
          ))}
        </div>
      </div>

      {/* About Us */}
      <div id="about" className="container text-center my-5 py-5 px-lg-5">
        <h2 className="fw-bold mb-4 text-info">About Us</h2>
        <p className="text-secondary mx-auto" style={{maxWidth: '800px'}}>
          College Club is a vibrant community that brings together students, faculty, and administration to foster learning, creativity, and collaboration beyond classrooms. Our platform hosts a variety of clubs including **Programming, Cultural, Sports, Placement, and Management**, each guided by dedicated faculty mentors.
        </p>
        <div className="mt-4 small text-secondary">
          <p>We aim to:</p>
          <ul className="list-unstyled">
            <li>"Provide opportunities for students to explore their passions."</li>
            <li>"Build leadership, teamwork, and organizational skills."</li>
            <li>"Create an inclusive space for innovation, culture, and sports."</li>
            <li>"Bridge the gap between academics and real-world skills."</li>
          </ul>
        </div>
      </div>

      {/* Contact Us */}
      <div id="contact" className="container my-5 pb-5">
        <h2 className="text-center fw-bold mb-4 text-info">Contact Us</h2>
        <div className="mx-auto" style={{maxWidth: '600px'}}>
          <form>
            <input type="text" className="form-control glass-input mb-3" placeholder="Full Name" />
            <input type="email" className="form-control glass-input mb-3" placeholder="Email Address" />
            <textarea className="form-control glass-input mb-4" rows="5" placeholder="Your Message..."></textarea>
            <button className="btn btn-primary-custom w-100 py-3 shadow">Submit</button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-5 border-top border-secondary">
        <p className="small text-secondary mb-1">(c)2026 College Club</p>
        <p className="small text-secondary mb-1">Email: support@collegeclub.com</p>
        <p className="small text-secondary">Phone: +91 1232366696</p>
                      <li className="nav-item"><Link className="nav-link" to="/admin/login">Admin</Link></li>

      </footer>
    </div>
  );
};

export default Landingpage;