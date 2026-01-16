import { Contact } from "./contact.model.js";

export const createContact = async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields (firstName, lastName, email, message)."
            });
        }

        const newContact = await Contact.create({
            firstName,
            lastName,
            email,
            message
        });

        // Response
        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully!",
            data: newContact
        });
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ success: false, message: "Failed to send message." });
    }
};