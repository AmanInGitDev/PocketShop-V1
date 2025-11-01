/**
 * Example Test File
 * 
 * This is a sample test file to demonstrate Jest setup.
 * Replace with actual tests for your utility functions.
 */

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const str = 'Hello, PocketShop!';
    expect(str).toContain('PocketShop');
    expect(str.length).toBeGreaterThan(0);
  });

  it('should handle array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
  });
});

