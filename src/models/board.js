export const createBoard = (name = "New Board", widgets = []) => ({ 
    id: crypto.randomUUID(),
    name,
    widgets
});