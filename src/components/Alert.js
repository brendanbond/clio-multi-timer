import React from 'react';

function Alert(props) {
  if (props.error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>clio-multi-timer encountered the following error(s):</strong>
        <ul>
          {props.error.map(function(error, index) {
            return <li key={index}>{error}</li>;
          })}
        </ul>
      </div>
    );
  } else return null;
}

export default Alert;
