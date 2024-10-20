package structs

import (
	"log"
	"sync"

	"github.com/sagepages/battleship-server/utils"
)

type Queue struct {
	mutex    sync.Mutex
	elements []*Player
}

type Pool struct {
	Players    map[string]Player
	Register   chan *Player
	Unregister chan *Player
	Queue      Queue
	Games      map[string]Game
}

func (q *Queue) Enqueue(ptr *Player) {
	q.mutex.Lock()
	log.Printf("%v was added to queue", ptr.ID)
	q.elements = append(q.elements, ptr)
	q.mutex.Unlock()
}

func (q *Queue) Dequeue() *Player {
	q.mutex.Lock()
	if len(q.elements) == 0 {
		q.mutex.Unlock()
		return nil
	}
	elem := q.elements[0]       // Get the first element
	q.elements = q.elements[1:] // Remove the first element by slicing
	q.mutex.Unlock()
	return elem // Return the dequeued element
}

func (q *Queue) IsEmpty() bool {
	return len(q.elements) == 0
}

func (q *Queue) DequeueTargetPlayer(pptr *Player) *Player {
	q.mutex.Lock()
	for idx, val := range q.elements {
		if val == pptr {
			log.Printf("%+v was removed from queue", pptr)
			ptr := q.elements[idx]
			q.elements = append(q.elements[:idx], q.elements[idx+1:]...)
			q.mutex.Unlock()
			return ptr
		}
	}
	q.mutex.Unlock()
	return nil
}

func NewPool() *Pool {
	return &Pool{Players: make(map[string]Player), Register: make(chan *Player), Unregister: make(chan *Player), Queue: Queue{elements: []*Player{}}}
}

func (pool *Pool) Run() {

	go pool.WatchQueue()

	for {
		select {
		case player := <-pool.Register:
			pool.Players[player.ID] = *player
			log.Println("Added new player to pool: ", player.ID)
			break

		case player := <-pool.Unregister:
			log.Printf("Removing player %v\n", player.ID)
			pool.Queue.DequeueTargetPlayer(player)
			delete(pool.Players, player.ID)
			break
		}
	}
}

func (pool *Pool) WatchQueue() {

	for {
		if len(pool.Queue.elements) >= 2 {
			playerOne := pool.Queue.Dequeue()
			playerTwo := pool.Queue.Dequeue()
			log.Printf("We've paired player %v with player %v\n", playerOne.ID, playerTwo.ID)
			// Create a game and register

			uuid, err := utils.CreateUUID()
			if err != nil {
				// Requeue both players
				pool.Queue.Enqueue(playerOne)
				pool.Queue.Enqueue(playerTwo)
			} else {
				// Create new game
				// Add both players to it
				newGame := Game{ID: string(uuid), States: make(map[string]State), Status: "waiting", PlayersReady: make(map[string]bool)}
				// Append both players to newGame
				newGame.Players[0] = playerOne
				newGame.Players[1] = playerTwo

				playerOne.Game = &newGame
				playerTwo.Game = &newGame
				// Send some message back to clients to kickstart the UI change
				startGameMessage := Message{Type: "setupGame"}
				pOneErr := playerOne.Conn.WriteJSON(startGameMessage)
				pTwoErr := playerTwo.Conn.WriteJSON(startGameMessage)
				log.Println("New game successfully created and awaiting messages!!!")
				if pOneErr != nil && pTwoErr != nil {
					// Requeue and remove game from history
					pool.Queue.Enqueue(playerOne)
					pool.Queue.Enqueue(playerTwo)
					playerOne.Game = nil
					playerTwo.Game = nil
				}
			}
		}
	}
}
