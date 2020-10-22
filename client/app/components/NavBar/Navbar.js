import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { getFromStorage } from '../../utils/storage';
import { MDBBtn } from 'mdbreact';

export class Navbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      token: '',
      firstName: '',
      lastName: '',
    };
    this.logout = this.logout.bind(this)
  }

  logout() {
    this.setState({
      isLoading: true,
    })
    const obj = getFromStorage('AmaNerdBook');
    if (obj && obj.token) {
      const { token } = obj
      fetch('/api/account/logout?token=' + token)
        .then(res => res.json()).then(json => {
          if (json.success) {
            this.setState({
              token: '',
              isLoading: false,
            })
            localStorage.clear();
            window.location.reload();
          } else {
            this.setState({
              isLoading: false,
            })
          }
        })
    } else {
      this.setState({
        isLoading: false,
      })
    }
  }

  componentDidMount() {
    const obj = getFromStorage('AmaNerdBook');
    if (obj && obj.token) {
      const { token } = obj
      fetch('/api/account/verify?token=' + token)
        .then(res => res.json()).then(json => {
          if (json.success) {
            this.setState({
              token: token,
              isLoading: false,
            })
            // Set Name
            this.setState({
              firstName: obj.firstName,
              lastName: obj.lastName
            })
          } else {
            this.setState({
              isLoading: false,
            })
          }
        })
    } else {
      this.setState({
        isLoading: false,
      })
    }
  }

  render() {
    const {
      isLoading,
      token,
      firstName,
      lastName,
      dbload,
    } = this.state;

    // If not logged in
    if (!token) {
      return (
        <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
          <Link to="/" className="navbar-brand">AmaNerd</Link>
          <div className="collpase navbar-collapse">
            <ul className="navbar-nav mr-auto">
            </ul>

            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to="/login" className="nav-link">Log in</Link>
              </li>
              <li className="nav-item px-2">
                <Link to="/Signup" className="nav-link">Sign up</Link>
              </li>
              <form className="form-inline mt-2 mt-md-0 px-1" >
                <input className="form-control form-control-sm mr-sm-2" type="text" placeholder="Log In To Search" aria-label="Search" disabled/>
                <button className="btn btn-outline-success btn-sm my-2 my-sm-0" type="submit">Search</button>
              </form>
            </ul>
          </div>
        </nav>
      );
    }

    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">AmaNerd</Link>
        <div className="collpase navbar-collapse">
          <ul className="navbar-nav mr-auto">
          </ul>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">{firstName} {lastName}</Link>
            </li>
            <li className="nav-item px-2">
              <MDBBtn gradient="aqua" type="submit" size="sm" onClick={this.logout}>Logout</MDBBtn>
            </li>
            <form className="form-inline mt-2 mt-md-0 px-1">
              <input className="form-control form-control-sm mr-sm-2" type="text" placeholder="Search" aria-label="Search" />
              <button className="btn btn-outline-success btn-sm my-2 my-sm-0" type="submit">Search</button>
            </form>
          </ul>
        </div>
      </nav>
    )
  }
}

export default Navbar
