import React from 'react';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";
import { images } from '../../data/image-data';
import { VirtualizedPage } from './VirtualizedPage/VirtualizedPage';

const variants = {
    enter: (direction) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        };
    }
};

/**
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

const ImageCarousel = () => {
    const [[page, direction], setPage] = useState([0, 0]);

    // We only have 3 images, but we paginate them absolutely (ie 1, 2, 3, 4, 5...) and
    // then wrap that within 0-2 to find our image ID in the array below. By passing an
    // absolute page index as the `motion` component's `key` prop, `AnimatePresence` will
    // detect it as an entirely new image. So you can infinitely paginate as few as 1 images.
    const imageIndex = wrap(0, images.length, page);

    const paginate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
        updateView(null, newDirection);
        // console.log(newDirection);
    };

    useEffect(() => {
        window.onload = e => {
            const slides = document.querySelector("[data-slides]");
            const slidesChildren = [...slides.children];
            slidesChildren[slidesChildren.length - 1].classList.add('left');
            slidesChildren[1].classList.add('right');
        };
        const buttons = document.querySelectorAll("[data-carousel-button]");
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                updateView(button);
            });
        })
    }, []);

    function updateView(button, offset2) {
        let offset;
        let slides;

        if (button) {
            offset = button.dataset.carouselButton === "next" ? 1 : -1;
        } else {
            offset = offset2;
        }
        slides = document.querySelector("[data-carousel]").querySelector("[data-slides]");

        // console.log(offset, slides);
        const slidesChildren = [...slides.children];
        const activeSlide = slides.querySelector("[data-active]");

        let newIndex = [...slides.children].indexOf(activeSlide) + offset;
        if (newIndex < 0) newIndex = slides.children.length - 1;
        if (newIndex >= slides.children.length)
            newIndex = 0;
        slides.children[newIndex].dataset.active = true;
        delete activeSlide.dataset.active;

        slidesChildren.forEach(slide => {
            slide.classList.remove('left');
            slide.classList.remove('right');
        });
        console.log('new index ', newIndex);
        if (newIndex === 0) {
            slidesChildren[slidesChildren.length - 1].classList.add('left');
            slidesChildren[1].classList.add('right');
        } else if (newIndex === slidesChildren.length - 1) {
            slidesChildren[newIndex - 1].classList.add('left');
            slidesChildren[0].classList.add('right');
        } else {
            slidesChildren[newIndex - 1].classList.add('left');
            slidesChildren[newIndex + 1].classList.add('right');
            console.log('new index ', newIndex, slidesChildren);
        }
    }

    return (
        <>
            <div className="slider-container" data-carousel>
                <button className="carousel-button prev" data-carousel-button="prev">&#8592;</button>
                <button className="carousel-button next" data-carousel-button="next">&#8594;</button>
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        className="carousel"
                        data-slides
                        // custom={direction}
                        // variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        // transition={{
                        //     x: { type: "spring", stiffness: 300, damping: 30 },
                        //     opacity: { duration: 0.2 }
                        // }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}>
                        <div className="slide" data-active>
                            <img src="img/1.jpg" alt="Image 1" />
                        </div>
                        <div className="slide">
                            <img src="img/2.jpg" alt="Image 2" />
                        </div>
                        <div className="slide">
                            <img src="img/3.jpg" alt="Image 2" />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            {/* <img
                src={images[imageIndex-1 < 0 ? images.length-1 : imageIndex-1]}
                className='image-left'
            /> */}
            {/* <div className="slider-container" data-carousel>
                <button className="carousel-button prev" data-carousel-button="prev">&#8592;</button>
                <button className="carousel-button next" data-carousel-button="next">&#8594;</button>
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        // src={images[0]}
                        className="carousel"
                        // style={{ width: '500px', height: '500px', backgroundColor: "red" }}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        >
                        <div className="slide" data-active>
                            <motion.img src="img/1.jpg" alt="Image 1" />
                        </div>
                        <div className="slide">
                            <motion.img src="img/2.jpg" alt="Image 2" />
                        </div>
                        <div className="slide">
                            <motion.img src="img/3.jpg" alt="Image 2" />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div> */}
            {/* <img
                src={images[imageIndex+1 >= images.length-1 ? 0 : imageIndex+1]}
                className='image-right'
            /> */}
            {/* <div className="next" onClick={() => paginate(1)}>
                {"‣"}
            </div>
            <div className="prev" onClick={() => paginate(-1)}>
                {"‣"}
            </div> */}
        </>
    );
}

export default ImageCarousel;