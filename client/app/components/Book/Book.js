import React, { Component } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { getFromStorage } from '../../utils/storage';
import "../../index.css";
import axios from 'axios';
import "mdbreact/dist/css/mdb.css";
import { MDBMask, MDBView, MDBContainer, MDBRow, MDBCol, MDBBtn, MDBModalBody  } from "mdbreact";
import 'regenerator-runtime/runtime';
import AniLoading from '../../utils/aniloading';
import './book.css'


export class Book extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            token: '',
            firstName: '',
            lastName: '',
            bookASIN: 0,
            dbload: true,
            reviews: [],
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
                        this.receivedReviews()
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
            .get(`http://localhost:8080/api/book/getbook?asin=` + this.props.match.params.asin)
            .then(res => {
                const data = res.data;
                this.setState({
                    description: data.description,
                    price: data.price,
                    imUrl: data.imUrl,
                    related: data.related,
                    categories: data.categories,
                    //dbload: false,
                })
            });
    }

    receivedReviews() {
        axios
            .get(`http://localhost:8080/getBookReviews/` + this.props.match.params.asin)
            .then(res => {
                const data = res.data;
                console.log(data);
                this.setState({
                    reviews: data,
                    dbload: false,
                }
                
                )
            });
        
    }

    reviewsList() {
        console.log(this.state.reviews);
        return this.state.reviews.map(currentreview => {
            console.log(currentreview);
           // <Review review={currentreview} key={currentreview.reviewerID}/>
            return <tr>
            <td>{currentreview.helpful}</td>
            <td>{currentreview.overall}</td>
            <td>{currentreview.reviewText}</td>
            <td>{currentreview.reviewTime}</td>
            <td>{currentreview.reviewerName}</td>
            <td>{currentreview.summary}</td>
          </tr>
          
        //   return <Review review={currentreview} key={currentreview.reviewerID}/>;
        })
      }
    


    render() {
        const {
            isLoading,
            dbload,
            token,
            firstName,
            lastName
        } = this.state;

        if (isLoading) {
            return (
                <div>
                    <AniLoading />
                </div>
            )
        }

        if (dbload) {
            return (
                <div>
                    <AniLoading />
                </div>
            )
        }

        // If not logged in
        if (!token) {
            return (
                <div>
                    <p>Please register for an account and sign in before proceeding</p>
                </div>
            );
        }


        
        return (
            <div>
                <br/>
                <MDBModalBody>
                <MDBRow>
                    <MDBCol lg="5">
                        <a href={this.state.imUrl} target="_blank">
                            <MDBView className="rounded z-depth-2" hover waves>
                                <img class="card-img-top" src={this.state.imUrl} alt="Book Images" />
                            </MDBView>
                        </a>
                    </MDBCol>
                    <MDBCol lg="7">
                        <a href="#!" className="green-text"><h6 className="font-weight-bold mb-3">Category</h6></a>
                        <h3 className="font-weight-bold mb-3 p-0"><strong>Book Title</strong></h3>
                        <h4 className="font-weight-bold mb-3 p-0"><strong>${this.state.price}</strong></h4>
                        <p>Description: {this.state.description}</p>
                        <p>by<strong> Author</strong></p>
                        <MDBBtn color="success" size="md" className="waves-light ">Button</MDBBtn>
                    </MDBCol>
                </MDBRow>
                
                <MDBRow>
                    <h3 className="font-weight-bold mb-3 p-0"><strong>Community Reviews</strong></h3>
                    <MDBBtn color="success" size="md" className="waves-light ">Add Review</MDBBtn>
                    <table className="table">
                        <thead className="thead-light">
                            <tr>
                                <th>helpful</th>
                                <th>overall</th>
                                <th>review</th>
                                <th>time</th>
                                <th>name</th>
                                <th>summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.reviewsList() }
                        </tbody>
                    </table>
                </MDBRow>
                </MDBModalBody>
            </div>
        )
    }
}

export default Book
