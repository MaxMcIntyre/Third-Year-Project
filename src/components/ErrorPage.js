import { useRouteError } from "react-router-dom";

const Error = () => {
    const error = useRouteError();
    console.log(error);

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Oops!</h2>
            <p>An unexpected error occurred. Sorry about that.</p>
            <p>{error.statusText || error.message}</p>
        </div>
    );
}

export default Error;