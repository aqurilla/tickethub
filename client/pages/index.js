import buildClient from "../api/buildClient";

const LandingPage = ({ currentUser }) => {
    return currentUser ? <h1>You are signed in</h1> : <h1>You are not signed in</h1>
}

LandingPage.getInitialProps = async (ctx) => {
    const client = buildClient(ctx);
    const { data } = await client.get('/api/users/currentuser');
    return data;
}

export default LandingPage;

