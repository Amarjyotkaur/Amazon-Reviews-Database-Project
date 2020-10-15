import React from 'react';

import { Link } from 'react-router-dom';
import { Auth } from '../../services/auth.js';

const Header = () => (
  <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
    <Link to="/" className="navbar-brand">AmaNerd</Link>
    <div className="collpase navbar-collapse">
      <ul className="navbar-nav mr-auto">
      </ul>

      <ul class="navbar-nav ml-auto">
        <li class="nav-item">
          <Link to="/login" className="nav-link">Log in</Link>
        </li>
        <li class="nav-item px-2">
          <Link to="/Signup" className="nav-link">Sign up</Link>
        </li>
        <form class="form-inline mt-2 mt-md-0 px-1">
          <input class="form-control form-control-sm mr-sm-2" type="text" placeholder="Search" aria-label="Search" />
          <button class="btn btn-outline-success btn-sm my-2 my-sm-0" type="submit">Search</button>
        </form>
      </ul>
    </div>
  </nav>
);

export default Header;
