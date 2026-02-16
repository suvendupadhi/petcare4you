// Mock Switch and ActivityIndicator
jest.mock('react-native', () => {
  const React = require('react');
  const rn = jest.requireActual('react-native');
  rn.Switch = (props: any) => React.createElement('View', props);
  rn.ActivityIndicator = (props: any) => React.createElement('View', props);
  return rn;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: any) => children,
}));

// Mock for Expo global
global.__ExpoImportMetaRegistry = {};

// Mock nativewind
jest.mock('nativewind', () => {
  return {
    styled: (Component) => Component,
    withStyles: (Component) => Component,
  };
});

// Mock react-native-css-interop
jest.mock('react-native-css-interop', () => {
  return {
    remapProps: () => {},
    verifyInstallation: () => {},
  };
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockIcon = (name) => (props) => React.createElement(View, { ...props, testID: name });
  return {
    ArrowLeft: mockIcon('ArrowLeft'),
    User: mockIcon('User'),
    Phone: mockIcon('Phone'),
    Mail: mockIcon('Mail'),
    Lock: mockIcon('Lock'),
    CheckCircle2: mockIcon('CheckCircle2'),
    ArrowRight: mockIcon('ArrowRight'),
    Calendar: mockIcon('Calendar'),
    Clock: mockIcon('Clock'),
    MapPin: mockIcon('MapPin'),
    Search: mockIcon('Search'),
    Filter: mockIcon('Filter'),
    Bell: mockIcon('Bell'),
    Settings: mockIcon('Settings'),
    LogOut: mockIcon('LogOut'),
    ChevronRight: mockIcon('ChevronRight'),
    Plus: mockIcon('Plus'),
    X: mockIcon('X'),
    Info: mockIcon('Info'),
    AlertCircle: mockIcon('AlertCircle'),
  };
});

// Mock structuredClone
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
