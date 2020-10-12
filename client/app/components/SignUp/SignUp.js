import React, { Component } from 'react';
import 'whatwg-fetch';
import {
  getFromStorage,
  setInStorage,
} from '../../utils/storage'

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
      const {token } = obj
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
        if(json.success){
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
      });

      // window.location = '/login'
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
            <h3>Sign Up</h3>
              <form onSubmit = {this.onSignUp}>
                <div className="form-group">
                  <label>First Name: </label>
                  <input type="text" 
                  placeholder="Adam"
                  required
                  className="form-control"
                  value={signUpFirstName}
                  onChange={this.onTextBoxChangeSignUpFirstName}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name: </label>
                  <input type="text"
                  placeholder="Quincy"
                  required
                  className="form-control"
                  value={signUpLastName}
                  onChange={this.onTextBoxChangeSignUpLastName}
                  />
                </div> 
                <div className="form-group">
                  <label>Email: </label>
                  <input type="email"
                  placeholder="bookreview@gmail.com"
                  required
                  className="form-control"
                  value={signUpEmail}
                  onChange={this.onTextBoxChangeSignUpEmail}
                  />
                </div> 
                <div className="form-group">
                  <label>Password: </label>
                  <input type="password"
                  placeholder="Password"
                  required
                  className="form-control"
                  value={signUpPassword}
                  onChange={this.onTextBoxChangeSignUpPassword}
                  />
                </div> 
                <div className="form-group">
                  <input type="submit" value="Sign Up" className="btn btn-primary"/>
                </div>  
              </form>
          </div>
        )
      }
  }
}

