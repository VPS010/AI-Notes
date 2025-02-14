// TranscriptContent.js
import React from "react";
import { Copy, Check } from "lucide-react";

/**
 * Props:
 * - content: transcript text.
 * - handleContentChange: function to update transcript.
 * - showFullContent: boolean indicating whether full content is shown.
 * - setShowFullContent: function to toggle full content view.
 * - handleCopy: function to copy text.
 * - copied: boolean indicating if content was copied.
 */
const TranscriptContent = ({
  content,
  handleContentChange,
  showFullContent,
  setShowFullContent,
  handleCopy,
  copied,
}) => {
  return (
    <div>
      <div className="space-y-3 sm:space-y-4">
        <div className="relative flex justify-between border-gray-200 rounded-lg border p-3 sm:p-4 items-start">
          <button
            onClick={handleCopy}
            disabled={copied}
            className={`absolute top-2 right-2 flex items-center justify-center gap-1 px-2 p-1 rounded-full transition-all duration-200 ${
              copied
                ? "bg-red-100 text-red-600 border border-red-600"
                : "bg-gray-100 hover:bg-gray-200 border border-gray-700"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} className="animate-bounce" />
                <span className="text-xs sm:text-sm">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="text-xs sm:text-sm">copy</span>
              </>
            )}
          </button>
          <div className="flex flex-col w-full mt-8 sm:mt-6">
            <textarea
              value={content}
              onChange={handleContentChange}
              className="text-gray-800 text-xs sm:text-sm leading-relaxed bg-transparent resize-none w-full focus:outline-none"
              rows={showFullContent ? 10 : 3}
            />
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-gray-400 underline text-xs sm:text-sm hover:text-gray-600 mt-2 self-start"
            >
              {showFullContent ? "Read Less" : "Read More"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptContent;
