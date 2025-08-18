import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";

export default function Reports() {
  const [reportType, setReportType] = useState("appointments");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must login first");
        setLoading(false);
        return;
      }

      const params = { startDate, endDate };
      if (reportType === "appointments") params.status = status;
      if (reportType === "patients" || reportType === "doctors")
        params.search = search;

      const { data } = await axios.get(
        `http://localhost:5000/api/reports/${reportType}`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );

      setReportData(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, search, startDate, endDate, status]);

  const clean = (v) => (v == null ? "" : String(v));
  const csvEscape = (v) => {
    const s = clean(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const d = new Date(timeStr);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )} ${ampm}`;
  };
  const getWeekday = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const generateTableData = () => {
    let headers = [],
      rows = [];

    switch (reportType) {
      case "appointments":
        headers = [
          "ID",
          "Doctor",
          "Specialty",
          "Patient",
          "Date",
          "Day",
          "Status",
          "Time",
        ];
        rows = reportData.map((r) => [
          r.id || "",
          r.doctor || "",
          r.specialty || "",
          r.patient || "",
          r.date || formatDate(r.date),
          r.day || getWeekday(r.date),
          r.status || "",
          `${formatTime(r.starttime)} - ${formatTime(r.endtime)}`,
        ]);
        break;

      case "patients":
        headers = ["ID", "Name", "Email", "Phone", "Created At"];
        rows = reportData.map((r) => [
          r.id || "",
          r.name || "",
          r.email || "",
          r.phone || "",
          r.createdat || formatDate(r.createdat),
        ]);
        break;

      case "doctors":
        headers = ["ID", "Name", "Email", "Specialty", "Created At"];
        rows = reportData.map((r) => [
          r.id || "",
          r.name || "",
          r.email || "",
          r.specialty || "",
          r.createdat || formatDate(r.createdat),
        ]);
        break;

      case "slots":
        headers = ["ID", "Doctor", "Specialty", "Date", "Day", "Time"];
        rows = reportData.map((r) => [
          r.id || "",
          r.doctor || "",
          r.specialty || "",
          r.date || formatDate(r.date),
          r.day || getWeekday(r.date),
          `${formatTime(r.starttime)} - ${formatTime(r.endtime)}`,
        ]);
        break;

      default:
        break;
    }

    return { headers, rows };
  };

  const exportCSV = () => {
    if (!reportData.length) return;
    const { headers, rows } = generateTableData();
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${reportType}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportPDF = () => {
    if (!reportData.length) return;
    const { headers, rows } = generateTableData();
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    doc.setFontSize(16);
    doc.text(`MediTrack — ${capitalize(reportType)} Reports`, 40, 40);
    const filterLine = `Filters: ${
      startDate ? `From ${formatDate(startDate)}` : "All Dates"
    } ${endDate ? `to ${formatDate(endDate)}` : ""} ${
      reportType === "appointments" ? `| Status: ${status}` : ""
    } ${search ? `| Search: ${search}` : ""}`;
    doc.setFontSize(10);
    doc.text(filterLine, 40, 60);
    import("jspdf-autotable").then(() => {
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 80,
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 40, right: 40 },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          const pageWidth = doc.internal.pageSize.getWidth();
          doc.setFontSize(9);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth - 80,
            doc.internal.pageSize.getHeight() - 20
          );
        },
      });
      doc.save(`${reportType}.pdf`);
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
        Reports
      </h2>

      {/* Report Type & Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-1 border rounded-lg px-3 py-2 w-48"
          >
            <option value="appointments">Appointments</option>
            <option value="patients">Patients</option>
            <option value="doctors">Doctors</option>
            <option value="slots">Slots</option>
          </select>
        </div>

        {(reportType === "appointments" || reportType === "slots") && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block border rounded-lg px-3 py-2 w-48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block border rounded-lg px-3 py-2 w-48"
              />
            </div>
          </>
        )}

        {reportType === "appointments" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-48 border rounded-lg px-3 py-2"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Completed</option>
              <option>Cancelled</option>
              <option>Rescheduled</option>
            </select>
          </div>
        )}

        {(reportType === "doctors" || reportType === "patients") && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              placeholder={
                reportType === "doctors"
                  ? "Name / Email / Phone / Specialization"
                  : "Name / Email / Phone"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 border rounded-lg px-3 py-2 w-64"
            />
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={fetchReports}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Apply Filters
          </button>
          <button
            onClick={exportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Export PDF
          </button>
          {/* New Clear Button */}
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setStatus("All");
              setSearch("");
              setReportType("appointments");
            }}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                {generateTableData().headers.map((h) => (
                  <th key={h} className="px-6 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td
                    colSpan={generateTableData().headers.length}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No data for selected filters.
                  </td>
                </tr>
              ) : (
                generateTableData().rows.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    {row.map((v, i) => (
                      <td key={i} className="px-6 py-3">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
