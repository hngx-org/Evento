import { Request, Response, NextFunction } from 'express';
import passport  from  '../utils/passport'
import { UnauthorizedError } from './errorhandler';


export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new UnauthorizedError('Not authorized to access this resource🤔'));
    }
    
    next();
  })(req, res, next);
};
