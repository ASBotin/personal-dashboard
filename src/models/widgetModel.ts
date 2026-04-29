export type WidgetType  = 'pomodoro' | 'weather' | 'note' | 'gitActivityTracker' | 'repositoryTracker' | 'gitIssuesPR' | 'bookmarks';

export interface WidgetModel {
    id: string;
    type: WidgetType;
    position: {x: number, y: number, w: number, h: number};
    data: any;
}

export const createWidget = (type: WidgetType, overrides: Partial<WidgetModel> = {}) => ({
    id: crypto.randomUUID(),
    type,
    position: {x: 0, y: 0, w: 0, h: 0},
    data: {},
    ...overrides
});