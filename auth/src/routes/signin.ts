import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@nsth/common";
import { User } from "../models/User";
import { PasswordManager } from "../services/PasswordManager";

const router = express.Router();

router.post('/api/users/signin', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must supply a password')
], validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('Invalid login credentials');
        }

        const passMatch = await PasswordManager.compare(existingUser.password, password);
        if (!passMatch) {
            throw new BadRequestError('Invalid login credentials');
        }

        // generate and store JWT
        const userJWT = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        },
            process.env.JWT_KEY!
        );

        req.session = {
            jwt: userJWT
        };

        res.status(200).send(existingUser);
    })

export { router as signinRouter };