import React from 'react';

import { Link } from 'react-router-dom';

const Header = () => (

  <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
    <Link to="/" className="navbar-brand">Home</Link>
    <div className="collpase navbar-collapse">
      <ul className="navbar-nav mr-auto">
        <li className="navbar-item">
        <Link to="/login" className="nav-link">Log In</Link>
        </li>
        <li className="navbar-item">
        <Link to="/Signup" className="nav-link">Sign up</Link>
        </li>
      </ul>
    </div>
  </nav>
);

export default Header;
