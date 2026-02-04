import React from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

interface DismissKeyboardProps {
  children: React.ReactNode;
}

export const DismissKeyboard: React.FC<DismissKeyboardProps> = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
    <View style={{ flex: 1 }}>{children}</View>
  </TouchableWithoutFeedback>
);
