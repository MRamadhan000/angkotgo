"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ScheduleTemplate,
  CreateScheduleTemplateInput,
  UpdateScheduleTemplateInput,
} from "@/types/schedule-template.type";

import { scheduleTemplateService } from "@/services/schedule-template.service";

export const scheduleTemplateKeys = {
  all: ["schedule-templates"] as const,
  lists: () => [...scheduleTemplateKeys.all, "list"] as const,
  list: () => [...scheduleTemplateKeys.lists()] as const,
  starts: () => [...scheduleTemplateKeys.all, "start"] as const,
  start: () => [...scheduleTemplateKeys.starts()] as const,
  details: () => [...scheduleTemplateKeys.all, "detail"] as const,
  detail: (id: number) => [...scheduleTemplateKeys.details(), id] as const,
};

export function useScheduleTemplates() {
  return useQuery<ScheduleTemplate[], Error>({
    queryKey: scheduleTemplateKeys.list(),
    queryFn: scheduleTemplateService.findAll,
  });
}

export function useScheduleTemplate(id: number) {
  return useQuery<ScheduleTemplate, Error>({
    queryKey: scheduleTemplateKeys.detail(id),
    queryFn: () => scheduleTemplateService.findOne(id),
    enabled: !!id,
  });
}

export function useStartScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation<ScheduleTemplate, Error, void>({
    mutationFn: () => scheduleTemplateService.start(),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleTemplateKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: scheduleTemplateKeys.starts(),
      });
    },
  });
}

export function useCreateScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation<ScheduleTemplate, Error, CreateScheduleTemplateInput>({
    mutationFn: scheduleTemplateService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleTemplateKeys.lists(),
      });
    },
  });
}

export function useUpdateScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation<
    ScheduleTemplate,
    Error,
    {
      id: number;
      payload: UpdateScheduleTemplateInput;
    }
  >({
    mutationFn: ({ id, payload }) =>
      scheduleTemplateService.update(id, payload),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: scheduleTemplateKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: scheduleTemplateKeys.detail(id),
      });
    },
  });
}

export function useDeleteScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: scheduleTemplateService.remove,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scheduleTemplateKeys.lists(),
      });
    },
  });
}
