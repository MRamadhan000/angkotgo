import {
  ScheduleTemplate,
  CreateScheduleTemplateInput,
  UpdateScheduleTemplateInput,
} from "@/types/schedule-template.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const scheduleTemplateService = {
  async findAll(): Promise<ScheduleTemplate[]> {
    const response = await fetch(`${API_URL}/schedule-templates`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data schedule template.");
    }

    const result: {
      message: string;
      data: ScheduleTemplate[];
    } = await response.json();

    return result.data;
  },

  async findOne(id: number): Promise<ScheduleTemplate> {
    const response = await fetch(`${API_URL}/schedule-templates/${id}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil schedule template.");
    }

    const result: {
      message: string;
      data: ScheduleTemplate;
    } = await response.json();

    return result.data;
  },

  async create(
    payload: CreateScheduleTemplateInput,
  ): Promise<ScheduleTemplate> {
    const response = await fetch(`${API_URL}/schedule-templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        Array.isArray(error?.message)
          ? error.message.join(", ")
          : error?.message || "Gagal membuat schedule template.",
      );
    }

    const result: {
      message: string;
      data: ScheduleTemplate;
    } = await response.json();

    return result.data;
  },

  async update(
    id: number,
    payload: UpdateScheduleTemplateInput,
  ): Promise<ScheduleTemplate> {
    const response = await fetch(`${API_URL}/schedule-templates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        Array.isArray(error?.message)
          ? error.message.join(", ")
          : error?.message || "Gagal memperbarui schedule template.",
      );
    }

    const result: {
      message: string;
      data: ScheduleTemplate;
    } = await response.json();

    return result.data;
  },

  async remove(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/schedule-templates/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        Array.isArray(error?.message)
          ? error.message.join(", ")
          : error?.message || "Gagal menghapus schedule template.",
      );
    }
  },

  async start(): Promise<ScheduleTemplate> {
    const response = await fetch(`${API_URL}/schedule-templates/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      throw new Error(
        Array.isArray(error?.message)
          ? error.message.join(", ")
          : error?.message || "Gagal memulai schedule template.",
      );
    }

    const result: {
      message: string;
      data: ScheduleTemplate;
    } = await response.json();

    return result.data;
  },
};
