import Button from './components/ui/Button';

export default function App() {
  const handleClick = () => {
    alert('Button works! 🎉');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your Project! 🚀
          </h1>
          <p className="text-gray-600 mb-8">
            Vite + React + TypeScript + Tailwind CSS
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" onClick={handleClick}>
                  Primary
                </Button>
                <Button variant="secondary" onClick={handleClick}>
                  Secondary
                </Button>
                <Button variant="danger" onClick={handleClick}>
                  Danger
                </Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
