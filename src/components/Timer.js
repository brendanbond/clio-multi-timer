import React from 'react';

function Timer(props) {
  let seconds = ('0' + (Math.floor(props.time / 1000) % 60)).slice(-2);
  let minutes = ('0' + (Math.floor(props.time / 60000) % 60)).slice(-2);
  let hours = ('0' + Math.floor(props.time / 3600000)).slice(-2);

  return (
    <button
      className={'btn btn-primary mr-2 ' + (props.disabled ? 'disabled' : '')}
      onClick={props.handleClick}
    >
      {hours + ':' + minutes + ':' + seconds}
    </button>
  );
}

export default Timer;
