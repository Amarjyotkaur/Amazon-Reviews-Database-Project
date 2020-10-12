import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";

import {BrowserRouter as Router,Route,} from 'react-router-dom'

import NotFound from './components/App/NotFound';

import Home from './components/Home/Home';

import Navbar from "./components/NavBar/Navbar";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";

function App() {
    return (
      <Router>
        <div className="container">
          <Navbar /> 
          <br/> 
            <Route exact path="/" component={Home}/>
            <Route path="/login" component={Login}/>
            <Route path="/signup" component={SignUp}/>
        </div>
      </Router>
    );
  }
  
export default App;