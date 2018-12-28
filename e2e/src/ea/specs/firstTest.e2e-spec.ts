
describe('Going to write first Test', function () {

  it('should pass without any issue', function () {
    const a = 12;
    expect(a).toBe(12);
  });

  it('should not pass as the values are undefined', function () {
    // @ts-ignore
    const u = 1;

    expect(u).toBeDefined('Not defined');
  });
});
