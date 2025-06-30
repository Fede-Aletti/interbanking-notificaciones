export type RootStackParamList = {
  MainTabs: undefined;
  NotificationDetail: { id: string };
};

export type TabParamList = {
  Simulator: undefined;
  Notifications: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 