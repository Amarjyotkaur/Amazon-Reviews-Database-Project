import React, { Component, Fragment } from 'react';
import {
  getFromStorage,
  setInStorage,
} from '../../utils/storage';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import "../../index.css";
import "mdbreact/dist/css/mdb.css";
import { MDBMask, MDBView, MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";
import { MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter } from 'mdbreact';

export default class Home extends Component {

  state = {
    modal8: false,
    modal9: false
  }

  toggle = nr => () => {
    let modalNumber = 'modal' + nr
    this.setState({
      [modalNumber]: !this.state[modalNumber]
    });
  }

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
        <div>
          <p>Please register for an account and sign in before proceeding</p>
        </div>
      );
    }

    // const slice = data.slice(this.state.offset, this.state.offset + this.state.perPage)
    let book = this.state.book_data.map(book => {
      return (
          <MDBCol md="3">
            <div class = "hover">
            <MDBView hover>
              <img class="card-img-top" src={book.imUrl} alt="Book Images" />
              <MDBMask className="flex-column flex-center" overlay="cyan-strong">
                <p className="text-white">Book Title</p>
                {
                  book.description == null ? <p></p> : <p>{(book.description).slice(0, 20)}...</p>
                }
                <MDBBtn rounded color="info" type="submit">View Review</MDBBtn>
              </MDBMask>
            </MDBView>
            </div>
          </MDBCol>
      )
    })

    return (
      <div>
        <div class="d-flex justify-content-between">
          <h3>SIGNED IN, Hello {firstName} {lastName}</h3>
          <div class="d-flex justify-content-end">
            <MDBBtn gradient="peach" onClick={this.toggle(8)}>Add Book</MDBBtn>
            <MDBBtn gradient="aqua" type="submit" onClick={this.logout}>Logout</MDBBtn>
          </div>

          <MDBModal isOpen={this.state.modal8} toggle={this.toggle(8)} fullHeight position="right">
            <MDBModalHeader toggle={this.toggle(8)}>Add A Book</MDBModalHeader>
            <MDBModalBody>
              {
                <div>
                  <form>
                    <label htmlFor="materialContactFormName" className="grey-text">Book Name</label>
                    <input type="text" id="bookName" className="form-control" />
                    <br />
                    <label htmlFor="materialContactFormName" className="grey-text">Book Serial Number</label>
                    <input type="text" id="bookName" className="form-control" />
                    <br />
                    <label htmlFor="defaultFormContactMessageEx" className="grey-text">Upload Book Image</label>
                    <br />
                    <label htmlFor="defaultFormContactMessageEx" className="grey-text">Book Description</label>
                    <textarea type="text" id="defaultFormContactMessageEx" className="form-control" rows="3" />
                    <br />
                    <div className="text-center mt-4">
                      <MDBBtn color="warning" outline type="submit">
                        Add Book
                      </MDBBtn>
                    </div>
                  </form>
                </div>
              }
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={this.toggle(8)}>Close</MDBBtn>
            </MDBModalFooter>
          </MDBModal>
        </div>
        <div>
          <div class="container-fluid">
            <div class="row">
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
            activeClassName={"active"} />
        </div>
      </div>
    )
  }
}