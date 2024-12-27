import { useState } from "react";

const FeedbackForm = () => {
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const characterLimit = 500;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (response.length <= characterLimit) {
      setSubmitting(true);
      // API call
      setTimeout(() => {
        alert("Feedback submitted!");
        setResponse("");
        setSubmitting(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex gap-4 items-center p-2">
        <h1 className="text-xl">Feedback Form</h1>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 bg-white px-16 py-8 overflow-auto">
        <div className="flex justify-between items-center mb-2 md:w-[500px]">
          <h2 className="text-xl font-semibold">Feedback Form</h2>
        </div>
        <form className="gap-4 md:w-[500px]" onSubmit={handleSubmit}>
          <textarea
            className="mt-1 p-4 border border-gray-300 rounded-lg w-full resize-none outline-none"
            rows="8"
            required
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your feedback..."
          />
          <div className="flex justify-end items-center mt-2 text-sm text-gray-500">
            <span>
              {response.length}/{characterLimit}
            </span>
            {response.length > characterLimit && (
              <span className="text-red-500 ml-2">
                Exceeded 500-character limit. Please shorten your text.
              </span>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className={`bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition ${response.length > characterLimit || submitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
              disabled={response.length > characterLimit || submitting}
            >
              {submitting ? "Sending..." : "Send Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
