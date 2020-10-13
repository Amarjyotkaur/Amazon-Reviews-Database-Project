import React, { Component } from 'react';
import {
  getFromStorage,
  setInStorage,
} from '../../utils/storage';
import { Login } from '../Login/Login.js';


export default class Home extends Component {

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
      lastName
    } = this.state;

    if (isLoading) {
      return (<div><p>Loading...</p></div>)
    }

    if (!token) {
      return (
        <h3>We can put the books here. NOT SIGNED IN</h3>
      );
    }

    return (
      <div>
        <h3>SIGNED IN, Hello {firstName} {lastName}</h3>
        <form onSubmit={this.logout}>
          <div className="form-group">
            <input type="Submit" value="Logout" className="btn btn-primary" />
          </div>
        </form>
      </div>
    )
  }
}