import '../logout.css';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  return (
    <div className="logout-page">
      <h1>You have successfully logged out. <br />The Warden will stand watch until your return.</h1>
      <p>Click below to return to the login page.</p>
      <button onClick={() => navigate('/')}>Back to Login</button>
    </div>
  );
};

export default Logout;
