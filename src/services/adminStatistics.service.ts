import api from "../api/axios";

export interface PopularTop5Item {
  eventTitle: string;
  count: number;
}


export const adminStatisticsService = {
  // 성별별 TOP5: /api/admin/statistics/popular/gender/{gender}
  async getTop5ByMale( ): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/event-popularity/male`
    );
    return res.data || [];
  },

  async getTop5ByFemale( ): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/event-popularity/female`
    );
    return res.data || [];
  },

  // 세대별 TOP5: /api/admin/statistics/popular/age/{ageGroup} (예: 10, 20, 30 ...)
  async getTop5ByAge(ageGroup: number): Promise<PopularTop5Item[]> {
    const res = await api.get<PopularTop5Item[]>(
      `/api/event-popularity/age/${ageGroup}`
    );
    return res.data || [];
  },
};
