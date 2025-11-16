export const createWidget = (type, overrides = {}) => ({
    id: crypto.randomUUID(),
    type,
    position: {x : 0, y : 0},
    data: {},
    ...overrides
});