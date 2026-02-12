import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Gmail App Password
            },
        });

        const mailOptions = {
            from: `"EV App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Unable to send email");
    }
};

export default sendEmail;
