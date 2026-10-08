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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          document_date: string | null
          expiry_date: string | null
          extracted: Json
          file_hash: string
          id: string
          is_proof: boolean
          mime_type: string
          storage_path: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          document_date?: string | null
          expiry_date?: string | null
          extracted?: Json
          file_hash: string
          id?: string
          is_proof?: boolean
          mime_type: string
          storage_path: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          document_date?: string | null
          expiry_date?: string | null
          extracted?: Json
          file_hash?: string
          id?: string
          is_proof?: boolean
          mime_type?: string
          storage_path?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_invitations: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          user_id?: string
        }
        Relationships: []
      }
      hp_ledger: {
        Row: {
          amount: number
          created_at: string
          document_id: string | null
          id: string
          reason: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          document_id?: string | null
          id?: string
          reason: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          document_id?: string | null
          id?: string
          reason?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hp_ledger_user_id_document_id_fkey"
            columns: ["user_id", "document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["user_id", "id"]
          },
          {
            foreignKeyName: "hp_ledger_user_id_task_id_fkey"
            columns: ["user_id", "task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["user_id", "id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          pushed_at: string | null
          read_at: string | null
          task_id: string | null
          template_key: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pushed_at?: string | null
          read_at?: string | null
          task_id?: string | null
          template_key: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pushed_at?: string | null
          read_at?: string | null
          task_id?: string | null
          template_key?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_task_id_fkey"
            columns: ["user_id", "task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["user_id", "id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_config: Json
          created_at: string
          display_name: string
          friend_code: string
          hp: number
          id: string
          language: string
          last_completed_date: string | null
          map_index: number
          presence: number
          streak_days: number
          tone: string
        }
        Insert: {
          avatar_config?: Json
          created_at?: string
          display_name?: string
          friend_code?: string
          hp?: number
          id: string
          language?: string
          last_completed_date?: string | null
          map_index?: number
          presence?: number
          streak_days?: number
          tone?: string
        }
        Update: {
          avatar_config?: Json
          created_at?: string
          display_name?: string
          friend_code?: string
          hp?: number
          id?: string
          language?: string
          last_completed_date?: string | null
          map_index?: number
          presence?: number
          streak_days?: number
          tone?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          document_id: string | null
          due_date: string | null
          id: string
          kind: string
          penalty_applied: boolean
          proof_document_id: string | null
          proof_reason: string | null
          recurrence: string
          remind_at: string | null
          source: string
          start_at: string | null
          status: string
          tier: number
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          document_id?: string | null
          due_date?: string | null
          id?: string
          kind: string
          penalty_applied?: boolean
          proof_document_id?: string | null
          proof_reason?: string | null
          recurrence?: string
          remind_at?: string | null
          source: string
          start_at?: string | null
          status?: string
          tier: number
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          document_id?: string | null
          due_date?: string | null
          id?: string
          kind?: string
          penalty_applied?: boolean
          proof_document_id?: string | null
          proof_reason?: string | null
          recurrence?: string
          remind_at?: string | null
          source?: string
          start_at?: string | null
          status?: string
          tier?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_document_id_fkey"
            columns: ["user_id", "document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["user_id", "id"]
          },
          {
            foreignKeyName: "tasks_user_id_proof_document_id_fkey"
            columns: ["user_id", "proof_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["user_id", "id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_circle: { Args: never; Returns: Json }
      invite_friend: { Args: { p_username: string }; Returns: string }
      respond_friend_invite: {
        Args: { p_accept: boolean; p_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
