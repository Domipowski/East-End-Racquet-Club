'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MapPinIcon } from '@heroicons/react/24/solid';

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);

  const images = [
    { 
      id: 1, 
      src: "/images/stotzky_court.jpg", 
      alt: "Riverhead Tennis", 
      park: "Stozky Park", 
      town: "Riverhead" 
    },
    { 
      id: 2, 
      src: "/images/four_sisters_park_patchogue_courts.jpg", 
      alt: "Patchogue Tennis", 
      park: "Four Sisters Park", 
      town: "Patchogue"
    },
    { 
      id: 3, 
      src: "/images/ronkonkoma_courts.webp", 
      alt: "Ronkonkoma Tennis", 
      park: "Beach and Recreation Center", 
      town: "Ronkonkoma" 
    },
    { 
      id: 4, 
      src: "/images/port_jeff_courts.webp", 
      alt: "Port Jefferson Tennis", 
      park: "Rocketship Park", 
      town: "Port Jefferson" 
    },
    { 
      id: 5, 
      src: "/images/herrick_park_east_hampton_courts.webp", 
      alt: "East Hampton Tennis", 
      park: "Herrick Park", 
      town: "East Hampton" 
    }
  ];  

  const startSlideInterval = () => {
    clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
  };

  useEffect(() => {
    startSlideInterval();
    return () => clearInterval(slideInterval.current);
  }, [images.length]);
 
  return (
    <div className="mb-12 relative bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative w-full aspect-[16/9]">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
            />

            {/* Caption */}
            <div className="absolute bottom-4 left-4 flex items-center gap-x-1 z-20 px-3 py-1 rounded-lg shadow bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <MapPinIcon className="w-5 h-5" />
              <p className="text-sm font-bold">
                {image.park}, {image.town}
              </p>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={() => {
            setCurrentSlide((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            );
            startSlideInterval();
          }}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full shadow z-20"
          aria-label="Previous Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-black"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => {
            setCurrentSlide((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            );
            startSlideInterval();
          }}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full shadow z-20"
          aria-label="Next Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-black"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                startSlideInterval();
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-green-500' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}