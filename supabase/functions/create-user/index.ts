
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Get the current user to verify they're an admin
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Get the caller's profile to check their role
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();
    
    if (profileError || !callerProfile || callerProfile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can create users" }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Get the request body
    const { email, password, name, role } = await req.json();
    
    // Validate input
    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({ error: "Email, password, name, and role are required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    if (!["admin", "planner", "volunteer"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Role must be one of: admin, planner, volunteer" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    
    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Update the user's role in the profiles table
    if (userData.user) {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ role })
        .eq("id", userData.user.id);
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to set user role" }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, user: userData.user }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
