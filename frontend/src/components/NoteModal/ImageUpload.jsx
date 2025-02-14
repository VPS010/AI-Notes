// ImageUpload.js
import React from "react";

/**
 * Props:
 * - images: array of image URLs.
 * - handleImageUpload: function to upload a new image.
 * - handleImageDelete: function to remove an image.
 */
const ImageUpload = ({ images, handleImageUpload, handleImageDelete }) => {
  return (
    <div className="mt-3 sm:mt-4 p-3 sm:p-4 flex items-center justify-start border-gray-200 rounded-lg border">
      {images?.length > 0 && (
        <div className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {images.map((img, index) => (
              <div key={index} className="h-16 sm:h-24 relative">
                <img
                  src={img}
                  alt={`Note attachment ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => handleImageDelete(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600 text-xs sm:text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <label className="inline-flex flex-col items-center justify-center w-16 h-16 sm:w-24 sm:h-24 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <div className="text-xl sm:text-2xl text-gray-400 mb-1">+</div>
        <span className="text-[10px] sm:text-xs text-gray-500">Image</span>
      </label>
    </div>
  );
};

export default ImageUpload;
