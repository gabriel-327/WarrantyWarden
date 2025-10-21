import { Routes, Route } from 'react-router-dom';

//pages
import VerificationPage from './pages/Verification'
import Listings from './pages/Listings'
import Logout from './pages/Logout';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<VerificationPage />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  );
}

export default App