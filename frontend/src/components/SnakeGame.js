import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SnakeGame.css';

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [speed, setSpeed] = useState(200);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState([]);

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 37:
        setDirection('LEFT');
        break;
      case 38:
        setDirection('UP');
        break;
      case 39:
        setDirection('RIGHT');
        break;
      case 40:
        setDirection('DOWN');
        break;
      default:
        break;
    }
  };

  const moveSnake = () => {
    if (gameOver) return;
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    switch (direction) {
      case 'LEFT':
        head.x -= 1;
        break;
      case 'UP':
        head.y -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      default:
        break;
    }
    newSnake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      setScore(score + 1);
      setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
      if ((score + 1) % 50 === 0) {
        setSpeed(speed - 10);
      }
    } else {
      newSnake.pop();
    }
    if (checkCollision(head, newSnake)) {
      setGameOver(true);
      saveScore(score);
    } else {
      setSnake(newSnake);
    }
  };

  const checkCollision = (head, snake) => {
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20;
  };

  const saveScore = (score) => {
    const name = prompt('Game over! Enter your name:');
    axios.post('http://localhost:5000/scores', { name, score })
      .then(() => fetchHighScores());
  };

  const fetchHighScores = () => {
    axios.get('http://localhost:5000/scores')
      .then(response => setHighScores(response.data));
  };

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    document.addEventListener('keydown', handleKeyDown);
    fetchHighScores();
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [speed]);

  return (
    <div>
      <h1>Score: {score}</h1>
      {gameOver && <h2>Game Over</h2>}
      <div className="board">
        {Array(20).fill().map((_, y) =>
          Array(20).fill().map((_, x) => (
            <div
              key={`${x}-${y}`}
              className={`cell ${snake.find(s => s.x === x && s.y === y) ? 'snake' : ''} ${food.x === x && food.y === y ? 'food' : ''}`}
            />
          ))
        )}
      </div>
      <h2>High Scores</h2>
      <ul>
        {highScores.map(score => (
          <li key={score.id}>{score.name}: {score.score}</li>
        ))}
      </ul>
    </div>
  );
};

export default SnakeGame;
      