import { Ticket } from "../Ticket"

it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'Test',
        price: 5,
        userId: 'abcd1234'
    });

    await ticket.save();

    const firstTk = await Ticket.findById(ticket.id);
    const secondTk = await Ticket.findById(ticket.id);

    firstTk?.set({ price: 10 });
    secondTk?.set({ price: 15 });

    await firstTk?.save();

    try {
        await secondTk?.save();
    } catch (error) {
        return;
    }

    throw new Error('Concurrency failure');
})

it('increments version number on each save', async () => {
    const ticket = Ticket.build({
        title: 'Test',
        price: 5,
        userId: 'abcd1234'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);
})