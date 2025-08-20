import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-toastify";
import {
  fetchAppointmentsReport,
  fetchPatientsReport,
  fetchDoctorsReport,
  fetchSlotsReport,
} from "../../services/reportService";

export default function Reports() {
  const [reportType, setReportType] = useState("appointments");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  // -------- Helper Functions --------
  const clean = (v) => (v == null ? "" : String(v));
  const csvEscape = (v) =>
    /[",\n]/.test(clean(v)) ? `"${clean(v).replace(/"/g, '""')}"` : clean(v);
  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (isNaN(d)) return "";
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
  const getWeekday = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" })
      : "";
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // -------- Fetch Reports --------
  const fetchReports = async () => {
    try {
      setLoading(true);
      let data;
      switch (reportType) {
        case "appointments":
          data = await fetchAppointmentsReport({ startDate, endDate, status });
          break;
        case "patients":
          data = await fetchPatientsReport({ startDate, endDate, search });
          break;
        case "doctors":
          data = await fetchDoctorsReport({ startDate, endDate, search });
          break;
        case "slots":
          data = await fetchSlotsReport({ startDate, endDate });
          break;
        default:
          data = { data: [] };
      }

      const backendResponse = data.data;
      const finalData = Array.isArray(backendResponse)
        ? backendResponse
        : backendResponse?.data;

      setReportData(Array.isArray(finalData) ? finalData : []);
    } catch (err) {
      toast.error("Failed to fetch reports");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, search, startDate, endDate, status]);

  // -------- Memoized Table Data --------
  const tableData = useMemo(() => {
    const dataArray = Array.isArray(reportData) ? reportData : [];
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
        rows = dataArray.map((r) => {
          const slotDate = r.date
            ? parseDate(r.date)
            : r.starttime
            ? new Date(r.starttime)
            : null;
          return [
            r.id || r._id?.$oid || "",
            r.doctor || "",
            r.specialty || "",
            r.patient || "",
            slotDate ? formatDate(slotDate) : "",
            slotDate ? getWeekday(slotDate) : "",
            r.status || "",
            `${formatTime(r.starttime || r.startTime)} - ${formatTime(
              r.endtime || r.endTime
            )}`,
          ];
        });
        break;

      case "patients":
        headers = ["ID", "Name", "Email", "Phone", "Created At"];
        rows = dataArray.map((r) => [
          r.id || "",
          r.name || "",
          r.email || "",
          r.phone || "",
          r.createdat || "",
        ]);
        break;

      case "doctors":
        headers = ["ID", "Name", "Email", "Specialty", "Created At"];
        rows = dataArray.map((r) => [
          r.id || "",
          r.name || "",
          r.email || "",
          r.specialty || "",
          r.createdat || "",
        ]);
        break;

      case "slots":
        headers = ["ID", "Doctor", "Specialty", "Date", "Day", "Time"];
        rows = dataArray.map((r) => {
          const slotDate = r.startTime
            ? new Date(r.startTime)
            : r.starttime
            ? new Date(r.starttime)
            : null;
          return [
            r.id || r._id?.$oid || "",
            r.doctor || "",
            r.specialty || "",
            slotDate ? formatDate(slotDate) : "",
            slotDate ? getWeekday(slotDate) : "",
            `${formatTime(r.startTime || r.starttime)} - ${formatTime(
              r.endTime || r.endtime
            )}`,
          ];
        });
        break;

      default:
        break;
    }

    return { headers, rows };
  }, [reportData, reportType]);

  // -------- CSV Export --------
  const exportCSV = () => {
    if (!tableData.rows.length) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [tableData.headers, ...tableData.rows]
        .map((row) => row.map(csvEscape).join(","))
        .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${reportType}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // -------- PDF Export --------
  const exportPDF = () => {
    if (!tableData.rows.length) return;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    doc.setFontSize(16);
    doc.text(`MediTrack — ${capitalize(reportType)} Reports`, 40, 40);

    const filters = [
      startDate ? `From: ${formatDate(startDate)}` : null,
      endDate ? `To: ${formatDate(endDate)}` : null,
      reportType === "appointments" ? `Status: ${status}` : null,
      search ? `Search: ${search}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    if (filters) {
      doc.setFontSize(10);
      doc.text(`Filters: ${filters}`, 40, 60);
    }

    import("jspdf-autotable").then(() => {
      doc.autoTable({
        head: [tableData.headers],
        body: tableData.rows,
        startY: filters ? 80 : 60,
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

      {/* Filters */}
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

        {(reportType === "patients" || reportType === "doctors") && (
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
                {tableData.headers.map((h) => (
                  <th key={h} className="px-6 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableData.headers.length}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No data for selected filters.
                  </td>
                </tr>
              ) : (
                tableData.rows.map((row, idx) => (
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
