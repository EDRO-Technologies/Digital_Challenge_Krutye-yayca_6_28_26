export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      buildings: {
        Row: {
          address: string | null;
          code: string;
          id: number;
          name: string;
        };
        Insert: {
          address?: string | null;
          code: string;
          id?: number;
          name: string;
        };
        Update: {
          address?: string | null;
          code?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      event_participants: {
        Row: {
          created_at: string | null;
          schedule_item_id: number | null;
          user_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          schedule_item_id?: number | null;
          user_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          schedule_item_id?: number | null;
          user_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'event_participants_schedule_item_id_fkey';
            columns: ['schedule_item_id'];
            isOneToOne: false;
            referencedRelation: 'schedule_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      groups: {
        Row: {
          course: number;
          id: number;
          institute_id: number | null;
          name: string;
        };
        Insert: {
          course: number;
          id?: number;
          institute_id?: number | null;
          name: string;
        };
        Update: {
          course?: number;
          id?: number;
          institute_id?: number | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'groups_institute_id_fkey';
            columns: ['institute_id'];
            isOneToOne: false;
            referencedRelation: 'institutes';
            referencedColumns: ['id'];
          },
        ];
      };
      institutes: {
        Row: {
          id: number;
          name: string;
          short_name: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          short_name?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          short_name?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          building_id: number | null;
          id: number;
          room_number: string;
        };
        Insert: {
          building_id?: number | null;
          id?: number;
          room_number: string;
        };
        Update: {
          building_id?: number | null;
          id?: number;
          room_number?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rooms_building_id_fkey';
            columns: ['building_id'];
            isOneToOne: false;
            referencedRelation: 'buildings';
            referencedColumns: ['id'];
          },
        ];
      };
      schedule_changes: {
        Row: {
          changed_by: number | null;
          created_at: string | null;
          id: number;
          new_values: Json | null;
          old_values: Json | null;
          schedule_item_id: number | null;
        };
        Insert: {
          changed_by?: number | null;
          created_at?: string | null;
          id?: number;
          new_values?: Json | null;
          old_values?: Json | null;
          schedule_item_id?: number | null;
        };
        Update: {
          changed_by?: number | null;
          created_at?: string | null;
          id?: number;
          new_values?: Json | null;
          old_values?: Json | null;
          schedule_item_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'schedule_changes_changed_by_fkey';
            columns: ['changed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_changes_schedule_item_id_fkey';
            columns: ['schedule_item_id'];
            isOneToOne: false;
            referencedRelation: 'schedule_items';
            referencedColumns: ['id'];
          },
        ];
      };
      schedule_item_statuses: {
        Row: {
          color: string;
          id: number;
          name: string;
        };
        Insert: {
          color: string;
          id?: number;
          name: string;
        };
        Update: {
          color?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      schedule_items: {
        Row: {
          created_at: string | null;
          description: string | null;
          end_time: string;
          group_id: number | null;
          id: number;
          is_lesson: boolean | null;
          room_id: number | null;
          speaker_id: number | null;
          start_time: string;
          status: number | null;
          subgroup: number | null;
          subject_id: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          end_time: string;
          group_id?: number | null;
          id?: number;
          is_lesson?: boolean | null;
          room_id?: number | null;
          speaker_id?: number | null;
          start_time: string;
          status?: number | null;
          subgroup?: number | null;
          subject_id?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          end_time?: string;
          group_id?: number | null;
          id?: number;
          is_lesson?: boolean | null;
          room_id?: number | null;
          speaker_id?: number | null;
          start_time?: string;
          status?: number | null;
          subgroup?: number | null;
          subject_id?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'schedule_items_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_items_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_items_speaker_id_fkey';
            columns: ['speaker_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_items_status_fkey';
            columns: ['status'];
            isOneToOne: false;
            referencedRelation: 'schedule_item_statuses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_items_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
        ];
      };
      subjects: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      teacher_workload: {
        Row: {
          id: number;
          planned_hours: number;
          semester: number;
          start_year: number;
          subject_id: number | null;
          teacher_id: number | null;
        };
        Insert: {
          id?: number;
          planned_hours: number;
          semester: number;
          start_year: number;
          subject_id?: number | null;
          teacher_id?: number | null;
        };
        Update: {
          id?: number;
          planned_hours?: number;
          semester?: number;
          start_year?: number;
          subject_id?: number | null;
          teacher_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'teacher_workload_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'teacher_workload_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string;
          group_id: number | null;
          id: number;
          phone_number: string | null;
          role_id: number;
          subgroup: number | null;
          telegram_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          full_name: string;
          group_id?: number | null;
          id?: number;
          phone_number?: string | null;
          role_id: number;
          subgroup?: number | null;
          telegram_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string;
          group_id?: number | null;
          id?: number;
          phone_number?: string | null;
          role_id?: number;
          subgroup?: number | null;
          telegram_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
