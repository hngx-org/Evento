import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions  } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrtegy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import prisma from './prisma';
import { slugify } from '../services/slugify';
import { UnauthorizedError } from '../middlewares';

interface User {
    userID: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    slug: string;
}
const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:  process.env.JWT_SECRET, 
};


passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            const user = await prisma.user.findUnique({
              where: {
                userID: jwt_payload.id
            },
              select: {
                userID: true,
              },
            });
        
            if (user) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          } catch (err) {
            return done(err, false);
          }
    })
  );
passport.use(new LocalStrategy( {
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  function(email, password, done) {
    prisma.user.findUnique({
        where: {
            email: email
        }
    }).then((user) => {
        if (!user) {
            return done(null, false);
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return done(err, false);
            }
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }).catch((err) => {
        return done(err, false);
    });
  }
));

passport.use(new GoogleStrtegy({
    clientID: '282222298725-o43ne05ehbf3e4259ib5vdtoe044o7m3.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'https://evento-qo6d.onrender.com/api/v1/auth/google/callback'
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: profile.emails[0].value
            },
            select: {
                userID: true
            }
        });

        if (user) {
            return done(null, user);
        } else {
            const slug = await slugify(profile.displayName);

            const newUser = await prisma.user.create({
                data: {
                    email: profile.emails[0].value,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    password: "",
                    displayName: profile.displayName,
                    profileImage: profile.photos[0].value,
                    googleAccountID: profile.id,
                    slug: slug
                }
            });
            const user = {
                id: newUser.userID
            }
            

            return done(null, user);
        }
    } catch (err) {
        return done(err, false);
    }
}
));

passport.serializeUser(function(user: User, done) {
    console.log(user)
    done(null, user.userID);
});

passport.deserializeUser(function(id: string, done) {
    prisma.user.findUnique({
        where: {
            userID: id,
        },
        select: {
            userID: true,
            email: true,
            firstName: true,
            lastName: true,
            slug: true
        }
    }).then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err, false);
    });
})

export default passport;