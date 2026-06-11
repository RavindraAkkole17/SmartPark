import './Common.css';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <span className="loader-icon">🅿️</span>
      </div>
      <p className="loader-text">{message}</p>
    </div>
  );
};

export default Loader;
