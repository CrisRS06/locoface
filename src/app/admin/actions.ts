'use server';

import { createSession, clearSession, validatePassword, verifySession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

// Generate a random code in format LOCO-XXXXXX
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
  let code = 'LOCO-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function loginAction(password: string): Promise<{ success: boolean; error?: string }> {
  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  if (!validatePassword(password)) {
    return { success: false, error: 'Invalid password' };
  }

  await createSession();
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await clearSession();
}

export async function generateCodesAction(
  quantity: number
): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  // Verify session first
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  // Validate quantity
  if (!quantity || quantity < 1 || quantity > 100) {
    return { success: false, error: 'Quantity must be between 1 and 100' };
  }

  const codes: string[] = [];
  const maxAttempts = quantity * 3; // Allow retries for collisions
  let attempts = 0;

  while (codes.length < quantity && attempts < maxAttempts) {
    attempts++;
    const code = generateCode();

    // Try to insert the code
    const { error } = await supabaseAdmin
      .from('promo_codes')
      .insert({
        code,
        max_uses: 1,
        current_uses: 0,
        is_active: true,
      });

    if (!error) {
      codes.push(code);
    } else if (error.code !== '23505') {
      // Not a unique constraint violation
      console.error('Error inserting code:', error);
    }
    // If unique constraint violation, just try again with a new code
  }

  if (codes.length === 0) {
    return { success: false, error: 'Failed to generate codes' };
  }

  return { success: true, codes };
}

export async function getExistingCodesAction(): Promise<{
  success: boolean;
  codes?: Array<{
    id: string;
    code: string;
    max_uses: number;
    current_uses: number;
    is_active: boolean;
    created_at: string;
  }>;
  error?: string;
}> {
  // Verify session first
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .select('id, code, max_uses, current_uses, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching codes:', error);
    return { success: false, error: 'Failed to fetch codes' };
  }

  return { success: true, codes: data };
}
