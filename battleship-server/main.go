package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/sagepages/battleship-server/structs"
	"github.com/sagepages/battleship-server/ws"
)

func SetupServerRoutes() {
	// Create empty pool of clients
	pool := structs.NewPool()
	go pool.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		err := ws.WebsocketHandler(pool, w, r)
		if err != nil {
			log.Fatalf("Error upgrading connection to WS")
		}
	})
	http.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Hello World")
	})
}

func main() {
	fmt.Println("Server started at port 8080")
	SetupServerRoutes()
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
