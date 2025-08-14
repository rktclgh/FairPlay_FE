import React from "react";

interface ThemeContextValue {
    isDark: boolean;
    toggleDark: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = React.useState<boolean>(() => {
        try {
            const saved = localStorage.getItem("fp_dark_mode");
            return saved ? saved === "1" : false;
        } catch {
            return false;
        }
    });

    const applyBodyClass = React.useCallback((next: boolean) => {
        if (next) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

    React.useEffect(() => {
        applyBodyClass(isDark);
        try {
            localStorage.setItem("fp_dark_mode", isDark ? "1" : "0");
        } catch {
            // noop
        }
    }, [applyBodyClass, isDark]);

    const toggleDark = React.useCallback(() => setIsDark(prev => !prev), []);

    return (
        <ThemeContext.Provider value={{ isDark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const ctx = React.useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
};


