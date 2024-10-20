package structs

type Message struct {
	Type         string     `json:"type"`
	Move         []int      `json:"move"`
	InitialGrid  [][]int    `json:"initialGrid"`
	IsMyTurn     bool       `json:"isMyTurn"`
	UserGrid     [][]int    `json:"userGrid"`
	OpponentGrid [][]string `json:"opponentGrid"`
  MoveResult   string     `json:"moveResult"`
  LastMove     []int      `json:"lastMove"`
  Winner       bool       `json:"winner"`
}

// Message sent out by the server
// ------------------------------
// {type: setupGame }
// {type: startGame }

// Messages sent by client (recieved by server)
// --------------------------------------------
// {type: searching }
// {type: cancelSearch }
// {type: ready }


// MoveResult = Miss || Hit/Sink
