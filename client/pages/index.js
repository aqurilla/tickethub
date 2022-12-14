import buildClient from "../api/buildClient";

const LandingPage = ({ currentUser }) => {
    return <h1>Landing</h1>
}

LandingPage.getInitialProps = async (ctx) => {
    const client = buildClient(ctx);
    const { data } = await client.get('/api/users/currentuser');
    return data;
}

export default LandingPage;

