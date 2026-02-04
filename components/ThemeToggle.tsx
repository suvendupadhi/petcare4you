import { useColorScheme } from 'nativewind';
import { TouchableOpacity } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
      {colorScheme === 'dark' ? (
        <Sun color="#f8fafc" size={24} />
      ) : (
        <Moon color="#1e293b" size={24} />
      )}
    </TouchableOpacity>
  );
}
