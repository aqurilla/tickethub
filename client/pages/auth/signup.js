import { useState } from "react";
import axios from "axios";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);

    const onSubmit = async (event) => {
        event.preventDefault();

        try {
            await axios.post('/api/users/signup', {
                email, password
            });
            setErrors([]);
        } catch (error) {
            setErrors(error.response.data.errors);
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <h1>Sign Up</h1>
            <div className="form-group">
                <label>Email Address</label>
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-control"></input>
            </div>
            <div className="form-group">
                <label>Password</label>
                <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type="password"
                    className="form-control"></input>
            </div>
            {errors.length > 0 && <div className="alert alert-danger">
                <h4>Errors:</h4>
                <ul className="my-0">
                    {errors && errors.map((e, i) => <li key={i}>{e.message}</li>)}
                </ul>
            </div>}

            <button className="btn btn-primary">Sign Up</button>
        </form>
    )
}

export default Signup