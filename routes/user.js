const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/signup', (req, res) => {
  let user = req.body;
  let query = `
  select email, password, role, status from user 
  where email = ?`;
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        let status = user.status || 'false';
        let role = user.role || 'user';
        query = `insert into user 
                  (
                    name,
                    contactNumber,
                    email,
                    password,
                    status,
                    role
                  ) values 
                  ( ?, ?, ?, ?, ?, ? )`;
        connection.query(query, [user.name, user.contactNumber, user.email, user.password, status, role], (err, results) => {
          if (!err) {
            return res.status(200).json({ message: "Registro exitoso" });
          } else {
            return res.status(500).json(err);
          }
        });
      } else {
        return res.status(400).json({ message: "El correo electrónico ya existe." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post('/login', (req, res) => {
  const user = req.body;
  query = `
  select email, password, role, status from user 
  where email = ?`;
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
      } 
      else if (results[0].status === 'false') {
        return res.status(401).json({ message: "Espere aprobación del administrador" });
      } 
      else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role }
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
        res.status(200).json({ token: accessToken});
      } 
      else {
        return res.status(400).json({ message: "Algo salió mal. Inténtalo de nuevo más tarde." });
      }
    } 
    else {
      return res.status(500).json(err);
    }
  });
});

var transporter = nodemailer.createTransport ({ 
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  }
});

router.post('/forgotPassword', (req, res) => {
  const user = req.body;
  query = `select email, password from user where email = ?`;
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(200).json({ message: "No se encontró el correo electrónico." });
      } else {
        const mailOptions = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: 'Restablecer contraseña - Cafe Management System',
          html: '<p><b>Your Login details for Cafe Management System</b><br><b>Email: </b>' + results[0].email + '<br><b>Password: </b>' + results[0].password + '<br><a href="http://localhost:4200">Click here to Login</a></p>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar el correo:', error);
            return res.status(500).json({ message: "Error al enviar el correo electrónico." });
          } else {
            console.log('Correo electrónico enviado:', info.response);
            return res.status(200).json({ message: "Contraseña enviada con éxito a tu correo electrónico." });
          }
        });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});


router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
  var query = `
  select id, name, email, contactNumber, status from user 
  where role = 'user'`;
  connection.query(query,(err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let user = req.body;
  var query = `update user set status = ? where id = ?`;
  connection.query(query, [ user.status, user.id ], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "El ID de usuario no existe" });
      }
      return res.status(200).json({ message: "Usuario actualizado con éxito" });
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get('/checkToken', auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "Token válido" });
});

router.post ('/changePassword', auth.authenticateToken, (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  var query = `select * from user where email = ? and password = ?`;
  connection.query(query, [ email, user.oldPassword ], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(404).json({ message: "Contraseña antigua incorrecta" });
      }
      else if (results[0].password == user.oldPassword) {
        query = `update user set password = ? where email = ?`;
        connection.query(query, [ user.newPassword, email ], (err, results) => {
          if (!err) {
            return res.status(200).json({ message: "Contraseña actualizada con éxito" });
          } else {
            return res.status(500).json(err);
          }
        });
      }
      else {
        return res.status(400).json({ message: "Algo salió mal. Intentenlo de nuevo más tarde" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;