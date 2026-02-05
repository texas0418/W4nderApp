describe('W4nder App', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have correct app name', () => {
    const pkg = require('../package.json');
    expect(pkg.name).toBe('w4nder-app');
  });
});