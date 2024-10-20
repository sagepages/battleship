import React, { useState, useRef, useEffect } from 'react'
import { useWebSocket } from '../socketContext'
import { useRouter } from 'next/navigation'
import { useGameState } from '../gameContext'
const gridSize = 10
const cellSize = 40 // Set size of each cell

const initializeGrid = () =>
  Array.from({ length: gridSize }, () => Array(gridSize).fill(0))

const MapGrid = () => {
  const shipEmoji = {
    1: '🚢',
    2: '🚤',
    3: '🛥️',
    4: '⛴️',
    5: '🛳️',
  }

  const socket = useWebSocket()
  const router = useRouter()

  const { setUserGame, setOpponentGame, setIsMyTurn } = useGameState()

  const [isWaiting, setIsWaiting] = useState(false)
  const [grid, setGrid] = useState(initializeGrid())
  const [selectedBox, setSelectedBox] = useState(null)
  const [selectedCells, setSelectedCells] = useState([])
  const [boxes, setBoxes] = useState([
    { id: 1, count: 5, originalCount: 5, placed: false },
    { id: 2, count: 4, originalCount: 4, placed: false },
    { id: 3, count: 3, originalCount: 3, placed: false },
    { id: 4, count: 3, originalCount: 3, placed: false },
    { id: 5, count: 2, originalCount: 2, placed: false },
  ])
  const [alertMessage, setAlertMessage] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    drawGrid(ctx)
  }, [grid])

  const drawGrid = (ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const color = getCellColor(grid[row][col])
        ctx.fillStyle = color
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize)
      }
    }
  }

  const getCellColor = (value) => {
    switch (value) {
      case 1:
        return 'blue'
      case 2:
        return 'green'
      case 3:
        return 'yellow'
      case 4:
        return 'purple'
      case 5:
        return 'red'
      default:
        return 'lightgray'
    }
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const row = Math.floor(y / cellSize)
    const col = Math.floor(x / cellSize)

    handleCellClick(row, col)
  }

  const handleCellClick = (row, col) => {
    if (selectedBox === null) return

    const box = boxes.find((b) => b.id === selectedBox)
    if (!box || box.placed || grid[row][col] !== 0) return

    if (selectedCells.length === 0) {
      setSelectedCells([[row, col]])
    } else {
      const lastCell = selectedCells[selectedCells.length - 1]
      const isAdjacent =
        (lastCell[0] === row && Math.abs(lastCell[1] - col) === 1) ||
        (lastCell[1] === col && Math.abs(lastCell[0] - row) === 1)
      const isInLine =
        selectedCells.every((cell) => cell[0] === row) ||
        selectedCells.every((cell) => cell[1] === col)

      if (isAdjacent && isInLine) {
        setSelectedCells([...selectedCells, [row, col]])
        setAlertMessage(null)
      } else {
        setAlertMessage('Cells must be adjacent and in a straight line!')
        setTimeout(() => setAlertMessage(null), 3000)
        return
      }
    }

    const newGrid = [...grid]
    newGrid[row][col] = selectedBox
    setGrid(newGrid)

    if (box.count - 1 === 0) {
      setBoxes((prevBoxes) =>
        prevBoxes.map((b) =>
          b.id === selectedBox ? { ...b, count: 0, placed: true } : b
        )
      )
      setSelectedCells([])
    } else {
      setBoxes((prevBoxes) =>
        prevBoxes.map((b) =>
          b.id === selectedBox ? { ...b, count: b.count - 1 } : b
        )
      )
    }
  }

  const handleBoxClick = (boxId) => {
    if (selectedBox !== null && selectedBox !== boxId) {
      clearSelectedCells()
    }
    setSelectedBox(boxId)
    setAlertMessage(null)
  }

  const clearSelectedCells = () => {
    const newGrid = [...grid]
    selectedCells.forEach(([row, col]) => {
      newGrid[row][col] = 0
    })
    setGrid(newGrid)
    setSelectedCells([])
    setBoxes((prevBoxes) =>
      prevBoxes.map((b) =>
        b.id === selectedBox && !b.placed ? { ...b, count: b.originalCount } : b
      )
    )
  }

  const resetCells = () => {
    setGrid(initializeGrid())
    setBoxes((prevBoxes) =>
      prevBoxes.map((b) => ({ ...b, count: b.originalCount, placed: false }))
    )
  }

  const playGame = () => {
    if (socket !== null) {
      socket.send(JSON.stringify({ Type: 'ready', InitialGrid: grid }))
    }

    setIsWaiting(true)

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type == 'startGame') {
        console.log(data)
        // setWaiting(false)
        setUserGame(data.userGrid)
        setOpponentGame(data.opponentGrid)
        setIsMyTurn(data.isMyTurn)

        router.push('/play')
      }
    }
  }

  return (
    <div className='flex flex-col min-h-screen justify-center items-center space-y-4'>
      <canvas
        ref={canvasRef}
        width={gridSize * cellSize}
        height={gridSize * cellSize}
        onClick={handleCanvasClick}
        className='border border-black'
      ></canvas>
      <div className='flex flex-wrap space-x-4 space-y-4'>
        {boxes
          .filter((box) => box.count > 0)
          .map((box) => (
            <button
              key={box.id}
              onClick={() => handleBoxClick(box.id)}
              className={`p-2 border border-black rounded cursor-pointer ${
                selectedBox === box.id ? 'bg-gray-300' : 'bg-white'
              }`}
            >
              <span className='mr-2 text-2xl'>{shipEmoji[box.id]}</span>
              <span>{box.count} left</span>
            </button>
          ))}
        {isWaiting ? (
          <div className='flex justify-center items-center mt-4 p-4 bg-blue-200 border border-blue-400 rounded-md'>
            <span className='text-blue-800 font-semibold'>
              Waiting for opponent to be ready...
            </span>
          </div>
        ) : (
          <div className='flex space-x-4 mt-4'>
            <button
              onClick={resetCells}
              className='p-2 border rounded border-black bg-blue-500 text-white hover:bg-blue-600 transition-colors'
            >
              Clear
            </button>
            {boxes.every((box) => box.count === 0) && (
              <button
                onClick={playGame}
                className='p-2 border rounded bg-green-500 border-black text-white hover:bg-green-600 transition-colors'
              >
                Play!
              </button>
            )}
          </div>
        )}
      </div>
      {alertMessage && (
        <div className='bg-red-500 text-white p-2 rounded'>{alertMessage}</div>
      )}
    </div>
  )
}

export default MapGrid
