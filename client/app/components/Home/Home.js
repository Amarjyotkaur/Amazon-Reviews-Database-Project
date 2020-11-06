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
import Video from "../../../public/assets/img/readingbook.mp4";
import "./background.css"
import { v4 as uuidv4 } from 'uuid';


export default class Home extends Component {

  state = {
    modal8: false,
    modal9: false
  }

  toggle = nr => () => {
    let modalNumber = 'modal' + nr
    this.setState({
      [modalNumber]: !this.state[modalNumber],
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
      title: '',
      summary: '',
      description: '', 
      price: 0, 
      imUrl: 'https://static5.depositphotos.com/1016154/451/i/450/depositphotos_4511462-stock-photo-blank-empty-3d-book-cover.jpg',
      // related: {},
      categories: []
    };

     this.onChangeTitle = this.onChangeTitle.bind(this);
     this.onChangeDescription = this.onChangeDescription.bind(this);
     this.onChangePrice = this.onChangePrice.bind(this);
    //  this.onChangeImUrl = this.onChangeImUrl.bind(this);
    //  this.onChangeSummary = this.onChangeSummary.bind(this);
     this.onSubmit = this.onSubmit.bind(this);
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

  onChangeTitle(e) {
    this.setState({
        title: e.target.value
    }) 
 }

 onChangeDescription(e) {
     this.setState({
         description: e.target.value
     }) 
  }

  onChangePrice(e) {
     this.setState({
         price: e.target.value
     }) 
 }

//  onChangeSummary(e) {
//   this.setState({
//       price: e.target.value
//   }) 
// }

//  onChangeImUrl(date) {
//      this.setState({
//         imUrl: e.target.value 
//      }) 
//  }

 onSubmit(e) {
   e.preventDefault(); 

   const asin = uuidv4()

   const book = {
     asin: asin,
     description: this.state.description,
     categories: this.state.categories,
     price: this.state.price, 
     imUrl: this.state.imUrl,
    //  related: this.state.related,
     categories: this.state.categories
   }

   axios.post('http://localhost:8080/api/book/addbook', book)
      .then(res => {
        this.setState({
          description: '',
          price: 0, 
          title: '', 
          summary: '',
        })
        
        window.location.href = "./"
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error)
      })
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

    // style={{overflowY : 'hidden'}}

    // If not logged in
    if (!token) {
      return (
        <body>
          <header className="v-header vcontainer">
            <div className="fullscreen-video-wrap">
              <video src={Video} autoPlay={true} muted loop={true} />
            </div>
            <div className="header-overlay"></div>
            <div className="header-content text-md-center">
              <h1 className="font-weight-bold h1-responsive">Have You Read A Book Today?</h1>
              <p className="yellow-text">With AmaNerd Book Review, You will always find the book that you will want to read!</p>
              <Link to="/login">
                <MDBBtn rounded color="info" type="submit">Log In</MDBBtn>
              </Link>
            </div>
          </header>
        </body>
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
                  <label htmlFor="materialContactFormName" className="grey-text">Title</label>
                  <input type="text" 
                         className="form-control" 
                         required
                         value={this.state.title}
                         onChange={this.onChangeTitle}
                  />
                  <br />
                  {/* <label htmlFor="materialContactFormName" className="grey-text">Summary</label>
                  <input type="text" 
                         className="form-control"
                         required
                         value={this.state.summary}
                         onChange={this.onChangeSummary}
                  />
                  <br /> */}
                  <label htmlFor="materialContactFormName" className="grey-text">Description</label>
                  <textarea type="text" 
                         rows="3"
                         className="form-control"
                         required
                         value={this.state.description}
                         onChange={this.onChangeDescription}
                  />
                  <br />
                  <label htmlFor="materialContactFormName" className="grey-text">Price</label>
                  <input type= "number"
                         className="form-control"
                         required
                         value={this.state.price}
                         onChange={this.onChangePrice}
                  />
                  <br />
                  <div className="text-center mt-4">
                    <MDBBtn color="warning" onClick={this.onSubmit} outline type="submit">Add Book</MDBBtn>
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