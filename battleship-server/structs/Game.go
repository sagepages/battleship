package structs

import (
	"fmt"
	"log"
)

type Game struct {

	// STATUS
	// WAITING = Both players are setting up their battleships
	// PLAYING = Game is in progress
	// FINISHED = Game is done

	ID           string           `json:"id"`
	States       map[string]State `json:"states"`
	Status       string           `json:"status"`
	PlayersReady map[string]bool  `json:"PlayersReady"`
	Players      [2]*Player       `json:"Players"`
}

type State struct {
	Grid [][]int
}

func (g *Game) GetTwoPlayersID() ([]string, error) {

	results := []string{}

	if len(g.PlayersReady) < 2 {
		return nil, fmt.Errorf("Error not enough players in Game Map when getting player IDs")
	}
	for key, _ := range g.PlayersReady {
		results = append(results, key)

		if len(results) == 2 {
			break
		}
	}

	return results, nil
}

func (g *Game) GetStatus() string {
	return g.Status
}

func (g *Game) SetStatus(status string) {
	g.Status = status
}

func (g *Game) SetPlayerToReady(p *Player) {
	g.PlayersReady[p.ID] = true
}

func (g *Game) SetPlayerToNotReady(p *Player) {
	g.PlayersReady[p.ID] = false
}

func (g *Game) CheckForReady() bool {
	return len(g.PlayersReady) >= 2
}

func (g *Game) GetGrid(ID string) [][]int {
	return g.States[ID].Grid
}

func (s *State) SetGrid(grid [][]int) {
	s.Grid = grid
}

func (s *State) ShootAtGrid(move []int) string {
	if len(move) < 2 {
		log.Println("MOVE didn't have coordinates idiot.")
	}

	beforeShot := getFrequency(s.Grid)

	coordinate := s.Grid[move[0]][move[1]]
	if coordinate >= 1 && coordinate <= 5 {
		// HIT!
		s.Grid[move[0]][move[1]] = 9
		afterShot := getFrequency(s.Grid)
		// Check if sink
		if didSomethingSink(beforeShot, afterShot) {
			return "SINK"
		} else {
			return "HIT"
		}
	} else {
		// MISS!
		s.Grid[move[0]][move[1]] = 8
		return "MISS"
	}
}

func getFrequency(grid [][]int) map[int]int {

	freq := make(map[int]int)
	for i := 0; i < len(grid); i++ {
		for j := 0; j < len(grid[i]); j++ {
			freq[grid[i][j]] += 1
		}
	}

	return freq
}

func didSomethingSink(before, after map[int]int) bool {
	for key := 1; key <= 5; key++ {
		if _, existsInBefore := before[key]; existsInBefore {
			if _, existsInAfter := after[key]; !existsInAfter {
				// Key exists in "before" but not in "after"
				return true
			}
		}
	}
	// All relevant keys (1-5) are either not in "before" or are in both
	return false
}

func (s *State) CheckIfGameOver() bool {
	for i := 0; i < len(s.Grid); i++ {
		for j := 0; j < len(s.Grid[i]); j++ {
			if s.Grid[i][j] <= 5 && s.Grid[i][j] >= 1 {
				return false
			}
		}
	}
	return true
}

func (g *Game) Fogify(grid [][]int) [][]string {
	result := make([][]string, len(grid))

	for i := range grid {
		result[i] = make([]string, len(grid[i]))
		for j := range grid[i] {
			// 0 - 5 = 'o'
			// 8 = miss = 'm'
			// 9 = hit = 'x'
			if grid[i][j] >= 0 && grid[i][j] <= 5 {
				result[i][j] = "o" // Use string instead of rune
			} else if grid[i][j] == 8 {
				result[i][j] = "m" // Use string instead of rune
			} else if grid[i][j] == 9 {
				result[i][j] = "x" // Use string instead of rune
			} else {
				result[i][j] = "." // You can define a default character if needed
			}
		}
	}
	return result
}

func findOpposingPlayerID(currentPlayerID string, players []string) string {
	if len(players) < 1 {
		return ""
	} else {
		for idx := range players {
			if players[idx] != currentPlayerID {
				return players[idx]
			}
		}
		return ""
	}
}
