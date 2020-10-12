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

  logout(){
    this.setState({
      isLoading: true,
    })
    const obj = getFromStorage('AmaNerdBook');
    if (obj && obj.token) {
      const {token } = obj
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
        if(json.success){
          setInStorage('AmaNerdBook',{token: json.token})
          this.setState({
            signInError: json.message,
            isLoading: false,
            signInEmail: '',
            signInPassword: '',
            token: json.token,
          });
        } else {
          this.setState({
            signInError: json.message,
            isLoading: false,
          })
        }
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
          <h3>Sign In</h3>
            <form onSubmit = {this.onSignIn}>
              <div className="form-group">
                <label>Email: </label>
                <input type="email" 
                placeholder="bookreview@gmail.com"
                required
                className="form-control"
                value={signInEmail}
                onChange={this.onTextBoxChangeSignInEmail}
                />
              </div>
              <div className="form-group">
                <label>Password: </label>
                <input type="password"
                placeholder="Password"
                required
                className="form-control"
                value={signInPassword}
                onChange={this.onTextBoxChangeSignInPassword}
                />
              </div> 
              <div className="form-group">
                <input type="submit" value="Sign In" className="btn btn-primary"/>
              </div>  
            </form>
        </div>
      )
    } 
    return (
      <div>
        <h3>Hi bitch</h3>
          <form onSubmit = {this.logout}>
          <div className="form-group">
              <input type="Submit" value="Logout" className="btn btn-primary"/>
          </div>
        </form>
      </div>
    );
  }
}

