import {Timer} from '@/components/timer/Timer';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4">
      <h1 className="text-4xl font-bold mb-8">Vibe Timer</h1>
      <Timer />
    </div>
  );
}

export default App;
