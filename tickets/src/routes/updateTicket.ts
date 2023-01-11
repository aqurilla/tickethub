import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { validateRequest, NotFoundError, requireAuth, UnauthorizedError } from "@nsth/common";
import { Ticket } from "../models/Ticket";
import { TicketUpdatedPublisher } from "../events/publishers/TicketUpdatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.put('/api/tickets/:id',
    requireAuth,
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new UnauthorizedError();
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price
        })
        await ticket.save();

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        });

        res.send(ticket);
    }
)

export { router as updateTicketRouter }