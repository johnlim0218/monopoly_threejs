import * as React from 'react';

function SideBar({ lastDices, rollDice }: any) {
  console.log(lastDices)
  const onClickRollDice = () => {
    console.log('onClickRollDice');
    rollDice(lastDices);
  }
  
  return (
    <div className="flex flex-col flex-wrap min-h-screen justify-around absolute right-0 m-8" style={{ position: 'fixed', zIndex: 100 }}>
    {/* <div className="flex flex-col items-end">
      <div
        className="flex flex-row normal-case select-none py-2"
        v-for="p in sortedPlayers"
        :key="p.username"
      >
        <span className="text-white text-lg">{{ p.username }}:</span>
        <span className="ml-1 text-white text-xl">${{ p.balance }}</span>
      </div>
    </div>
    <div className="text-lg text-white normal-case">
      <div v-if="lastRoll">
        Last Roll:
        {{ lastRoll ? Object.entries(lastRoll)[0][1].join(', ') : '' }}
      </div>
    </div> */}
    <div className="flex flex-col">
      {/* <button className="p-2 select-none text-xl text-white" @click="joinRoom">Join Room</button> */}
      {/* <button className="p-2 select-none text-xl text-white" @click="createRoom">Create Room</button> */}
      <button className="p-2 select-none text-xl text-white" onClick={onClickRollDice}>Roll Dice</button>
      {/* // <button className="p-2 select-none text-xl text-white" @click="toggle3D">Toggle 3D</button> */}
      {/* // <button className="p-2 select-none text-xl text-white" @click="rotate">Rotate</button> */}
    </div>
  </div>
  )
}

export default SideBar;