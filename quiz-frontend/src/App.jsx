import { BrowserRouter, Routes, Route } from "react-router-dom";
import CareerQuiz from "./components/CareerQuiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CareerQuiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
