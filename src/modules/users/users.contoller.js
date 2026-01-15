import { normalize, validateRegister } from "../../utils/validate.js";
import User from "./users.model.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    // 1️⃣ validate input
    const errorMessage = validateRegister(req.body);
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    const firstName = normalize(req.body.first_name);
    const lastName = normalize(req.body.last_name);
    const email = normalize(req.body.email).toLowerCase();
    const password = req.body.password;

    // 2️⃣ check email duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 3️⃣ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ create user
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully 🧽🎀",
      newUser: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        create_at: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Register error📕🍄" });
  }
};
