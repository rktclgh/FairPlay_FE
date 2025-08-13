import React from 'react';
import styled from 'styled-components';

const Loader = () => {
    return (
        <StyledWrapper>
            <figure className="loader">
                <div className="dot white" />
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
            </figure>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    .loader {
        position: relative;
        margin: auto;
        width: 2.5em;
        height: 2.5em;
        animation: rotate5123 1.5s linear infinite;
    }

    .white {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        animation: flash 1.5s linear infinite;
        opacity: 0;
    }

    .dot {
        position: absolute;
        margin: auto;
        width: 0.4em;
        height: 0.4em;
        border-radius: 100%;
        transition: all 1s ease;
    }

    .dot:nth-child(2) {
        top: 0;
        bottom: 0;
        left: 0;
        background: #FF4444;
        animation: dotsY 1.5s linear infinite;
    }

    .dot:nth-child(3) {
        left: 0;
        right: 0;
        top: 0;
        background: #FFBB33;
        animation: dotsX 1.5s linear infinite;
    }

    .dot:nth-child(4) {
        top: 0;
        bottom: 0;
        right: 0;
        background: #99CC00;
        animation: dotsY 1.5s linear infinite;
    }

    .dot:nth-child(5) {
        left: 0;
        right: 0;
        bottom: 0;
        background: #33B5E5;
        animation: dotsX 1.5s linear infinite;
    }

    @keyframes rotate5123 {
        0% {
            transform: rotate(0);
        }

        10% {
            width: 2.5em;
            height: 2.5em;
        }

        66% {
            width: 1.0em;
            height: 1.0em;
        }

        100% {
            transform: rotate(360deg);
            width: 2.5em;
            height: 2.5em;
        }
    }

    @keyframes dotsY {
        66% {
            opacity: .1;
            width: 1.0em;
        }

        77% {
            opacity: 1;
            width: 0;
        }
    }

    @keyframes dotsX {
        66% {
            opacity: .1;
            height: 1.0em;
        }

        77% {
            opacity: 1;
            height: 0;
        }
    }

    @keyframes flash {
        33% {
            opacity: 0;
            border-radius: 0%;
        }

        55% {
            opacity: .6;
            border-radius: 100%;
        }

        66% {
            opacity: 0;
        }
    }
`;

export default Loader;
