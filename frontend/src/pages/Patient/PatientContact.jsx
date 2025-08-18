import React from "react";

export default function PatientContact() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto font-sans">
      <div className="bg-white rounded-lg shadow p-6 md:p-8 mt-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Contact Support
        </h1>

        <p className="mb-4 text-gray-700">
          Phone:{" "}
          <a href="tel:+911234567890" className="text-blue-600 hover:underline">
            +91 12345 67890
          </a>
        </p>

        <p className="mb-4 text-gray-700">
          Email:{" "}
          <a
            href="mailto:support@meditrack.com"
            className="text-blue-600 hover:underline"
          >
            support@meditrack.com
          </a>
        </p>

        <p className="mb-4 text-gray-700">
          WhatsApp:{" "}
          <a
            href="https://wa.me/911234567890"
            target="_blank"
            rel="noreferrer"
            className="text-green-600 hover:underline"
          >
            Chat with us
          </a>
        </p>

        <p className="text-gray-600 text-sm mt-6">
          For urgent assistance, please call or WhatsApp us directly.
        </p>
      </div>
    </div>
  );
}
