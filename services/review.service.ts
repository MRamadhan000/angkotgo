import {
  CreateReviewPayload,
  Review,
  ReviewResponse,
  ReviewsResponse,
} from "@/types/review.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ==========================================
// CREATE REVIEW
// ==========================================

export const createReview = async (
  payload: CreateReviewPayload,
): Promise<ReviewResponse> => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message || "Gagal menambahkan review.");
  }

  return response.json();
};

// ==========================================
// GET ALL REVIEWS (With Optional Filters)
// ==========================================

export const getAllReviews = async (
  maxRating?: number,
): Promise<ReviewsResponse> => {
  // mainv4 backend exposes GET /feedbacks/assignment/:assignmentId
  // We fetch assignments first, then collect all feedbacks from each assignment
  try {
    const assignRes = await fetch(`${API_URL}/vehicle-assignments`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (assignRes.ok) {
      const assignJson = await assignRes.json();
      const assignments: any[] = Array.isArray(assignJson)
        ? assignJson
        : assignJson.data || [];

      const allFeedbacks: Review[] = [];
      const promises = assignments.map(async (a) => {
        try {
          const fbRes = await fetch(`${API_URL}/feedbacks/assignment/${a.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });
          if (fbRes.ok) {
            const fbJson = await fbRes.json();
            const list: any[] = Array.isArray(fbJson)
              ? fbJson
              : fbJson.data || [];
            list.forEach((item) => {
              allFeedbacks.push({
                id: item.id,
                userId: 0,
                vehicleAssignmentId: a.id,
                rating: Number(item.rating) || 5,
                description:
                  item.experience ||
                  (Array.isArray(item.tags) ? item.tags.join(", ") : "") ||
                  "Layanan memuaskan",
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
                deletedAt: null,
                vehicleAssignment: a,
              });
            });
          }
        } catch {
          // ignore single assignment error
        }
      });

      await Promise.all(promises);

      const filtered =
        maxRating !== undefined
          ? allFeedbacks.filter((r) => r.rating <= maxRating)
          : allFeedbacks;

      return {
        message: "Successfully fetched all feedbacks",
        data: filtered,
      };
    }
  } catch {
    // fallback below
  }

  return { message: "No reviews", data: [] };
};

export const getReviewsByVehicleAssignmentId = async (
  vehicleAssignmentId: number,
): Promise<ReviewsResponse> => {
  const response = await fetch(
    `${API_URL}/reviews/assignment/${vehicleAssignmentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message || "Gagal mengambil review perjalanan.");
  }

  return response.json();
};
