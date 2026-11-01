export type TeamStatus = "pending" | "approved" | "rejected";
export type Stage = "kualifikasi" | "semifinal" | "final";
export type GroupCode = "A" | "B" | "C" | "S1" | "S2" | "S3" | "F";

export interface PublicStats {
  quota: number;
  registration_open: boolean;
  registered: number;
  approved: number;
}

export interface BracketRow {
  stage: Stage;
  group_code: GroupCode;
  position: number;
  community_name: string;
  rank: number | null;
}

export interface Team {
  id: string;
  community_name: string;
  pic_name: string;
  pic_phone: string;
  join_cheering: boolean;
  cheering_count: number | null;
  status: TeamStatus;
  admin_note: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  team_id: string;
  full_name: string;
  gender: "L" | "P";
  role: "utama" | "cadangan";
  slot: number;
  photo_path: string;
  photo_url?: string | null;
}

export interface TeamWithParticipants extends Team {
  participants: Participant[];
}

export interface DrawEntry {
  id: string;
  stage: Stage;
  group_code: GroupCode;
  position: number;
  team_id: string;
  rank: number | null;
  team?: { community_name: string } | null;
}
