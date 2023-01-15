const TicketShow = ({ ticket }) => {
    return (<div>
        <h1>{ticket.title}</h1>
        <h4>{ticket.price}</h4>
    </div>);
}

TicketShow.getInitialProps = async (ctx, client) => {
    const { ticketId } = ctx.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);

    return { ticket: data };
}

export default TicketShow;