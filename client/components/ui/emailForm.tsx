"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { toast } from "sonner";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

export default function EmailForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setStatus("sending");

    try {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

      const res = await axios.post(
        `${API_BASE_URL}/notify-all`,
        { subject, message },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status !== 200) throw new Error("Failed to send");

      setStatus("sent");
      setSubject("");
      setMessage("");
      toast.success("Emails sent successfully to all users!");
    } catch (error) {
      console.error(error);
      setStatus("error");
      toast.error("Failed to send emails. Please try again.");
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-nav-blue px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          Send Email to Users
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Send an email notification to all users who have enabled community
          updates
        </p>
      </div>

      <div className="p-6 space-y-6">

        {/* excess styles on inputs b/c the entire admin page doesnt support dark mode*/}
        <Input
          id="subject"
          type="text"
          placeholder="Email Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={status === "sending"}
          className="text-lg font-medium h-12 bg-white dark:bg-white border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900 placeholder:text-gray-500 placeholder:font-normal dark:placeholder:text-gray-500 dark:placeholder:font-normal focus:border-nav-blue dark:focus:border-nav-blue focus:ring-nav-blue dark:focus:ring-nav-blue"
        />

        <Textarea
          id="message"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "sending"}
          rows={8}
          className="resize-none text-sm leading-relaxed mb-3 bg-white dark:bg-white border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900 placeholder:text-gray-500 placeholder:font-normal dark:placeholder:text-gray-500 focus:border-nav-blue dark:focus:border-nav-blue focus:ring-nav-blue dark:focus:ring-nav-blue"
        />

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm">
            {status === "sent" && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  Emails sent successfully!
                </span>
              </>
            )}
            {status === "error" && (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">
                  Failed to send emails
                </span>
              </>
            )}
          </div>

          <Button
            onClick={sendEmail}
            disabled={
              status === "sending" || !subject.trim() || !message.trim()
            }
            className="px-6 py-3 text-base font-medium"
            size="lg"
          >
            {status === "sending" ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
