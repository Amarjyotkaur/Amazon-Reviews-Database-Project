import React, { Component } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { getFromStorage } from '../../utils/storage';
import "../../index.css";
import axios from 'axios';
import "mdbreact/dist/css/mdb.css";
import { MDBMask, MDBView, MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdbreact";
import 'regenerator-runtime/runtime';
import AniLoading from '../../utils/aniloading';

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
                        this.receivedData(token)
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

    receivedData(token) {
        axios
            .get(`http://localhost:8080/api/book/getbook?asin=` + this.props.match.params.asin)
            .then(res => {
                let log = {
                    type: `GET api/book/getbook?asin=` + this.props.match.params.asin, 
                    response: res.status
                }
                axios.post(`http://localhost:8080/api/book/addLog/${token}`, log) 
                    .then(res => console.log(res.data));
                const data = res.data;
                this.setState({
                    description: data.description,
                    price: data.price,
                    imUrl: data.imUrl,
                    related: data.related,
                    categories: data.categories,
                    dbload: false,
            });
        });
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
            </div>
        )
    }
}

export default Book
