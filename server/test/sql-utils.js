function normalizeSql(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function expectSql(received, expected) {
  expect(normalizeSql(received)).toBe(normalizeSql(expected));
}

export { expectSql, normalizeSql };