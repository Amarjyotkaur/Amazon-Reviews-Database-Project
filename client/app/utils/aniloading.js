import * as bookData from "./bookloading.json";
import FadeIn from "react-fade-in";
import Lottie from 'react-lottie';
import React, { Component } from 'react'

export default class Aniloading extends Component {

    render() {
        const defaultOptions = {
            loop: true,
            autoplay: true,
            animationData: bookData.default,
            rendererSettings: {
                preserveAspectRatio: "xMidYMid slice"
            }
        }
        return (
            <FadeIn>
                <div className="d-flex justify-content-center align-items-center">
                    <Lottie options={defaultOptions} height={120} width={120} />
                </div>
            </FadeIn>
        );
    }
}
