import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';
import React from 'react';

// Componente de teste para consumir o hook
const ThemeConsumer = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-mode">{theme.mode}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Limpa o localStorage antes de cada teste
    window.localStorage.clear();
    document.documentElement.classList.remove('light');
  });

  it('deve iniciar com o tema dark por padrão', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('deve alternar entre dark e light', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const button = screen.getByText('Toggle');
    
    // Alterna para light
    fireEvent.click(button);
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // Alterna de volta para dark
    fireEvent.click(button);
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('deve persistir o tema no localStorage', () => {
    const { unmount } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const button = screen.getByText('Toggle');
    fireEvent.click(button); // Muda para light
    
    expect(window.localStorage.getItem('idealg-theme')).toContain('light');
    
    unmount();

    // Renderiza novamente para ver se carregou do localStorage
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
