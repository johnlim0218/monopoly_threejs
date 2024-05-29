import React from 'react';
import logo from './logo.svg';
import './App.css';
import Board from './components/Board';
import SideBar from './components/SideBar';

function App() {
  return (
    <>
      <div id="table">
        <Board />
      </div>
    </>
  );
}

export default App;
