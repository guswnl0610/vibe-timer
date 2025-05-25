import {useState} from 'react';
import {Button} from '@/components/ui/button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4">
      <h1 className="text-4xl font-bold mb-8">Vibe Timer</h1>
      <div className="space-y-4">
        <Button onClick={() => setCount(count => count + 1)}>Count is {count}</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
    </div>
  );
}

export default App;
