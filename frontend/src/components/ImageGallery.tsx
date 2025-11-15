import { useState } from "react";
import { category2Icon } from "../utils/utils";

interface ImageGalleryProps {
  userImages: string[];
  recipeType: string;
}

export default function ImageGallery({
  userImages,
  recipeType,
}: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  // Combine user images and generated image
  const allImages = [...userImages];

  // if there are no images to display, show a placeholder
  if (allImages.length === 0) {
    return (
      <div className="w-full md:w-1/2 h-64 bg-surface-variant flex items-center justify-center rounded-lg mb-4 md:mb-0">
        <span className="text-6xl text-on-surface-variant">
          {category2Icon(recipeType)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 flex-wrap md:flex-row mb-4 md:mb-0">
      <div className="flex-grow flex items-center justify-center relative">
        <div className="w-full">
          <img
            src={allImages[selectedImageIndex]}
            alt={`Selected Recipe Image`}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="absolute bottom-2 right-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="bg-surface-container rounded-full text-on-surface hover:bg-surface-variant flex items-center space-x-1 px-4 py-2"
            >
              <span className="material-symbols-rounded">zoom_in</span>
              <p className="hidden md:inline font-body">Zoom</p>
            </button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setIsExpanded(false)}
        >
          <img
            src={allImages[selectedImageIndex]}
            alt={`Expanded Recipe Image`}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 bg-primary rounded-full text-on-primary hover:opacity-80"
          >
            <span className="material-symbols-rounded m-2">close</span>
          </button>
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(
                    (prev) => (prev - 1 + allImages.length) % allImages.length,
                  );
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary rounded-full text-on-primary hover:opacity-80"
              >
                <span className="material-symbols-rounded m-2">
                  chevron_left
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(
                    (prev) => (prev + 1) % allImages.length,
                  );
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary rounded-full text-on-primary hover:opacity-80"
              >
                <span className="material-symbols-rounded m-2">
                  chevron_right
                </span>
              </button>
            </>
          )}
        </div>
      )}
      {allImages.length > 1 && (
        <div className="flex-shrink-0 flex flex-row overflow-x-auto space-x-2 mb-2 md:mb-0 mt-4  [&::-webkit-scrollbar]:h-2  [&::-webkit-scrollbar-thumb]:bg-surface-variant [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full py-2">
          {allImages.map((imgSrc, index) => (
            <div
              className="h-20 w-20 flex-shrink-0 cursor-pointer"
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                key={index}
                src={imgSrc}
                alt={`Recipe Image ${index + 1}`}
                className={`w-20 h-20 object-cover rounded-lg border-4 ${selectedImageIndex === index ? "border-primary" : "border-transparent"}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
