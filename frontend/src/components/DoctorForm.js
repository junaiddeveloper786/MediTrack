import React, { useState, useEffect } from "react";

function DoctorForm({ onSubmit, initialData = {}, isEditing }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    availableSlots: [], // Keep it simple as JSON text for now
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      form.availableSlots = JSON.parse(form.availableSlots); // convert string to array
    } catch {
      alert("Invalid slot format");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        placeholder="Name"
        className="input"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        placeholder="Email"
        className="input"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="phone"
        placeholder="Phone"
        className="input"
        value={form.phone}
        onChange={handleChange}
        required
      />
      <input
        name="specialty"
        placeholder="Specialty"
        className="input"
        value={form.specialty}
        onChange={handleChange}
        required
      />

      <textarea
        name="availableSlots"
        placeholder='[{ "date": "2025-08-07", "times": ["10:00", "11:00"] }]'
        className="input"
        rows={3}
        value={JSON.stringify(form.availableSlots)}
        onChange={handleChange}
        required
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded">
        {isEditing ? "Update" : "Add"} Doctor
      </button>
    </form>
  );
}

export default DoctorForm;
