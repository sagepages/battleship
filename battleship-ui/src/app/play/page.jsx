'use client'
import React, { useEffect, useState } from 'react'
import { UserGrid } from '../components/UserGrid'
import { OpponentGrid } from '../components/OpponentGrid'
import { useWebSocket } from '../socketContext'
import { useGameState } from '../gameContext'
import { useRouter } from 'next/navigation'
import WaitingTurn from '../components/WaitingTurn'
import PlayingTurn from '../components/PlayingTurn'
import MoveResultAnimation from '../MoveResultAnimation'
import GameOver from '../components/GameOver'

const Play = () => {
  const {
    userGame,
    setUserGame,
    opponentGame,
    setOpponentGame,
    isMyTurn,
    setIsMyTurn,
  } = useGameState()
  const socket = useWebSocket()
  const [moveResult, setMoveResult] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [isWinner, setIsWinner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!userGame) {
      console.log('No game state found. Redirecting...')
      // Implement your routing logic here, e.g.:
      router.push('/')
    }
  }, [userGame])

  useEffect(() => {
    if (socket !== null) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'turn':
            setUserGame(data.userGrid)
            setOpponentGame(data.opponentGrid)
            setIsMyTurn(data.isMyTurn)
            setMoveResult({
              result: data.moveResult,
              cell: data.lastMove,
              isOpponent: !data.isMyTurn,
            })
            break
          case 'gameOver':
            setGameOver(true)
            setIsWinner(data.winner)
            break
          // Handle other message types as needed
        }
      }
    }
  }, [socket, setIsMyTurn, setUserGame, setOpponentGame])

  if (!userGame) {
    return <div>Loading game data...</div>
  }

  const handleCellClick = (cell) => {
    if (isMyTurn && !gameOver) {
      socket.send(JSON.stringify({ type: 'move', move: cell }))
      setIsMyTurn(false)
    }
  }

  return (
    <div className='flex flex-col items-center bg-gray-100 min-h-screen p-4'>
      <h1 className='text-4xl font-bold mb-8 text-blue-600'>Battleship</h1>
      {!gameOver && (
        <div className='mb-8'>
          {isMyTurn ? <PlayingTurn /> : <WaitingTurn />}
        </div>
      )}
      <div className='flex flex-col md:flex-row justify-around w-full max-w-6xl gap-8'>
        <div className='flex flex-col items-center relative'>
          <h2 className='text-2xl font-semibold mb-4 text-gray-700'>
            Your Fleet
          </h2>
          <UserGrid userGrid={userGame} />
          {moveResult && !moveResult.isOpponent && (
            <MoveResultAnimation {...moveResult} />
          )}
        </div>
        <div className='flex flex-col items-center relative'>
          <h2 className='text-2xl font-semibold mb-4 text-gray-700'>
            Enemy Waters
          </h2>
          <OpponentGrid
            opponentGrid={opponentGame}
            onCellClick={handleCellClick}
            isMyTurn={isMyTurn}
          />
          {moveResult && moveResult.isOpponent && (
            <MoveResultAnimation {...moveResult} />
          )}
        </div>
      </div>
      {gameOver && <GameOver isWinner={isWinner} />}
      <button
        onClick={() => {
          setIsMyTurn(true)
        }}
      ></button>
    </div>
  )
}

export default Play
