import styled from 'styled-components';

const Card = () => {
    return (
        <><StyledWrapper>
            <div className="map-container">
                <svg viewBox="0 0 500 500" className="map-background">
                    <rect style={{fill: '#f5f0e5'}} width={500} height={500}/>
                    <path style={{fill: '#90daee'}}
                          d="M0,367.82c5.83-4.39,14.42-10.16,25.59-15.34,4.52-2.09,43.19-19.51,79.55-11.93,36.1,7.52,35.75,32.55,78.41,60.23,46.34,30.06,109.47,41.21,123.32,22.1,11.95-16.49-22.61-41.92-13.66-84.6,4.85-23.1,22.33-50.71,47.73-58.52,42.42-13.05,78.83,39.45,102.84,23.86,15.81-10.26.01-32.87,22.73-74.43,5.8-10.62,11.65-21.15,11.93-36.93.28-15.69-5.63-26.64-7.95-32.39-6.66-16.45-6.21-45.15,28.84-98.55.23,146.23.46,292.46.69,438.69H0v-132.18Z"/>
                </svg>

            </div>
        </StyledWrapper>
        </>
    );
}

const StyledWrapper = styled.div`
    /*************/
    /* Variables */
    /*************/

    .map-container {
        --city-radius: 2rem;
        --city-sign-color-back: #00c080;
        --city-sign-color-font: #fff;
        --city-pin-size-font: 1.2rem;
    }

    /**********/
    /* Styles */
    /**********/

    /* Container */

    .map-container {
        border-radius: 0.5em;
        box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
        line-height: 1;
        min-width: 15rem;
        position: relative;
        width: 50%;
        aspect-ratio: 1;
    }

    /* Map - Background */

    .map-background {
        border-radius: inherit;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }

    /* Map - Cities */

    .map-cities {
        width: 100%;
    }

    .map-city {
        border-radius: var(--city-radius);
        left: calc(var(--x) * 1% - var(--city-radius));
        padding: var(--city-radius);
        position: absolute;
        top: calc(var(--y) * 1% - var(--city-radius));
    }

    .map-city::after,
    .map-city::before {
        font-size: var(--city-pin-size-font);
    }

    .map-city::before {
        content: "•";
        left: calc(-50% + var(--city-radius));
        position: absolute;
        top: calc(-0.65em + var(--city-radius));
        text-align: center;
        text-shadow: 0 1px 1px #000;
        width: 100%;
    }

    .map-city::after {
        clip-path: inset(-0.5em 0 0 0);
        content: "📍";
        left: calc(-50% + var(--city-radius));
        position: absolute;
        top: calc(-1em + var(--city-radius));
        text-align: center;
        transition: all 300ms ease-out;
        width: 100%;
        z-index: var(--y);
    }

    /* Map - Sign */

    .map-city__label {
        display: none;
        left: calc(-5em + 50%);
        position: absolute;
        text-align: center;
        width: 10em;
        z-index: 999;
    }

    .map-city__sign {
        align-items: center;
        background-color: var(--city-sign-color-back);
        border-radius: 0.2rem;
        border: 0.15em solid var(--city-sign-color-font);
        box-shadow: 0 0 3px #000;
        color: var(--city-sign-color-font);
        column-gap: 0.3em;
        display: flex;
        font-weight: 700;
        justify-content: center;
        margin: 0 auto;
        max-width: 100%;
        overflow: hidden;
        padding: 0.4em 0.6em 0.4em 0.3em;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        width: max-content;
    }

    .map-city__sign::before {
        content: attr(data-icon);
    }

    /************/
    /* Tracking */
    /************/

    /* Map - Cities */

    .map-city:hover::after {
        clip-path: inset(-0.5em 0 0.5em 0);
        transform: translateY(0.5em);
    }

    /* Map - Sign */

    .map-city:hover .map-city__label {
        animation: fadein 300ms forwards ease-out;
        display: block;
    }

    .map-city:hover .map-city__sign.anim::before {
        animation-duration: 500ms;
        animation-fill-mode: forwards;
    }

    .map-city:hover .map-city__sign.anim-grow::before {
        animation-name: grow;
        animation-timing-function: ease-in;
    }

    .map-city:hover .map-city__sign.anim-slidein::before {
        animation-name: slidein;
        animation-timing-function: ease-out;
    }

    /**************/
    /* Animations */
    /**************/

    /* Fade in from top */
    @keyframes fadein {
        0% {
            opacity: 0;
            top: calc(var(--city-radius));
        }

        100% {
            opacity: 1;
            top: calc(var(--city-radius) + var(--city-pin-size-font) / 2);
        }
    }

    /* Grow from the ground */
    @keyframes grow {
        0% {
            transform: translate(0, 200%);
        }

        10% {
            transform: translate(5%, 180%);
        }

        20% {
            transform: translate(-10%, 160%);
        }

        30% {
            transform: translate(15%, 140%);
        }

        40% {
            transform: translate(-5%, 120%);
        }

        50% {
            transform: translate(10%, 100%);
        }

        60% {
            transform: translate(-15%, 80%);
        }

        70% {
            transform: translate(5%, 60%);
        }

        80% {
            transform: translate(0, 40%);
        }

        90% {
            transform: translate(0, 20%);
        }

        100% {
            transform: translate(0, 0);
        }
    }

    /* Slide in from left */
    @keyframes slidein {
        0% {
            transform: translateX(-200%);
        }

        100% {
            transform: translateX(0);
        }
    }`;

export default Card;
