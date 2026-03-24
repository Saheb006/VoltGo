import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json(
            new ApiResponse(400, null, "All fields are required")
        );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid email format")
        );
    }

    console.log("Contact form submission:", { name, email, subject, message });

    try {
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: ["voltevgo@gmail.com"],
            subject: `VoltGo Contact: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p>${message}</p>
            `,
        });

        if (error) {
            console.error(error);
            return res.status(500).json(
                new ApiResponse(500, null, "Failed to send message")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, null, "Message sent successfully!")
        );

    } catch (error) {
        console.error(error);
        return res.status(500).json(
            new ApiResponse(500, null, "Something went wrong")
        );
    }
});