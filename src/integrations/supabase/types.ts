export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      balance_transfers: {
        Row: {
          amount: number
          created_at: string | null
          from_wallet: boolean
          id: string
          status: string | null
          to_trading: boolean
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_wallet: boolean
          id?: string
          status?: string | null
          to_trading: boolean
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_wallet?: boolean
          id?: string
          status?: string | null
          to_trading?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      currency_pairs: {
        Row: {
          base_currency: string
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          pip_value: number | null
          quote_currency: string
          symbol: string
        }
        Insert: {
          base_currency: string
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          pip_value?: number | null
          quote_currency: string
          symbol: string
        }
        Update: {
          base_currency?: string
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          pip_value?: number | null
          quote_currency?: string
          symbol?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_method: string
          qr_code_url: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_method: string
          qr_code_url?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string
          qr_code_url?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      forex_preferences: {
        Row: {
          created_at: string | null
          timeframe: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          timeframe?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          timeframe?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ITRADEFX: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          id: string
          payment_qr_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_qr_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_qr_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount: number
          closed_at: string | null
          closing_price: number | null
          created_at: string | null
          currency_pair: string
          id: string
          margin_requirement: number | null
          price: number
          profit_loss: number | null
          status: string | null
          total_value: number
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          closed_at?: string | null
          closing_price?: number | null
          created_at?: string | null
          currency_pair: string
          id?: string
          margin_requirement?: number | null
          price: number
          profit_loss?: number | null
          status?: string | null
          total_value: number
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          closed_at?: string | null
          closing_price?: number | null
          created_at?: string | null
          currency_pair?: string
          id?: string
          margin_requirement?: number | null
          price?: number
          profit_loss?: number | null
          status?: string | null
          total_value?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          balance: number | null
          equity: number | null
          trading_balance: number | null
          updated_at: string | null
          used_margin: number | null
          user_id: string
          wallet_balance: number | null
        }
        Insert: {
          balance?: number | null
          equity?: number | null
          trading_balance?: number | null
          updated_at?: string | null
          used_margin?: number | null
          user_id: string
          wallet_balance?: number | null
        }
        Update: {
          balance?: number | null
          equity?: number | null
          trading_balance?: number | null
          updated_at?: string | null
          used_margin?: number | null
          user_id?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          bank_details: Json | null
          bank_statement_path: string | null
          created_at: string | null
          crypto_address: string | null
          id: string
          payment_method: string
          status: string | null
          updated_at: string | null
          upi_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          bank_statement_path?: string | null
          created_at?: string | null
          crypto_address?: string | null
          id?: string
          payment_method: string
          status?: string | null
          updated_at?: string | null
          upi_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          bank_statement_path?: string | null
          created_at?: string | null
          crypto_address?: string | null
          id?: string
          payment_method?: string
          status?: string | null
          updated_at?: string | null
          upi_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_role: {
        Args: {
          user_id: string
          required_role: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
