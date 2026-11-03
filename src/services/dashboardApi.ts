
import {
  dashboardData,
  shelters,
  supplies,
} from "../data/mockDashboard";

// 仮のAPI通信
export async function fetchDashboardData() {
  // 通信にかかる時間を再現（1秒）
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 1000);
  });

  return {
    dashboardData,
    shelters,
    supplies,
  };
}

// APIが返すデータの型
export type DashboardResponse = Awaited<
  ReturnType<typeof fetchDashboardData>
>;
