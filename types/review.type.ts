import { User } from "./user.type";
import { VehicleAssignment } from "./vehicles/vehicle-assignments.type";

export interface Review {
  id: number;
  userId: number;
  vehicleAssignmentId: number;
  rating: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  user?: User;
  vehicleAssignment?: VehicleAssignment;
}

// ==========================================
// CREATE REVIEW
// ==========================================

export interface CreateReviewPayload {
  userId: number;
  vehicleAssignmentId: number;
  rating: number;
  description?: string;
}

// ==========================================
// API RESPONSE
// ==========================================

export interface ReviewResponse {
  message: string;
  data: Review;
}

export interface ReviewsResponse {
  message: string;
  data: Review[];
}