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
  public: {
    Tables: {
      business_settings: {
        Row: {
          address: string | null
          business_name: string
          default_pickup_location: string | null
          default_rental_security_deposit: number | null
          email: string | null
          id: boolean
          instagram_url: string | null
          phones: string[]
          tiktok_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string
          default_pickup_location?: string | null
          default_rental_security_deposit?: number | null
          email?: string | null
          id?: boolean
          instagram_url?: string | null
          phones?: string[]
          tiktok_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          default_pickup_location?: string | null
          default_rental_security_deposit?: number | null
          email?: string | null
          id?: boolean
          instagram_url?: string | null
          phones?: string[]
          tiktok_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          phone: string
          status: Database["public"]["Enums"]["submission_status"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone: string
          status?: Database["public"]["Enums"]["submission_status"]
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["submission_status"]
        }
        Relationships: []
      }
      content_page_revisions: {
        Row: {
          content: Json
          id: string
          page: string
          published_at: string
          published_by: string | null
        }
        Insert: {
          content: Json
          id?: string
          page: string
          published_at?: string
          published_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          page?: string
          published_at?: string
          published_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_page_revisions_page_fkey"
            columns: ["page"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["page"]
          },
        ]
      }
      content_pages: {
        Row: {
          draft: Json
          has_unpublished_changes: boolean | null
          page: string
          published: Json | null
          published_at: string | null
          published_by: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          draft?: Json
          has_unpublished_changes?: boolean | null
          page: string
          published?: Json | null
          published_at?: string | null
          published_by?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          draft?: Json
          has_unpublished_changes?: boolean | null
          page?: string
          published?: Json | null
          published_at?: string | null
          published_by?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          acquisition_source: string
          code: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          location: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          acquisition_source?: string
          code?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          acquisition_source?: string
          code?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      internal_notes: {
        Row: {
          author_id: string | null
          body: string
          booking_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          order_id: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          booking_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          booking_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "rental_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "vehicle_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_en: string
          alt_fr: string | null
          created_at: string
          height: number | null
          id: string
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_en: string
          alt_fr?: string | null
          created_at?: string
          height?: number | null
          id?: string
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_en?: string
          alt_fr?: string | null
          created_at?: string
          height?: number | null
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean
          event: string
          user_id: string
        }
        Insert: {
          email_enabled?: boolean
          event: string
          user_id: string
        }
        Update: {
          email_enabled?: boolean
          event?: string
          user_id?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "vehicle_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          code: string
          created_at: string
          customer_id: string
          daily_rate: number
          driver_option: Database["public"]["Enums"]["driver_option"]
          estimated_subtotal: number | null
          ghana_card_image_path: string | null
          ghana_card_number: string | null
          id: string
          pickup_date: string
          pickup_location: string | null
          rental_days: number | null
          return_date: string
          security_deposit: number
          status: Database["public"]["Enums"]["rental_status"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          customer_id: string
          daily_rate: number
          driver_option?: Database["public"]["Enums"]["driver_option"]
          estimated_subtotal?: number | null
          ghana_card_image_path?: string | null
          ghana_card_number?: string | null
          id?: string
          pickup_date: string
          pickup_location?: string | null
          rental_days?: number | null
          return_date: string
          security_deposit?: number
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          code?: string
          created_at?: string
          customer_id?: string
          daily_rate?: number
          driver_option?: Database["public"]["Enums"]["driver_option"]
          estimated_subtotal?: number | null
          ghana_card_image_path?: string | null
          ghana_card_number?: string | null
          id?: string
          pickup_date?: string
          pickup_location?: string | null
          rental_days?: number | null
          return_date?: string
          security_deposit?: number
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["rental_status"]
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          status: Database["public"]["Enums"]["rental_status"]
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["rental_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rental_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "rental_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_vehicles: {
        Row: {
          created_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      sell_submissions: {
        Row: {
          asking_price: number | null
          brand: string | null
          code: string
          condition: string | null
          created_at: string
          customer_id: string
          exterior_colour: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"] | null
          id: string
          mileage_km: number | null
          minimum_price: number | null
          model: string | null
          photo_paths: string[]
          price_flexibility: string | null
          status: Database["public"]["Enums"]["submission_status"]
          transmission: Database["public"]["Enums"]["transmission"] | null
          updated_at: string
          year: number | null
        }
        Insert: {
          asking_price?: number | null
          brand?: string | null
          code?: string
          condition?: string | null
          created_at?: string
          customer_id: string
          exterior_colour?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          mileage_km?: number | null
          minimum_price?: number | null
          model?: string | null
          photo_paths?: string[]
          price_flexibility?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          transmission?: Database["public"]["Enums"]["transmission"] | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          asking_price?: number | null
          brand?: string | null
          code?: string
          condition?: string | null
          created_at?: string
          customer_id?: string
          exterior_colour?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          mileage_km?: number | null
          minimum_price?: number | null
          model?: string | null
          photo_paths?: string[]
          price_flexibility?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          transmission?: Database["public"]["Enums"]["transmission"] | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sell_submissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          created_at: string
          id: string
          is_cover: boolean
          sort_order: number
          storage_path: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_orders: {
        Row: {
          budget_amount: number | null
          budget_covers: Database["public"]["Enums"]["budget_covers"] | null
          budget_currency: string
          code: string
          condition_preference:
            | Database["public"]["Enums"]["condition_preference"]
            | null
          created_at: string
          customer_id: string
          customer_notes: string | null
          estimated_arrival_date: string | null
          estimated_price: number | null
          estimated_price_currency: string
          fuel_preference: Database["public"]["Enums"]["fuel_preference"] | null
          id: string
          latest_update_body: string | null
          latest_update_title: string | null
          policy_accepted_at: string | null
          requested_brand: string | null
          requested_model: string | null
          requested_year_range: string | null
          service_type: Database["public"]["Enums"]["order_service_type"]
          status: Database["public"]["Enums"]["order_status"]
          transmission_preference:
            | Database["public"]["Enums"]["transmission_preference"]
            | null
          updated_at: string
          vehicle_id: string | null
          vehicle_origin: string | null
          vehicle_title: string | null
        }
        Insert: {
          budget_amount?: number | null
          budget_covers?: Database["public"]["Enums"]["budget_covers"] | null
          budget_currency?: string
          code?: string
          condition_preference?:
            | Database["public"]["Enums"]["condition_preference"]
            | null
          created_at?: string
          customer_id: string
          customer_notes?: string | null
          estimated_arrival_date?: string | null
          estimated_price?: number | null
          estimated_price_currency?: string
          fuel_preference?:
            | Database["public"]["Enums"]["fuel_preference"]
            | null
          id?: string
          latest_update_body?: string | null
          latest_update_title?: string | null
          policy_accepted_at?: string | null
          requested_brand?: string | null
          requested_model?: string | null
          requested_year_range?: string | null
          service_type: Database["public"]["Enums"]["order_service_type"]
          status: Database["public"]["Enums"]["order_status"]
          transmission_preference?:
            | Database["public"]["Enums"]["transmission_preference"]
            | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_origin?: string | null
          vehicle_title?: string | null
        }
        Update: {
          budget_amount?: number | null
          budget_covers?: Database["public"]["Enums"]["budget_covers"] | null
          budget_currency?: string
          code?: string
          condition_preference?:
            | Database["public"]["Enums"]["condition_preference"]
            | null
          created_at?: string
          customer_id?: string
          customer_notes?: string | null
          estimated_arrival_date?: string | null
          estimated_price?: number | null
          estimated_price_currency?: string
          fuel_preference?:
            | Database["public"]["Enums"]["fuel_preference"]
            | null
          id?: string
          latest_update_body?: string | null
          latest_update_title?: string | null
          policy_accepted_at?: string | null
          requested_brand?: string | null
          requested_model?: string | null
          requested_year_range?: string | null
          service_type?: Database["public"]["Enums"]["order_service_type"]
          status?: Database["public"]["Enums"]["order_status"]
          transmission_preference?:
            | Database["public"]["Enums"]["transmission_preference"]
            | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_origin?: string | null
          vehicle_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          accident_history: string | null
          availability_status: Database["public"]["Enums"]["availability_status"]
          body_type: Database["public"]["Enums"]["body_type"] | null
          brand: string
          code: string
          condition: Database["public"]["Enums"]["vehicle_condition"]
          condition_grade: string | null
          created_at: string
          created_by: string | null
          description: string | null
          exterior_colour: string | null
          featured_order: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"] | null
          id: string
          inspection_status: string | null
          is_featured: boolean
          listing_purpose: Database["public"]["Enums"]["listing_purpose"]
          listing_status: Database["public"]["Enums"]["listing_status"]
          location: string | null
          mileage_km: number | null
          model: string
          published_at: string | null
          registration: string | null
          rental_daily_rate: number | null
          rental_security_deposit: number | null
          sale_price: number | null
          seats: number | null
          seller_name: string
          slug: string
          transmission: Database["public"]["Enums"]["transmission"] | null
          trim: string | null
          updated_at: string
          year: number
        }
        Insert: {
          accident_history?: string | null
          availability_status?: Database["public"]["Enums"]["availability_status"]
          body_type?: Database["public"]["Enums"]["body_type"] | null
          brand: string
          code?: string
          condition: Database["public"]["Enums"]["vehicle_condition"]
          condition_grade?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exterior_colour?: string | null
          featured_order?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          inspection_status?: string | null
          is_featured?: boolean
          listing_purpose: Database["public"]["Enums"]["listing_purpose"]
          listing_status?: Database["public"]["Enums"]["listing_status"]
          location?: string | null
          mileage_km?: number | null
          model: string
          published_at?: string | null
          registration?: string | null
          rental_daily_rate?: number | null
          rental_security_deposit?: number | null
          sale_price?: number | null
          seats?: number | null
          seller_name?: string
          slug: string
          transmission?: Database["public"]["Enums"]["transmission"] | null
          trim?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          accident_history?: string | null
          availability_status?: Database["public"]["Enums"]["availability_status"]
          body_type?: Database["public"]["Enums"]["body_type"] | null
          brand?: string
          code?: string
          condition?: Database["public"]["Enums"]["vehicle_condition"]
          condition_grade?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exterior_colour?: string | null
          featured_order?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          inspection_status?: string | null
          is_featured?: boolean
          listing_purpose?: Database["public"]["Enums"]["listing_purpose"]
          listing_status?: Database["public"]["Enums"]["listing_status"]
          location?: string | null
          mileage_km?: number | null
          model?: string
          published_at?: string | null
          registration?: string | null
          rental_daily_rate?: number | null
          rental_security_deposit?: number | null
          sale_price?: number | null
          seats?: number | null
          seller_name?: string
          slug?: string
          transmission?: Database["public"]["Enums"]["transmission"] | null
          trim?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_published_content: { Args: { p_page: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      publish_content_page: {
        Args: { p_expected_version: number; p_page: string }
        Returns: {
          draft: Json
          has_unpublished_changes: boolean | null
          page: string
          published: Json | null
          published_at: string | null
          published_by: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "content_pages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      restore_content_revision: {
        Args: { p_revision_id: string }
        Returns: {
          draft: Json
          has_unpublished_changes: boolean | null
          page: string
          published: Json | null
          published_at: string | null
          published_by: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "content_pages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      availability_status:
        | "available"
        | "booked"
        | "rented"
        | "sold"
        | "under_maintenance"
        | "unavailable"
      body_type: "suv" | "sedan" | "hatchback" | "pickup" | "other"
      budget_covers: "purchase_only" | "purchase_and_import" | "not_sure"
      condition_preference: "brand_new" | "used" | "either"
      driver_option: "self_drive" | "with_driver"
      fuel_preference:
        | "petrol"
        | "diesel"
        | "hybrid"
        | "electric"
        | "no_preference"
      fuel_type: "petrol" | "diesel" | "hybrid" | "electric"
      listing_purpose: "sale" | "rent"
      listing_status: "draft" | "published" | "hidden"
      order_service_type:
        | "find_and_purchase"
        | "import_found_car"
        | "listing_purchase"
      order_status:
        | "enquiry"
        | "reviewing"
        | "confirmed"
        | "sourcing"
        | "purchased"
        | "in_transit"
        | "customs_clearance"
        | "delivered"
        | "inquiry_received"
        | "availability_confirmed"
        | "purchase_arrangements"
        | "vehicle_handover"
        | "cancelled"
      rental_status:
        | "inquiry_received"
        | "confirmed"
        | "ready_for_pickup"
        | "active"
        | "returned"
        | "cancelled"
      submission_status: "new" | "in_review" | "closed"
      transmission: "automatic" | "manual"
      transmission_preference: "automatic" | "manual" | "no_preference"
      user_role: "customer" | "admin" | "super_admin"
      vehicle_condition: "brand_new" | "used"
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
  public: {
    Enums: {
      availability_status: [
        "available",
        "booked",
        "rented",
        "sold",
        "under_maintenance",
        "unavailable",
      ],
      body_type: ["suv", "sedan", "hatchback", "pickup", "other"],
      budget_covers: ["purchase_only", "purchase_and_import", "not_sure"],
      condition_preference: ["brand_new", "used", "either"],
      driver_option: ["self_drive", "with_driver"],
      fuel_preference: [
        "petrol",
        "diesel",
        "hybrid",
        "electric",
        "no_preference",
      ],
      fuel_type: ["petrol", "diesel", "hybrid", "electric"],
      listing_purpose: ["sale", "rent"],
      listing_status: ["draft", "published", "hidden"],
      order_service_type: [
        "find_and_purchase",
        "import_found_car",
        "listing_purchase",
      ],
      order_status: [
        "enquiry",
        "reviewing",
        "confirmed",
        "sourcing",
        "purchased",
        "in_transit",
        "customs_clearance",
        "delivered",
        "inquiry_received",
        "availability_confirmed",
        "purchase_arrangements",
        "vehicle_handover",
        "cancelled",
      ],
      rental_status: [
        "inquiry_received",
        "confirmed",
        "ready_for_pickup",
        "active",
        "returned",
        "cancelled",
      ],
      submission_status: ["new", "in_review", "closed"],
      transmission: ["automatic", "manual"],
      transmission_preference: ["automatic", "manual", "no_preference"],
      user_role: ["customer", "admin", "super_admin"],
      vehicle_condition: ["brand_new", "used"],
    },
  },
} as const
