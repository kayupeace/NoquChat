// function
/**
function Clock(props){
    return (
        <div>
            <h1> Hello, world!</h1>
            <h2>It is {props.date.toLocaleTimeString()}.</h2>
        </div>
    )
}
 **/

/** class **/
function FormattedDate(props){
    return <h2>It is {props.date.toLocaleTimeString()}.</h2>
}
class Clock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {date: new Date()};
        this.mess = {data: "Hello"};
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => {
                this.tick();
            },
            1000
        );

    }

    tick() {

        this.setState({
            date: new Date()
        });
    }

    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
                <h1>message: {this.mess.data} </h1>
                <FormattedDate date={this.state.date}/>
            </div>
        );
    }
}

function App() {
    return (
        <div>
            <Clock />
            <Clock />
            <Clock />
        </div>
    );
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

