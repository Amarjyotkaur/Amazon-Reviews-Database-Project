import React, { Component } from 'react';
import { getFromStorage } from '../../utils/storage';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import "../../index.css";
import "mdbreact/dist/css/mdb.css";
import { MDBMask, MDBView, MDBCardBody, MDBRow, MDBCol, MDBBtn, MDBIcon } from "mdbreact";
import { MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter } from 'mdbreact';
import { Link, link } from 'react-router-dom';
import AniLoading from '../../utils/aniloading';
import 'font-awesome/css/font-awesome.min.css';

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
      currentPage: 0,
      dbload: true,
    };
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
          book_data: slice,
          dbload: false,
        })
      });
  }
  handlePageClick = (e) => {
    const selectedPage = e.selected;
    const offset = selectedPage * this.state.perPage;

    this.setState({
      currentPage: selectedPage,
      offset: offset,
      dbload: true,
    }, () => {
      this.receivedData()
    });

  };

  render() {
    const {
      isLoading,
      token,
      firstName,
      lastName,
      dbload,
    } = this.state;

    if (isLoading) {
      return (<div><AniLoading /></div>)
    }

    // If not logged in
    if (!token) {
      return (
        <section className="text-center my-5">
          <h2 className="h1-responsive font-weight-bold">
            Have You Read A Book Today?
      </h2>
          <p className="grey-text w-responsive mx-auto">
            With AmaNerd Book Review, You will always find the book that you will want to read
      </p>
          <p>
            Sign In To find out more!
      </p>
        </section>
      );
    }

    // const slice = data.slice(this.state.offset, this.state.offset + this.state.perPage)
    let book = this.state.book_data.map((book, index) => {
      return (
        <MDBCol md="3" key={index}>
          <div className="hover">
            <MDBView hover>
              <img className="card-img-top" src={book.imUrl} alt="Book Images" />
              <MDBMask className="flex-column flex-center" overlay="cyan-strong">
                <p className="text-white">Book Title</p>
                {
                  book.description == null ? <p></p> : <p>{(book.description).slice(0, 20)}...</p>
                }
                <Link to={`/book/${book.asin}`}>
                  <MDBBtn rounded color="info" type="submit">View Review</MDBBtn>
                </Link>
              </MDBMask>
            </MDBView>
          </div>
        </MDBCol>
      )
    })

    return (
      <div>
        <div className="d-flex justify-content-end mr-5 mb-5">
          <MDBBtn gradient="peach" onClick={this.toggle(8)}>Add Book</MDBBtn>
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
        {
          dbload == true ? <AniLoading /> : <div className="container-fluid">
            <div className="row">
              {book}
            </div>
          </div>
        }
        <div>

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