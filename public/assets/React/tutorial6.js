class NameForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            textValue: 'Please write an essay about your favorite DOM element.',
            selectValue: 'coconut'
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.handleTextSubmit = this.handleTextSubmit.bind(this);
        this.handleSelectSubmit = this.handleSelectSubmit.bind(this);
    }

    handleChange(event) {
        const name = event.target.name;
        this.setState({
            [name]: event.target.value
        })
    }
    handleInputSubmit(event) {
        alert('A name was submitted: ' + this.state.inputValue);
        event.preventDefault();
    }

    handleTextSubmit(event) {
        alert('A essay was submitted: ' + this.state.textValue);
        event.preventDefault();
    }

    handleSelectSubmit(event) {
        alert('Your select flavor is: ' + this.state.selectValue);
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSelectSubmit}>
                    <label>
                        Pick your favorite La Croix flavor:
                        <select name="selectValue" value={this.state.selectValue} onChange={this.handleChange}>
                            <option value="grapefruit">Grapefruit</option>
                            <option value="lime">Lime</option>
                            <option value="coconut">Coconut</option>
                            <option value="mango">Mango</option>
                        </select>
                    </label>
                    <input type="submit" value="Submit" />
                </form>

                <form onSubmit={this.handleTextSubmit}>
                    <label>
                        Essay:
                        <textarea name="textValue" value={this.state.textValue} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>

                <form onSubmit={this.handleInputSubmit}>
                    <label>
                        Name:
                        <input name="inputValue" type="text" value={this.state.inputValue} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}

ReactDOM.render(
    <NameForm />,
    document.getElementById('root5')
);