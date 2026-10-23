
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.signup = async (req, res) => {
  const { email, password, organizationName } = req.body;

  if (!email || !password || !organizationName) {
    return res.status(400).json({
      message: "Email, password and organization name are required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must contain at least 8 characters"
    });
  }

  const connection = await db.getConnection();

  try {
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (existing.length) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    const [org] = await connection.execute(
      "INSERT INTO organizations (name) VALUES (?)",
      [organizationName.trim()]
    );

    await connection.execute(
      `INSERT INTO settings
       (organization_id, default_low_stock_threshold)
       VALUES (?, 5)`,
      [org.insertId]
    );

    const [user] = await connection.execute(
      `INSERT INTO users (organization_id, email, password_hash)
       VALUES (?, ?, ?)`,
      [org.insertId, email.trim().toLowerCase(), passwordHash]
    );

    await connection.commit();

    const token = jwt.sign(
      { userId: user.insertId, organizationId: org.insertId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      token
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({
      message: "Unable to create account"
    });
  } finally {
    connection.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  try {
    const [users] = await db.execute(
      `SELECT id, organization_id, email, password_hash
       FROM users
       WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organization_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Login failed"
    });
  }
};
