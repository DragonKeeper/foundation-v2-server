function normalizeSql(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

global.expectSql = function expectSql(received, expected) {
  expect(normalizeSql(received)).toBe(normalizeSql(expected));
};

export { normalizeSql };