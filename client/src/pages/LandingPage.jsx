import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Landingpage.css';
import { useEffect, useState } from 'react';



const Landingpage = () => {
  const [featured, setFeatured] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (featured.length > 0) {
      updateGallery();

      const interval = setInterval(() => {
        setFade(false);

        setTimeout(() => {
          updateGallery();
          setFade(true);
        }, 500);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [featured]);


  const fetchFeatured = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/gallery/featured");
      const data = await res.json();

      const shuffled = [...data].sort(() => Math.random() - 0.5);

      setFeatured(shuffled);
    } catch (err) {
      console.error(err);
    }
  };
  const updateGallery = () => {
    const shuffled = [...featured].sort(() => Math.random() - 0.5);
    setVisibleItems(shuffled.slice(0, 4));
  };
  return (
    <div className="landing-body min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">Club House</Link>
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
            style={{ height: '450px', objectFit: 'cover' }}
            alt="College Building"
          />
          <div className="hero-overlay text-center">
            <h1 className="display-4 fw-bold">Sports & Cultural</h1>
            <p className="fs-5">Participate in events and showcase your talent.</p>
          </div>
        </div>
      </div>

      {/* Animated Gallery */}
      <div className="container my-5">
        <h2 className="text-center fw-bold mb-5 text-info">
          Highlights From Our Clubs
        </h2>

        {visibleItems.length === 0 ? (
          <p className="text-center text-secondary">No highlights yet</p>
        ) : (
          <div className={`row g-3 gallery-wrapper ${fade ? "show" : "hide"}`}>
            {visibleItems.map((item) => (
              <div className="col-12 col-md-6 col-lg-3" key={item._id}>
                <div className="gallery-card">
                  {item.type === "image" ? (
                    <img
                      src={`http://localhost:5000${item.url}`}
                      className="w-100 h-100 rounded"
                      alt=""
                    />
                  ) : (
                    <video
                      src={`http://localhost:5000${item.url}`}
                      className="w-100 h-100 rounded"
                      muted
                      autoPlay
                      loop
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* About Us */}
      <div id="about" className="container text-center my-5 py-5 px-lg-5">
        <h2 className="fw-bold mb-4 text-info">About Us</h2>
        <p className="text-secondary mx-auto" style={{ maxWidth: '800px' }}>
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

  <div className="mx-auto" style={{ maxWidth: "600px" }}>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        alert("Thank you! Your message has been received.");
      }}
    >
      <input
        type="text"
        className="form-control glass-input mb-3"
        placeholder="Full Name"
        required
      />

      <input
        type="email"
        className="form-control glass-input mb-3"
        placeholder="Email Address"
        required
      />

      <textarea
        className="form-control glass-input mb-4"
        rows="5"
        placeholder="Your Message..."
        required
      ></textarea>

      <button
        type="submit"
        className="btn btn-primary-custom w-100 py-3 shadow fw-bold"
      >
        Submit Message
      </button>
    </form>

    {/* Extra Contact Info */}
    
  </div>
</div>

      {/* Footer */}
      <footer className="text-center py-5 border-top border-secondary">
        <div className="text-center mt-4 text-light">
      <p className="mb-1">📧 support@clubportal.com</p>
      <p className="mb-1">📞 +91 6355643264</p>
      <p className="mb-0">📍 Your College Campus</p>
    </div>
        <li className="nav-item"><Link className="nav-link" to="/admin/login">Admin</Link></li>

      </footer>
    </div>
  );
};

export default Landingpage;