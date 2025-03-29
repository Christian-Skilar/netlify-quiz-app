import Quiz from './components/Quiz';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Internet Security Test</h1>
        <p>Are you safe or a potential victim of the next fraud?</p>
      </header>
      <main>
        <Quiz />
      </main>
    </div>
  );
}

export default App;
