package ws

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/sagepages/battleship-server/structs"
	"github.com/sagepages/battleship-server/utils"
)

func WebsocketHandler(pool *structs.Pool, w http.ResponseWriter, r *http.Request) error {
	// Will upgrade a connection
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	// upgrade the connection
	conn, upgradeErr := upgrader.Upgrade(w, r, nil)
	if upgradeErr != nil {
		return fmt.Errorf("error")
	}

	// Create a uuid
	uuid, err := utils.CreateUUID()
	if err != nil {
    return fmt.Errorf("%v", err)
	}

	// Create a new player with struct
	newPlayer := structs.Player{ID: string(uuid), Conn: conn, Pool: pool}

	// Send player to the pool channel to be registered
	pool.Register <- &newPlayer

	newPlayer.Read()

	return nil
}
