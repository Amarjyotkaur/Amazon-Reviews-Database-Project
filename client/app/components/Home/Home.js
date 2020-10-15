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

    // If not logged in
    if (!token) {
      return (
        <p>Please register for an account and sign in before proceeding</p>
      );
    }

    return (
      <div>
        <h3>SIGNED IN, Hello {firstName} {lastName}</h3>
        <button class="btn btn-primary" type="submit" onClick={this.logout}>Logout</button>
      </div>
    )
  }
}