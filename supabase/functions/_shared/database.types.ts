export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          name: string;
          type: string;
          location: string;
          install_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          location: string;
          install_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          location?: string;
          install_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          asset_id: string | null;
          assigned_to: string | null;
          due_date: string | null;
          frequency: string | null;
          checklist: Json;
          priority: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          asset_id?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          frequency?: string | null;
          checklist?: Json;
          priority?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          asset_id?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          frequency?: string | null;
          checklist?: Json;
          priority?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          avatar_url: string | null;
          user_id: string | null;
          token_identifier: string;
          subscription: string | null;
          credits: string | null;
          image: string | null;
          created_at: string;
          updated_at: string | null;
          email: string | null;
          name: string | null;
          full_name: string | null;
          role: string | null;
          mode: string | null;
          phone_number: string | null;
        };
        Insert: {
          id: string;
          avatar_url?: string | null;
          user_id?: string | null;
          token_identifier: string;
          subscription?: string | null;
          credits?: string | null;
          image?: string | null;
          created_at?: string;
          updated_at?: string | null;
          email?: string | null;
          name?: string | null;
          full_name?: string | null;
          role?: string | null;
          mode?: string | null;
          phone_number?: string | null;
        };
        Update: {
          id?: string;
          avatar_url?: string | null;
          user_id?: string | null;
          token_identifier?: string;
          subscription?: string | null;
          credits?: string | null;
          image?: string | null;
          created_at?: string;
          updated_at?: string | null;
          email?: string | null;
          name?: string | null;
          full_name?: string | null;
          role?: string | null;
          mode?: string | null;
          phone_number?: string | null;
        };
      };
      maintenance_logs: {
        Row: {
          id: string;
          task_id: string | null;
          asset_id: string | null;
          completed_by: string | null;
          date_completed: string;
          cost: number | null;
          time_taken: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string | null;
          asset_id?: string | null;
          completed_by?: string | null;
          date_completed?: string;
          cost?: number | null;
          time_taken?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string | null;
          asset_id?: string | null;
          completed_by?: string | null;
          date_completed?: string;
          cost?: number | null;
          time_taken?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          amount: number | null;
          cancel_at_period_end: boolean | null;
          canceled_at: number | null;
          created_at: string;
          currency: string | null;
          current_period_end: number | null;
          current_period_start: number | null;
          custom_field_data: Json | null;
          customer_cancellation_comment: string | null;
          customer_cancellation_reason: string | null;
          customer_id: string | null;
          ended_at: number | null;
          ends_at: number | null;
          id: string;
          interval: string | null;
          metadata: Json | null;
          price_id: string | null;
          started_at: number | null;
          status: string | null;
          stripe_id: string | null;
          stripe_price_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          amount?: number | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: number | null;
          created_at?: string;
          currency?: string | null;
          current_period_end?: number | null;
          current_period_start?: number | null;
          custom_field_data?: Json | null;
          customer_cancellation_comment?: string | null;
          customer_cancellation_reason?: string | null;
          customer_id?: string | null;
          ended_at?: number | null;
          ends_at?: number | null;
          id?: string;
          interval?: string | null;
          metadata?: Json | null;
          price_id?: string | null;
          started_at?: number | null;
          status?: string | null;
          stripe_id?: string | null;
          stripe_price_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          amount?: number | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: number | null;
          created_at?: string;
          currency?: string | null;
          current_period_end?: number | null;
          current_period_start?: number | null;
          custom_field_data?: Json | null;
          customer_cancellation_comment?: string | null;
          customer_cancellation_reason?: string | null;
          customer_id?: string | null;
          ended_at?: number | null;
          ends_at?: number | null;
          id?: string;
          interval?: string | null;
          metadata?: Json | null;
          price_id?: string | null;
          started_at?: number | null;
          status?: string | null;
          stripe_id?: string | null;
          stripe_price_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      webhook_events: {
        Row: {
          created_at: string;
          data: Json | null;
          event_type: string;
          id: string;
          modified_at: string;
          stripe_event_id: string | null;
          type: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          event_type: string;
          id?: string;
          modified_at?: string;
          stripe_event_id?: string | null;
          type: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          event_type?: string;
          id?: string;
          modified_at?: string;
          stripe_event_id?: string | null;
          type?: string;
        };
        Relationships: [];
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
