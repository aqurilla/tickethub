import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError } from "../errors/BadRequestError";
import { validateRequest } from "../middlewares/validateRequest";
import { User } from "../models/User";

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Invalid email'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 30 })
        .withMessage('Password must be between 4 & 30 characters')
], validateRequest, async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email already in use');
    }

    const user = User.build({
        email,
        password
    });
    await user.save();

    // generate and store JWT
    const userJWT = jwt.sign({
        id: user.id,
        email: user.email
    },
        process.env.JWT_KEY!
    );

    req.session = {
        jwt: userJWT
    };

    res.status(201).send(user);
})

export { router as signupRouter };