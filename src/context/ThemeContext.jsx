import { createContext, useState } from "react";
export const ThemeContext = createContext();

const AppThemeContext = ({ children }) => {
  const [theme, setTheme] = useState(false);
  const dayTime = new Date();
  const SplitdayTime = dayTime.toString().split(" ");
  const currentTime = SplitdayTime[4];
  const currentHourArr = currentTime.split(":");
  const currentHour = currentHourArr[0];

  if (currentHour >=19) {
    setTheme(true)
  } 
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default AppThemeContext;
