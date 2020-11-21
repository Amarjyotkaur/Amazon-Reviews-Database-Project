import React, { Component } from 'react';
import 'whatwg-fetch';
import {
  getFromStorage,
  setInStorage,
} from '../../utils/storage'
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdbreact';
import 'font-awesome/css/font-awesome.min.css';
import axios from 'axios'; 

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      toke: '',
      signUpError: '',
      signUpFirstName: '',
      signUpLastName: '',
      signUpEmail: '',
      signUpPassword: '',
    };
    this.onTextBoxChangeSignUpEmail = this.onTextBoxChangeSignUpEmail.bind(this);
    this.onTextBoxChangeSignUpPassword = this.onTextBoxChangeSignUpPassword.bind(this);
    this.onTextBoxChangeSignUpFirstName = this.onTextBoxChangeSignUpFirstName.bind(this);
    this.onTextBoxChangeSignUpLastName = this.onTextBoxChangeSignUpLastName.bind(this);
    this.onSignUp = this.onSignUp.bind(this)
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

  onTextBoxChangeSignUpEmail(event) {
    this.setState({
      signUpEmail: event.target.value,
    })
  }

  onTextBoxChangeSignUpPassword(event) {
    this.setState({
      signUpPassword: event.target.value,
    })
  }

  onTextBoxChangeSignUpFirstName(event) {
    this.setState({
      signUpFirstName: event.target.value,
    })
  }

  onTextBoxChangeSignUpLastName(event) {
    this.setState({
      signUpLastName: event.target.value,
    })
  }

  onSignUp(e) {

    e.preventDefault();

    const {
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword,
    } = this.state;

    this.setState({
      isLoading: true,
    })

    fetch('/api/account/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: signUpFirstName,
          lastName: signUpLastName,
          email: signUpEmail,
          password: signUpPassword,
        }),
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          this.setState({
            signUpError: json.message,
            isLoading: false,
            signUpEmail: '',
            signUpPassword: '',
            signUpFirstName: '',
            signUpLastName: '',
          });
        } else {
          this.setState({
            signUpError: json.message,
            isLoading: false,
          })
        }
      }).catch(err =>{
        console.log(err)
      });
  }

  render() {
    const {
      isLoading,
      token,
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword,
      signUpError,
    } = this.state;

    if (isLoading) {
      return (<div><p>Loading...</p></div>)
    }

    if (!token) {
      return (
        <div>
          {
            (signUpError) ? (
              <p>{signUpError}</p>
            ) : (null)
          }
          <br/>
          <MDBContainer>
            <MDBRow>
              <MDBCol md="6">
                <form>
                  <p className="h5 text-center mb-4">Sign up</p>
                  <div className="grey-text">
                    <MDBInput label="First Name" icon="user" group type="text" validate error="wrong"
                      success="right" required value={signUpFirstName} onChange={this.onTextBoxChangeSignUpFirstName} />
                    <MDBInput label="Last Name" icon="user" group type="text" validate error="wrong"
                      success="right" required value={signUpLastName} onChange={this.onTextBoxChangeSignUpLastName} />
                    <MDBInput label="Your email" icon="envelope" group type="email" validate error="wrong"
                      success="right" required value={signUpEmail} onChange={this.onTextBoxChangeSignUpEmail}/>
                    <MDBInput label="Your password" icon="lock" group type="password" validate required value={signUpPassword} onChange={this.onTextBoxChangeSignUpPassword} />
                  </div>
                  <div className="text-center">
                    <MDBBtn onClick={this.onSignUp} color="primary">Register</MDBBtn>
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
      <div>
        <h3>Sign out to create a new account</h3>
      </div>
    );
  }
}