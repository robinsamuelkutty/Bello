
import Navbar from './components/Navbar'
import { useThemeStore } from "./store/useThemeStore";
const App = () => {
  const { theme } = useThemeStore();
  return (
    <div data-theme={theme}>
    <Navbar/>
    </div>
  )
}

export default App