import './App.css';
import { Route, Link, Routes } from 'react-router-dom';
import OtherPage from './OtherPage';
import Fib from './Fib';

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Fibonacci Calculator</h1>
        <Link to='/'>Home</Link>
        <Link to='/otherpage'>Other Page</Link>
        <div>
          <Routes>
            <Route exact path='//*' element={<Fib />} />
            <Route path='/otherpage' element={<OtherPage />} />
          </Routes>
        </div>
      </header>
    </div>
  );
}

export default App;
