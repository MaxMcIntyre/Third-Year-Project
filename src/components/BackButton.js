import React from 'react';
import { Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const BackButton = () => {
    const history = useHistory();

    const handleClick = () => {
        history.goBack();
    };

    return (
        <Button onClick={handleClick} style={{ minWidth: "15%" }} variant="secondary" type="submit">
            Go Back
        </Button>
    );
};

export default BackButton;