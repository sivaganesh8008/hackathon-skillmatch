export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          issuing_organization: string
          name: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuing_organization: string
          name: string
          profile_id: string
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuing_organization?: string
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          email: string
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_admins: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_admins_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          created_at: string
          endorsements: number | null
          id: string
          is_primary: boolean | null
          last_used_date: string | null
          proficiency_level: Database["public"]["Enums"]["proficiency_level"]
          profile_id: string
          skill_id: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          endorsements?: number | null
          id?: string
          is_primary?: boolean | null
          last_used_date?: string | null
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          profile_id: string
          skill_id: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          endorsements?: number | null
          id?: string
          is_primary?: boolean | null
          last_used_date?: string | null
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          profile_id?: string
          skill_id?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_status:
            | Database["public"]["Enums"]["availability_status"]
            | null
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string
          department: string | null
          designation: string | null
          email: string
          full_name: string
          github_url: string | null
          id: string
          location: string | null
          phone: string | null
          readiness_score: number | null
          resume_url: string | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          availability_status?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email: string
          full_name: string
          github_url?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          readiness_score?: number | null
          resume_url?: string | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          availability_status?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string
          full_name?: string
          github_url?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          readiness_score?: number | null
          resume_url?: string | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_allocations: {
        Row: {
          allocation_percentage: number | null
          created_at: string
          end_date: string | null
          id: string
          match_score: number | null
          profile_id: string
          project_id: string
          role_in_project: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          match_score?: number | null
          profile_id: string
          project_id: string
          role_in_project: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          match_score?: number | null
          profile_id?: string
          project_id?: string
          role_in_project?: string
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_allocations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_required_skills: {
        Row: {
          created_at: string
          id: string
          is_mandatory: boolean | null
          min_experience_years: number | null
          project_id: string
          required_proficiency: Database["public"]["Enums"]["proficiency_level"]
          skill_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          min_experience_years?: number | null
          project_id: string
          required_proficiency?: Database["public"]["Enums"]["proficiency_level"]
          skill_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          min_experience_years?: number | null
          project_id?: string
          required_proficiency?: Database["public"]["Enums"]["proficiency_level"]
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_required_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_required_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_name: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: Database["public"]["Enums"]["project_priority"] | null
          project_manager_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["project_priority"] | null
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["project_priority"] | null
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_feedback: {
        Row: {
          created_at: string
          employee_skill_id: string
          feedback_text: string | null
          given_by: string | null
          id: string
          project_id: string | null
          rating: number | null
        }
        Insert: {
          created_at?: string
          employee_skill_id: string
          feedback_text?: string | null
          given_by?: string | null
          id?: string
          project_id?: string | null
          rating?: number | null
        }
        Update: {
          created_at?: string
          employee_skill_id?: string
          feedback_text?: string | null
          given_by?: string | null
          id?: string
          project_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_feedback_employee_skill_id_fkey"
            columns: ["employee_skill_id"]
            isOneToOne: false
            referencedRelation: "employee_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_feedback_given_by_fkey"
            columns: ["given_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_gap_analysis: {
        Row: {
          created_at: string
          current_level: Database["public"]["Enums"]["proficiency_level"] | null
          gap_score: number | null
          id: string
          learning_resource_url: string | null
          profile_id: string
          recommended_action: string | null
          required_level: Database["public"]["Enums"]["proficiency_level"]
          skill_id: string
        }
        Insert: {
          created_at?: string
          current_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          gap_score?: number | null
          id?: string
          learning_resource_url?: string | null
          profile_id: string
          recommended_action?: string | null
          required_level: Database["public"]["Enums"]["proficiency_level"]
          skill_id: string
        }
        Update: {
          created_at?: string
          current_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          gap_score?: number | null
          id?: string
          learning_resource_url?: string | null
          profile_id?: string
          recommended_action?: string | null
          required_level?: Database["public"]["Enums"]["proficiency_level"]
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_gap_analysis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_gap_analysis_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_company_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      availability_status:
        | "available"
        | "partially_available"
        | "on_project"
        | "on_leave"
      proficiency_level: "beginner" | "intermediate" | "expert"
      project_priority: "low" | "medium" | "high" | "critical"
      project_status: "draft" | "active" | "on_hold" | "completed"
      user_role: "admin" | "project_manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: [
        "available",
        "partially_available",
        "on_project",
        "on_leave",
      ],
      proficiency_level: ["beginner", "intermediate", "expert"],
      project_priority: ["low", "medium", "high", "critical"],
      project_status: ["draft", "active", "on_hold", "completed"],
      user_role: ["admin", "project_manager", "employee"],
    },
  },
} as const
