import { useState, useEffect } from "react";

function DoctorForm({ onSubmit, initialData = {}, closeModal }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    availableSlots: "",
  });

  useEffect(() => {
    if (initialData._id) {
      setForm({
        ...initialData,
        availableSlots: initialData.availableSlots?.join(", "),
      });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedSlots = form.availableSlots
      .split(",")
      .map((s) => new Date(s.trim()));
    onSubmit({ ...form, availableSlots: formattedSlots });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {["name", "email", "phone", "specialty"].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field}
          value={form[field]}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
      ))}

      <textarea
        name="availableSlots"
        placeholder="Available Slots (comma separated datetime)"
        value={form.availableSlots}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default DoctorForm;
