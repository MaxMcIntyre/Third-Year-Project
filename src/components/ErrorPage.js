import BackButton from './BackButton';

const Error = props => {
    return (
        <div style={{ textAlign: "center" }}>
            <h2>Oops!</h2>
            <br />
            <p>An unexpected error occurred. Sorry about that.</p>
            <p>{`${props.statusText} - ${props.message}`}</p>
            <BackButton />
        </div>
    );
}

export default Error;