import {
  CreateReviewPayload,
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
// GET REVIEW BY VEHICLE ASSIGNMENT ID
// ==========================================

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
