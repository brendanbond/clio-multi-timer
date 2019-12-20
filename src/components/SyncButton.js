import React from 'react';
import Loading from './Loading';

function SyncButton(props) {
  if (!props.disabled && !props.isSyncing) {
    return (
      <button className="btn btn-primary" onClick={props.onClick}>
        Sync
      </button>
    );
  } else if (props.isSyncing) {
    return (
      <button className="btn btn-primary">
        <Loading />
      </button>
    );
  } else if (props.disabled && !props.isSyncing) {
    return <button className="btn btn-primary disabled">Synced!</button>;
  }
}

export default SyncButton;
