// pages/admin/Reports.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/AdminSidebar";

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
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (start, end) => {
    if (!start || !end) return "";
    const format = (timeStr) => {
      const [h, m] = timeStr.split(":");
      const date = new Date();
      date.setHours(h, m);
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    };
    return `${format(start)} - ${format(end)}`;
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const generateTableData = () => {
    if (!reportData.length) return { headers: [], rows: [] };

    // dynamic headers
    let headers = Object.keys(reportData[0]).map(capitalize);

    // rows
    let rows = reportData.map((r) =>
      Object.entries(r).map(([key, value]) => {
        if (key === "date" || key === "createdAt") return formatDate(value);
        if (key === "startTime" || key === "endTime") return value;
        return value;
      })
    );

    // handle Day and Time columns
    if (reportType === "appointments" || reportType === "slots") {
      rows = rows.map((r, idx) => {
        const row = [...r];
        const dataRow = reportData[idx];

        const dateIndex = headers.findIndex((h) => h.toLowerCase() === "date");
        const dayIndex = headers.findIndex((h) => h.toLowerCase() === "day");
        const timeIndex = headers.findIndex((h) => h.toLowerCase() === "time");
        const start = dataRow.startTime;
        const end = dataRow.endTime;

        if (dayIndex >= 0)
          row[dayIndex] = new Date(dataRow.date).toLocaleDateString("en-US", {
            weekday: "long",
          });
        if (timeIndex >= 0) row[timeIndex] = formatTime(start, end);

        return row;
      });
    }

    return { headers, rows };
  };

  const csvEscape = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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
    doc.setFontSize(10);

    const filterLine = `Filters: ${
      startDate ? `From ${formatDate(startDate)}` : "All Dates"
    } ${endDate ? `to ${formatDate(endDate)}` : ""} ${
      reportType === "appointments" ? `| Status: ${status}` : ""
    } ${search ? `| Search: ${search}` : ""}`;
    doc.text(filterLine, 40, 60);

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 80,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 40, right: 40 },
    });

    doc.save(`${reportType}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Reports</h2>

        {/* Report Type */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="appointments">Appointments</option>
            <option value="patients">Patients</option>
            <option value="doctors">Doctors</option>
            <option value="slots">Slots</option>
          </select>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
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
                  className="mt-1 block w-48 border border-gray-300 rounded-lg px-3 py-2"
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
                  className="mt-1 block w-48 border border-gray-300 rounded-lg px-3 py-2"
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
                className="mt-1 block w-48 border border-gray-300 rounded-lg px-3 py-2"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
          )}

          {(reportType === "patients" || reportType === "doctors") && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder={
                  reportType === "doctors"
                    ? "Name / Email / Phone / Specialty"
                    : "Name / Email / Phone"
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-2 w-full max-w-2xl"
              />
            </div>
          )}

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
      </main>
    </div>
  );
}
