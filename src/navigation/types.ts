export type RootStackParamList = {
  Home: undefined;
  AddTask: { taskId?: string } | undefined;
  TaskDetail: { taskId: string };
  Analytics: undefined;
  Settings: undefined;
};
