import express, { Router, Request, Response, NextFunction } from "express";
import { login, register, google, oauthToken, authenticateJWT } from "../controllers/auth.controller";
import passport from '../utils/passport';

const router: Router = express.Router();

router.post('/register', register);


router.post('/login', login);


router.get('/login', (req, res) => {
    res.send('Login page');
});  

router.get('/google', google);

router.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/', 
  failureRedirect: 'http://localhost:3000/api/v1/login' }));

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
router.get('/authorize', oauthToken);

router.get('/protected', authenticateJWT, (req, res) => {
  res.send({msg: 'I am protected and you are authorized'});
});

module.exports = router;