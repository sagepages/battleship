package structs

import (
	"log"
	"testing"
)

func TestConvertIntToChar(t *testing.T) {
	// Test case: Sample input and expected output
	g := Game{}
	intMatrix := [][]int{
		{0, 0, 0, 8, 0, 0, 0, 0, 0, 0},
		{0, 0, 0, 8, 0, 0, 0, 0, 0, 0},
		{0, 0, 0, 8, 0, 0, 0, 0, 0, 2},
		{0, 0, 0, 8, 0, 0, 0, 0, 0, 2},
		{0, 0, 0, 8, 0, 0, 0, 0, 0, 2},
		{0, 0, 0, 8, 0, 0, 0, 0, 0, 0},
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
		{1, 1, 1, 1, 0, 0, 0, 9, 9, 9},
	}

	log.Printf("%s", g.Fogify(intMatrix))
}

func TestCheckIfGameOver(t *testing.T) {
	// Test case where the game is over (no ships left)
	state1 := &State{
		Grid: [][]int{
			{0, 0, 0},
			{0, 0, 0},
			{0, 0, 0},
		},
	}
	if !state1.CheckIfGameOver() {
		t.Errorf("Expected game to be over, but got false")
	}

	// Test case where the game is not over (some ships still exist)
	state2 := &State{
		Grid: [][]int{
			{1, 0, 0},
			{0, 2, 0},
			{0, 0, 0},
		},
	}
	if state2.CheckIfGameOver() {
		t.Errorf("Expected game to not be over, but got true")
	}

	// Test case with some ship parts still left
	state3 := &State{
		Grid: [][]int{
			{0, 9, 0},
			{0, 0, 9},
			{0, 0, 8},
		},
	}
	if !state3.CheckIfGameOver() {
		t.Errorf("Expected game to not be over, but got true")
	}
}

func TestKeysMissingInAfter(t *testing.T) {
	// Test case where a key in the range 1-5 is missing in the "after" map
	before1 := map[int]int{
		1: 100,
		2: 200,
		3: 300,
	}
	after1 := map[int]int{
		2: 200,
		3: 300,
	}
	if !didSomethingSink(before1, after1) {
		t.Errorf("Expected true, but got false. Key 1 is missing in 'after' map.")
	}

	// Test case where all keys 1-5 exist in both maps
	before2 := map[int]int{
		1: 100,
		2: 200,
		3: 300,
	}
	after2 := map[int]int{
		1: 100,
		2: 200,
		3: 300,
	}
	if didSomethingSink(before2, after2) {
		t.Errorf("Expected false, but got true. All keys 1-5 are present in both maps.")
	}

	// Test case where a key exists in "after" but is missing in "before" (should return false)
	before3 := map[int]int{
		2: 200,
		3: 300,
	}
	after3 := map[int]int{
		1: 100,
		2: 200,
		3: 300,
	}
	if didSomethingSink(before3, after3) {
		t.Errorf("Expected false, but got true. No keys from 1-5 are missing in 'after' map that were in 'before'.")
	}

	// Test case where multiple keys from 1-5 are missing in "after"
	before4 := map[int]int{
		1: 100,
		2: 200,
		4: 400,
	}
	after4 := map[int]int{
		2: 200,
	}
	if !didSomethingSink(before4, after4) {
		t.Errorf("Expected true, but got false. Keys 1 and 4 are missing in 'after' map.")
	}

	state1 := &State{
		Grid: [][]int{
			{1, 9, 8},
			{1, 0, 0},
			{0, 2, 5},
		},
	}

	before5 := getFrequency(state1.Grid)
	state1.Grid[2][2] = 9
	after5 := getFrequency(state1.Grid)
	if !didSomethingSink(before5, after5) {
		t.Errorf("Expected true, but got false. 5 should be empty, so should be sink")
	}
}
