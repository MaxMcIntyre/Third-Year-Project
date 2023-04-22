const Error = props => {
    return (
        <div style={{ textAlign: "center" }}>
            <h2>Oops!</h2>
            <br />
            <p>An unexpected error occurred. Sorry about that.</p>
            <p>{`${props.statusText} - ${props.message}`}</p>
        </div>
    );
}

export default Error;