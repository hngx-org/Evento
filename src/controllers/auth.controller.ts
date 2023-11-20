import { Request, Response, NextFunction } from 'express';
import bycript from 'bcryptjs';
import prisma from "../utils/prisma";
import {BadRequestError} from "../middlewares";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, fullName, role, username } = req.body;

        const requiredFields = ['email', 'password', 'fullName', 'role', 'username'];

        const fieldDisplayNames = {
            email: 'Email',
            password: 'Password',
            fullName: 'Full name',
            role: 'Role',
            username: 'Username'
          };
          
          const missingFields = requiredFields.filter(field => !req.body[field]);
          
          if (missingFields.length > 0) {
            const errorMessage = missingFields.length === 1
              ? `${fieldDisplayNames[missingFields[0]]} is required`
              : `${missingFields.map(field => fieldDisplayNames[field]).join(', ')} are required`;
          
            return res.status(400).json({
              message: 'Validation error',
              errors: errorMessage,
            });
          }
          
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Validation error',
                errors: 'Password must be at least 6 characters',
            });
        }

    const hashedPassword = await bycript.hash(password, 10);
    
    const user = await prisma.user.findUnique({
        where: {
                email
            }
        });
    if (user) {
        throw new BadRequestError("User already exists");
    }
    
    const createdUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            fullName,
            role,
            username
        }
    });
    const userWithoutPassword = {
        email: createdUser.email,
        fullName: createdUser.fullName,
        username: createdUser.username,
    }

    res.status(200).json({
        message: "User created successfully",
        user: userWithoutPassword
    });
    } catch (error) {
        next(error);
    }
}


