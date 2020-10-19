import React, { Component } from 'react';
import {
  getFromStorage,
  setInStorage,
} from '../../utils/storage';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import "./styles.css";



export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      token: '',
      firstName: '',
      lastName: '',
      offset: 0,
      book_data: [],
      perPage: 28,
      currentPage: 0
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
            this.receivedData()
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

  receivedData() {
    axios
        .get(`http://localhost:8080/api/book/getallbooks`)
        .then(res => {
            // const data = res.data;
            const data = res.data;
            const slice = data.slice(this.state.offset, this.state.offset + this.state.perPage)
            this.setState({
                pageCount: Math.ceil(data.length / this.state.perPage),
                book_data: slice
            })
        });
  }
  handlePageClick = (e) => {
    const selectedPage = e.selected;
    const offset = selectedPage * this.state.perPage;

    this.setState({
        currentPage: selectedPage,
        offset: offset
    }, () => {
        this.receivedData()
    });

};

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

    // const slice = data.slice(this.state.offset, this.state.offset + this.state.perPage)
    let book = this.state.book_data.map(book => {
      return (
          <div class="col-sm-3">
           <div class="card">
              <img class="card-img-top" src={book.imUrl} alt="Card image cap"/>
                <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">example</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
              </div>
            </div>
        </div>
      )
    })
    
    return (
      <div>
        <div class = "d-flex justify-content-between">
          <h3>SIGNED IN, Hello {firstName} {lastName}</h3>
          <button class="btn btn-primary" type="submit" onClick={this.logout}>Logout</button>
        </div>
        <div>
        <div class="container-fluid">
        <div class = "row"> 
          {book}
          </div>
        </div>
          <ReactPaginate
              previousLabel={"prev"}
              nextLabel={"next"}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={this.state.pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={this.handlePageClick}
              containerClassName={"pagination"}
              subContainerClassName={"pages pagination"}
              activeClassName={"active"}/>
            </div>
      
      </div>
        
    )
  }
}