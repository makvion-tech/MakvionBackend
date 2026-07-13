import { Router } from "express";
import prisma from "../prisma.js";
import { Resend } from "resend";

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Fire off the notification email — don't let email failures block the response,
    // since the message is already safely saved in the database either way.
    try {
      const { data, error } = await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: process.env.NOTIFY_EMAIL,
        subject: `New portfolio message from ${name}`,
        html: `
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="color:#888;font-size:12px;">Saved to DB — contact ID ${contact.id}</p>
        `,
      });

      if (error) {
        // Resend doesn't throw on failure — it returns { error } instead, so we have to check this explicitly
        console.error("Resend API returned an error:", error);
      } else {
        console.log("Notification email sent:", data?.id);
      }
    } catch (emailErr) {
      console.error("Notification email failed to send:", emailErr);
      // Intentionally not returning an error to the client here —
      // the message was saved successfully, which is what matters most.
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