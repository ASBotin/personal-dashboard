export const createWidget = (type, overrides = {}) => ({
    id: crypto.randomUUID(),
    type,
    position: {x : 0, y : 0, w : 0, h : 0},
    data: {},
    ...overrides
});