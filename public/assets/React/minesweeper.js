/**
 *
 *  1. Display the location for each move in the format (col, row) in the move history list. // complete
 *
 *  2. Bold the currently selected item in the move list.  //complete
 *
 *  3. Rewrite Board to use two loops to make the squares instead of hardcoding them.  //complete
 *
 *  4. Add a toggle button that lets you sort the moves in either ascending or descending order.  //complete
 *
 *  5. When someone wins, highlight the three squares that caused the win.  // complete
 *
 *  6. When no one wins, display a message about the result being a draw. // complete
 **/


/**
 * Calculate winning case,
 * 8 winning case,
 * if one of case contain same value (match one chain)
 * Winning result
**/
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            //return squares[c];
            return [a,b,c]; //return winning caused
        }
    }
    return null;
}

/**
 *
 * @param props
 *      style: normal square or winning case chain
 *      onClick(): Trigger of event listener
 *      value: value of current square (O,X,{empty})
 * @returns {*}
 *      JSX: button of square contain the square value
 * @constructor
 *      Empty
 */
function Square(props) {
    return (
        <button style={props.style} className="square" onClick={()=> props.onClick()}>
            {props.value}
        </button>
    );
}

// Winner Sytle chain
const winerStyle = {
    color: 'red'
};

// Border width
const rowWidth = {
    minWidth: "100px"
};

/**
 *
 * Board:
 *      contain: {height * width} squares
 *      pass each
 *          props.squares.value into squares
 *          props.onClick action into squares
 *          winner style if winning case chain
 *
 */

class Board extends React.Component {

    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }
    renderWinnerSquare(i) {
        return (
            <Square
                style={winerStyle}
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let winSquare = this.props.winSquare;
        if(winSquare){
            //console.log(winSquare);
        }else{
            winSquare = [-1];
        }
        //console.log(winSquare.indexOf(1));

        let rows = [];
        // replace y and x range with
        // this.props.height and
        // this.props.width
        // can adjust the board size dynamically
        for(let y=0; y < 3; y++) {
            let squares = [];
            for (let x = 0; x < 3; x++) {
                if(winSquare.indexOf(y*3+x) !== -1) {
                    squares.push(this.renderWinnerSquare(y * 3 + x));
                }else{
                    squares.push(this.renderSquare(y * 3 + x));
                }
            }
            rows.push(
                <div key={y*3} className="board-row">
                    {squares}
                </div>
            )
        }

        return (
            <div style={rowWidth}>
                {rows}
            </div>
        );
    }
}

/**
 *
 *  Game
 *
 *
 *  @Constructor
 *      state;
 *          history:
 *              array of squares ( array of square with size (9))
 *              location: currently step location {y,x}
 *          stepNumber: number of step placed
 *          xIsNext: check if player is next step
 *          isAscending: Place history record in ascending of descending order
 *          isDraw: if all squares fill up and no winner
 */

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                location: [0,0],
            }],
            stepNumber: 0,
            xIsNext: true,
            isAscending: true,
            isDraw: false,
        };
    }

    // .slice() return shallow copy of array
    // .concat() return new array, merge two or more arrays
    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const y_axis = Math.floor(i/3) + 1;
        const x_axix = i%3 +1;
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';

        //if null or undefined false, otherwise true
        let gameOver = !!(this.state.stepNumber+1 === 9);
        // set game over when fill up all field

        this.setState({
            history: history.concat([{
                squares: squares,
                location:[y_axis,x_axix],
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            isDraw: gameOver,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    RestartGame(){
        let step = 0;
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    sortMove(isAscending){
        this.setState({
            isAscending: !isAscending,
        })
    }

    render() {
        console.log(this.state.isDraw);
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winSquare = calculateWinner(current.squares);
        let winner = null;
        if(winSquare) {
            winner = current.squares[winSquare[0]];
        }
        const myOrder = this.state.isAscending ? (history.slice(0)) : (history.slice(0).reverse());

        const moves = myOrder.map((step, move) => {
            const myMove = this.state.isAscending ? (move) : (myOrder.length-move);
            const desc = myMove ?
                'Go to move #' + myMove :
                'Go to game start';

            let list = null;
            if(move === this.state.stepNumber){
                list = <div>
                    <strong>
                        Location ({step.location[0]}, {step.location[1]})
                    </strong>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </div>
            }else{
                list = <div>
                    Location ({step.location[0]}, {step.location[1]})
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </div>
            }

            return (
                <li key={move}>
                    {list}
                </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            if(!this.state.isDraw) {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }else{
                status = "Game Over, Draw";
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winSquare={winSquare}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <button onClick={() => this.sortMove(this.state.isAscending)}>{this.state.isAscending ? "Asc": "Des"}</button>
                    <button onClick={() => this.RestartGame()}>Reset Game</button>
                    <div>{status}</div>
                    <ol reversed={!this.state.isAscending}>{moves}</ol>
                </div>
            </div>
        );
    }
}


// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
