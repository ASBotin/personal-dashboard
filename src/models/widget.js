export const createWidget = (type, overrides = {}) => ({
    id: crypto.randomUUID(),
    type,
    position: {x : 0, y : 0, w : 2, h : 2},
    data: {},
    ...overrides
});