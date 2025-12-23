import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

// A simple component for testing purposes
function HelloWorld() {
  return <h1>Hello World</h1>;
}

describe('App', () => {
  it('renders hello world', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('true is true', () => {
    expect(true).toBe(true);
  });
});
