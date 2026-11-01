import { Router } from "express";
import prisma from "../prisma.js";
import { Resend } from "resend";

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Escape user input before putting it into the HTML email
const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are all required." });
  }

  try {
    const contact = await prisma.contact.create({
      data: { name, email, message },
    });

    // Don't let email failures block the response; the message is already saved.
    try {
      const { data, error } = await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        // Recipient is fixed on the server (set NOTIFY_EMAIL=makviontech@gmail.com)
        to: process.env.NOTIFY_EMAIL,
        // Hitting "Reply" in Gmail will reply straight to the visitor
        replyTo: email,
        subject: `New portfolio message from ${name}`,
        html: `
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${esc(name)}</p>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${esc(message).replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="color:#888;font-size:12px;">Saved to DB — contact ID ${contact.id}</p>
        `,
      });

      if (error) {
        console.error("Resend API returned an error:", error);
      } else {
        console.log("Notification email sent:", data?.id);
      }
    } catch (emailErr) {
      console.error("Notification email failed to send:", emailErr);
    }

    res.status(201).json({
      message: "Message received.",
      id: contact.id,
      created_at: contact.createdAt,
    });
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).json({ error: "Something went wrong saving your message." });
  }
});

export default router;