import React, { Component } from 'react';
import 'whatwg-fetch';
import {
  getFromStorage,
  setInStorage,
} from '../../utils/storage'
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdbreact';
import 'font-awesome/css/font-awesome.min.css';
import "../../index.css";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      token: '',
      signUpError: '',
      signInError: '',
      signInEmail: '',
      signInPassword: '',
      signUpFirstName: '',
    };
    this.onTextBoxChangeSignInEmail = this.onTextBoxChangeSignInEmail.bind(this);
    this.onTextBoxChangeSignInPassword = this.onTextBoxChangeSignInPassword.bind(this);
    this.onSignIn = this.onSignIn.bind(this)
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

  onTextBoxChangeSignInEmail(event) {
    this.setState({
      signInEmail: event.target.value,
    })
  }

  onTextBoxChangeSignInPassword(event) {
    this.setState({
      signInPassword: event.target.value,
    })
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

  onSignIn() {
    const {
      signInEmail,
      signInPassword,
    } = this.state;

    this.setState({
      isLoading: true,
    })

    fetch('/api/account/signin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: signInEmail,
          password: signInPassword,
        }),
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setInStorage('AmaNerdBook', { token: json.token, firstName: json.firstName, lastName: json.lastName })
          this.setState({
            signInError: json.message,
            isLoading: false,
            signInEmail: '',
            signInPassword: '',
            token: json.token,
          });
        } else {
          log.response = 
          this.setState({
            signInError: json.message,
            isLoading: false,
          })
        }
      }).catch(err => {
        log.response = err.response.status
        console.log(err)
      });
  }

  render() {
    const {
      isLoading,
      token,
      signInError,
      signInEmail,
      signInPassword,
    } = this.state;

    if (isLoading) {
      return (<div><p>Loading...</p></div>)
    }

    if (!token) {
      return (
        <div>
          {
            (signInError) ? (
              <p>{signInError}</p>
            ) : (null)
          }
          <br/>
          <MDBContainer>
            <MDBRow>
              <MDBCol md="6">
                <form>
                  <p className="h5 text-center mb-4">Sign in</p>
                  <div className="grey-text">
                    <MDBInput label="Type your email" icon="envelope" group type="email" validate error="wrong"
                      success="right" required value={signInEmail} onChange={this.onTextBoxChangeSignInEmail} />
                    <MDBInput label="Type your password" icon="lock" group type="password" validate value={signInPassword}
                      onChange={this.onTextBoxChangeSignInPassword} />
                  </div>
                  <div className="text-center">
                    <MDBBtn onClick={this.onSignIn}>Login</MDBBtn>
                  </div>
                </form>
              </MDBCol>
            </MDBRow>
          </MDBContainer>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        </div>
      )
    }
    return (
      window.location.href = "./"
    );
  }
}

