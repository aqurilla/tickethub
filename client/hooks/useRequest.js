import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);
    const doRequest = async () => {
        try {
            setErrors([]);
            const response = await axios[method](url, body);
            if (onSuccess) {
                onSuccess(response.data);
            }
            return response.data;
        } catch (error) {
            setErrors(<div className="alert alert-danger">
                <h4>Errors:</h4>
                <ul className="my-0">
                    {error.response.data.errors.map((e, i) => <li key={i}>{e.message}</li>)}
                </ul>
            </div>);
        }
    }

    return { doRequest, errors };
}

export default useRequest;