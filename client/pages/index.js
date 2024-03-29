import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link
                        href="/tickets/[ticketId]"
                        as={`/tickets/${ticket.id}`}
                        className="nav-link">
                        <span style={{ color: 'blue' }}>View</span>
                    </Link>
                </td>
                <td>{ticket.orderId ? 'Reserved' : ''}</td>
            </tr>
        )
    })

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )
}

LandingPage.getInitialProps = async (ctx, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
}

export default LandingPage;

