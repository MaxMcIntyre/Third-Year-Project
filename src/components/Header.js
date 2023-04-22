import '../App.css';

function Header() {
    return (
        <div className="bg-dark py-3 text-center">
            <h1><a style={{color: 'white', textDecoration: 'none'}} href="/">SmartQuestions</a></h1>
        </div>
    );
}

export default Header;