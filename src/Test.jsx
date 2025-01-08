import axios from 'axios';

function App() {
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        const inputText = document.getElementById('codeInput').value;

        axios.post('http://localhost:8080/execute/test', inputText, {
            headers: {
                'Content-Type': 'text/plain',
            },
        }).then((response) => {
            console.log('Response:', response.data);
        }).catch((error) => {
            console.error('Error:', error);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Code goes below</label>
            <br />
            <textarea id="codeInput" rows="10" cols="30"></textarea>
            <br />
            <button type="submit">Submit!</button>
        </form>
    );
}

export default App;