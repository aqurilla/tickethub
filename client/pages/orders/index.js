
const OrderIndex = ({ orders }) => {
    return (
        <div>
            <h1>My Orders</h1>
            <ul>
                {orders.map((order) => (
                    <li key={order.id}>
                        {order.ticket.title}: {order.status}
                    </li>
                ))}
            </ul>
        </div>
    )
}

OrderIndex.getInitialProps = async (ctx, client) => {
    const { data } = await client.get('/api/orders');
    return { orders: data };
}

export default OrderIndex;