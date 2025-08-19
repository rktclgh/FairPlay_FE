import api from "../api/axios";

export interface PopularTop5Item {
  eventId: number;
  eventName: string;
  value: number;
  category?: string;
}

export type GenderCode = "MALE" | "FEMALE";

export const adminStatisticsService = {
  // 성별별 TOP5: /api/admin/statistics/popular/gender/{gender}
  async getTop5ByGender(gender: GenderCode): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/admin/statistics/popular/gender/${gender}`
    );
    return res.data || [];
  },

  // 세대별 TOP5: /api/admin/statistics/popular/age/{ageGroup} (예: 10, 20, 30 ...)
  async getTop5ByAge(ageGroup: number): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/admin/statistics/popular/age/${ageGroup}`
    );
    return res.data || [];
  },
};
