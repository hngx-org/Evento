import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrtegy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import prisma from './prisma';
import { slugify } from '../services/slugify';

interface User {
    userID: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    slug: string;
}

const opts: any = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    console.log(jwt_payload)
    prisma.user.findUnique({
        where: {
            userID: jwt_payload.sub
        }
    }).then((user) => {
        const userWithoutPassword = {
            id: user?.userID
        }

        if (user) {
            return done(null, userWithoutPassword);
        } else {
            return done(null, false);
        }
    }).catch((err) => {
        return done(err, false);
    });
}));

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
    callbackURL: 'http://localhost:3000/api/v1/auth/google/callback'
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: profile.emails[0].value
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
            const userWithoutPassword = {
                id: newUser.userID
            }
            

            return done(null, userWithoutPassword);
        }
    } catch (err) {
        return done(err, false);
    }
}
));

passport.serializeUser(function(user: User, done) {
    done(null, user.userID);
});

passport.deserializeUser(function(id: string, done) {
    prisma.user.findUnique({
        where: {
            userID: id 
        }
    }).then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err, false);
    });
})




export default passport;