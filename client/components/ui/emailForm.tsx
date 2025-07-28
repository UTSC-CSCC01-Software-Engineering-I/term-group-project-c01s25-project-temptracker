"use client";

import { useState } from "react";

export default function EmailForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const sendEmail = async () => {
    setStatus("sending");

    try {
      const res = await fetch("http://localhost:8080/api/notify-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setStatus("sent");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Send Email to All Users</h2>
      <input
        type="text"
        placeholder="Subject"
        className="w-full border px-3 py-2 rounded"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        placeholder="Message"
        className="w-full border px-3 py-2 rounded min-h-[100px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={sendEmail}
        disabled={status === "sending"}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send Email"}
      </button>
      {status === "sent" && <p className="text-green-600">Emails sent successfully!</p>}
      {status === "error" && <p className="text-red-600">Failed to send emails.</p>}
    </div>
  );
}
