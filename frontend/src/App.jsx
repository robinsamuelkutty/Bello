
import Navbar from './components/Navbar'
import LoginPage from './pages/login/LoginPage';
import { useThemeStore } from "./store/useThemeStore";
const App = () => {
  const { theme } = useThemeStore();
  return (
    <div data-theme={theme}>
    <Navbar/>
    <LoginPage/>
    </div>
  )
}

export default App