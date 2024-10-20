package structs

import (
	"log"

	"github.com/gorilla/websocket"
)

type Player struct {
	ID   string
	Conn *websocket.Conn
	Pool *Pool
	Game *Game
}

func (player *Player) Read() {

	defer func() {
		player.Pool.Unregister <- player
		player.Conn.Close()
	}()

	for {

		message := Message{}

		err := player.Conn.ReadJSON(&message)
		if err != nil {
			log.Println(err)
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure, websocket.CloseNoStatusReceived) {
				return
			}
		}

		msgType := message.Type

		switch {
		case msgType == "searching":
			player.Pool.Queue.Enqueue(player)
		case msgType == "cancelSearch":
			player.Pool.Queue.DequeueTargetPlayer(player)
		case msgType == "ready":
			if message.InitialGrid != nil {
				player.Game.States[player.ID] = State{Grid: message.InitialGrid}
				player.Game.SetPlayerToReady(player)
				// Check if both players are ready to GAME!
				if player.Game.CheckForReady() {
					// WE NEED TO SEND GAME STATE!!
					startGameMsg := Message{
						Type:         "startGame",
						IsMyTurn:     true,
						UserGrid:     player.Game.GetGrid(player.Game.Players[0].ID),
						OpponentGrid: player.Game.Fogify(player.Game.GetGrid(player.Game.Players[1].ID)),
					}
					startGameMsg2 := Message{
						Type:         "startGame",
						IsMyTurn:     false,
						UserGrid:     player.Game.GetGrid(player.Game.Players[1].ID),
						OpponentGrid: player.Game.Fogify(player.Game.GetGrid(player.Game.Players[0].ID)),
					}
					players, err := player.Game.GetTwoPlayersID()
					if err != nil {
						log.Printf("Shits broken man %v", err)
					} else {
						err := player.Pool.Players[players[0]].Conn.WriteJSON(&startGameMsg)
						errOp := player.Pool.Players[players[1]].Conn.WriteJSON(&startGameMsg2)
						if err != nil && errOp != nil {
							log.Printf("Shit is even worse man.... %v - %v", err, errOp)
						}
					}
				}
			}
		case msgType == "move":

			currentPlayerID := player.ID
			playersID, err := player.Game.GetTwoPlayersID()
			if err != nil {
				log.Print("Error getting players ID's")
			}
			opposingPlayerID := findOpposingPlayerID(currentPlayerID, playersID)
			if opposingPlayerID != "" {
				opposingPlayerState := player.Game.States[opposingPlayerID]
				moveResult := opposingPlayerState.ShootAtGrid(message.Move)

				// Check if game is over
				if opposingPlayerState.CheckIfGameOver() {
					winnerMessage := Message{Type: "gameOver", Winner: true}
					loserMessage := Message{Type: "gameOver", Winner: false}

					for i := range player.Game.Players {
						if currentPlayerID != player.Game.Players[i].ID {
							currPlayerErr := player.Conn.WriteJSON(winnerMessage)
							opposingPlayerErr := player.Game.Players[i].Conn.WriteJSON(loserMessage)
							if currPlayerErr != nil && opposingPlayerErr != nil {
								log.Println(" Failure sending turn message to both players.")
							}
						}
					}
				}

				currentPlayerOutgoingMessage := Message{
					Type:         "turn",
					UserGrid:     player.Game.GetGrid(currentPlayerID),
					OpponentGrid: player.Game.Fogify(player.Game.GetGrid(opposingPlayerID)),
					MoveResult:   moveResult,
					IsMyTurn:     false,
					LastMove:     message.Move}

				opposingPlayerOutgoingMessage := Message{
					Type:         "turn",
					UserGrid:     player.Game.GetGrid(opposingPlayerID),
					OpponentGrid: player.Game.Fogify(player.Game.GetGrid(currentPlayerID)),
					MoveResult:   moveResult,
					IsMyTurn:     true,
					LastMove:     message.Move}

				// Get opposite player connection
				for i := range player.Game.Players {
					if currentPlayerID != player.Game.Players[i].ID {
						currPlayerErr := player.Conn.WriteJSON(currentPlayerOutgoingMessage)
						opposingPlayerErr := player.Game.Players[i].Conn.WriteJSON(opposingPlayerOutgoingMessage)
						if currPlayerErr != nil && opposingPlayerErr != nil {
							log.Println(" Failure sending turn message to both players.")
						}
					}
				}
			}
		}
	}
}
