import React from 'react';

function SyncButton(props) {
  if (!props.disabled && !props.isSyncing) {
    return (
      <button className="btn btn-primary" onClick={props.onClick}>
        Sync
      </button>
    );
  } else if (props.isSyncing) {
    return (
      <button className="btn btn-primary" onClick={props.onClick}>
        <div className="bouncing-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </button>
    );
  } else if (props.disabled && !props.isSyncing) {
    return <button className="btn btn-primary disabled">Synced!</button>;
  }
}

export default SyncButton;
