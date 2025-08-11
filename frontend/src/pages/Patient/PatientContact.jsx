import React from "react";
import PatientSidebar from "../../components/PatientSidebar"; // adjust path if needed

function PatientContact() {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow mt-8 p-8">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">
            Contact Support
          </h1>

          <p className="mb-4 text-gray-700">
            Phone:{" "}
            <a
              href="tel:+911234567890"
              className="text-blue-600 hover:underline"
            >
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
      </main>
    </div>
  );
}

export default PatientContact;
