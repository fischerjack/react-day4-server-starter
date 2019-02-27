const express = require('express');
const authRoutes = express.Router();

const passport = require('passport');
const bcrypt = require('bcryptjs');

//Require user model
const User = require('../models/user-model');


//SIGNUP ROUTE
authRoutes.post('/signup', (req, res, next) => {
  const {username, password} = req.body;

  if(!username || !password){
    res.status(400).json({message: 'Provide username and password'});
    return;
  }

  if(password.length < 7){
    res.status(400).json({message: 'Please make your password at least 7 characters long'});
    return;
  }

  User.findOne({username}, (err, foundUser) => {
    if(err){
      res.status(500).json({message: 'An error occurred during username check'});
      return;
    }

    if(foundUser){
      res.status(400).json({message: 'Username already taken. Please choose a different one.'});
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hash
    });

    newUser.save(err => {
      if(err){
        res.status(400).json({message: 'Error occurred during saving user to database'});
        return;
      }

      //Auto login user after signup
      //.login here is a predefined passport method
      req.login(newUser, err => {
        if(err){
          res.status(400).json({message: 'Error occurred during auto-login after signup'});
          return;  
        }

        // Send the user's information to the frontend
        // We can use also: res.status(200).json(req.user);
        res.status(200).json(newUser);
      });
    });
  });
});


//LOGIN ROUTE
authRoutes.post('/login', (req,res,next) => {
  passport.authenticate('local', (err, user, failureDetails) => {
    if(err){
      res.status(500).json({message: 'Error occurred during authenticating the user'});
      return;
    }

    if(!user){
      //failureDetails contains error message from 
      //logic in 'LocalStrategy' {message:'...'}
      res.status(401).json(failureDetails);
      return;
    }

    req.login(user, err => {
      if(err){
        res.status(500).json({message: 'Error occurred during session save'});
      }

      //Login successful
      res.status(200).json(user);
    });

  })(req,res,next);
});


//LOGOUT ROUTE
authRoutes.post('/logout', (req,res,next) => {
  //req.logout() is defined by passport
  req.logout();
  res.status(200).json({message: 'logout successful'});
});

authRoutes.post('/loggedin', (req,res,next) => {
  //req.isAuthenticated() is defined by passport
  if(req.isAuthenticated()){
    res.status(200).json(req.user);
    return;
  }
  res.status(403).json({message: 'unauthorized'});
});

module.exports = authRoutes;