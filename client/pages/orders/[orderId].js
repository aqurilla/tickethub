import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { STRIPE_PUBLISHABLE_KEY } from "../../stripe/config";
const REFRESH_INTERVAL = 1000;

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };
        findTimeLeft(); // initialize timeLeft
        const timerId = setInterval(findTimeLeft, REFRESH_INTERVAL);

        // this function gets called when 
        // navigating away from the component
        return () => {
            clearInterval(timerId);
        }
    }, []);

    if (timeLeft <= 0) {
        return <div>Order Expired</div>
    }

    return (
        <div>
            Time left until order expiry: {timeLeft} seconds
            <StripeCheckout
                token={(token) => console.log(token)}
                stripeKey={STRIPE_PUBLISHABLE_KEY}
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
        </div>
    );
}

OrderShow.getInitialProps = async (ctx, client, currentUser) => {
    const { orderId } = ctx.query;
    const { data } = await client.get(`/api/orders/${orderId}`)
    return { order: data, currentUser };
}

export default OrderShow;