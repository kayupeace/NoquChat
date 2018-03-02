

function UserGreeting(props) {
    return <div>
                <h1>Welcome back!</h1>
                {props.children}
           </div>;
}

function GuestGreeting(props) {
    return <h1>Please sign up.</h1>;
}

function Greeting(props){
    const isLoggedIn = props.isToggleOn;
    if(isLoggedIn){
        return <UserGreeting>
                    <h1>my child</h1>
               </UserGreeting>;
    }else{
        return <GuestGreeting />;
    }
}

class Toggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isToggleOn: true};

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(message) {
        console.log(message);
        this.setState(prevState => ({
            isToggleOn: !prevState.isToggleOn
        }));
    }

    render() {
        return (
            <div>
                <Greeting isToggleOn={this.state.isToggleOn}/>
                <button onClick={this.handleClick.bind(this,"my messsage1")}>
                    {this.state.isToggleOn ? 'ON' : 'OFF'}
                </button>
                <button onClick={this.handleClick.bind(this,"my messsage2")}>
                    {this.state.isToggleOn ? 'ON' : 'OFF'}
                </button>
                <button onClick={this.handleClick}>
                    {this.state.isToggleOn ? 'ON' : 'OFF'}
                </button>
            </div>
        );
    }
}

ReactDOM.render(
    <Toggle />,
    document.getElementById('root2')
);