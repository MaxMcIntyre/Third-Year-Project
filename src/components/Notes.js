import NoteCard from './NoteCard';
import NewNotes from './NewNotes';

const Notes = props => {
    return (
        <div>
            <h2 style={{ textAlign: "center" }}>Notes for {props.courseName}</h2>
            <NoteCard name="Lexing" />
            <NoteCard name="Syntax Analysis" />
            <br />
            <NewNotes />
        </div>
    );
}

export default Notes;