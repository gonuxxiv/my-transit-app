const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);
app.listen(3000, () => console.log("Server Running"));
require("dotenv").config();

const contactEmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "geun.git.it@gmail.com",
    pass: process.env.REACT_APP_EMAIL_PASSWORD,
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

router.post("/", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message; 
    const mail = {
      from: name,
      to: "geun.git.it@gmail.com",
      subject: "Contact Form Submission for my-transit-app",
      html: `<p>Name: ${name}</p>
             <p>Email: ${email}</p>
             <p>Message: ${message}</p>`,
    };
    contactEmail.sendMail(mail, (error) => {
      if (error) {
        res.json({ status: "ERROR" });
      } else {
        res.json({ status: "Message Sent" });
      }
    });
  });

  