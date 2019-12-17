import React from 'react';

function Alert(props) {
  return (
    <div className="alert alert-danger" role="alert">
      {props.alertText}
    </div>
  );
}

export default Alert;