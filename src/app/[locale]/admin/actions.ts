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
    printed_at: string | null;
  }>;
  error?: string;
}> {
  // Verify session first
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  // Only fetch promotional codes (not paid pack codes)
  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .select('id, code, max_uses, current_uses, is_active, created_at, printed_at')
    .is('pack_id', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching codes:', error);
    return { success: false, error: 'Failed to fetch codes' };
  }

  return { success: true, codes: data };
}

// Get codes for printing: use existing unprinted codes first, generate new ones if needed
export async function printCodesAction(
  quantity: number = 60
): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  // Verify session first
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  // 1. Get existing available promotional codes that haven't been printed (exclude paid pack codes)
  const { data: existingCodes, error: fetchError } = await supabaseAdmin
    .from('promo_codes')
    .select('id, code')
    .is('pack_id', null)
    .is('printed_at', null)
    .eq('is_active', true)
    .lt('current_uses', 1) // current_uses < max_uses (max_uses is always 1)
    .limit(quantity);

  if (fetchError) {
    console.error('Error fetching existing codes:', fetchError);
    return { success: false, error: 'Failed to fetch existing codes' };
  }

  const codesToPrint: { id: string; code: string }[] = existingCodes || [];
  const codesNeeded = quantity - codesToPrint.length;

  // 2. Generate new codes if needed
  if (codesNeeded > 0) {
    const maxAttempts = codesNeeded * 3;
    let attempts = 0;

    while (codesToPrint.length < quantity && attempts < maxAttempts) {
      attempts++;
      const code = generateCode();

      const { data: newCode, error } = await supabaseAdmin
        .from('promo_codes')
        .insert({
          code,
          max_uses: 1,
          current_uses: 0,
          is_active: true,
        })
        .select('id, code')
        .single();

      if (!error && newCode) {
        codesToPrint.push(newCode);
      } else if (error && error.code !== '23505') {
        console.error('Error inserting code:', error);
      }
    }
  }

  if (codesToPrint.length === 0) {
    return { success: false, error: 'Failed to get codes for printing' };
  }

  // 3. Mark all codes as printed
  const codeIds = codesToPrint.map(c => c.id);
  const { error: updateError } = await supabaseAdmin
    .from('promo_codes')
    .update({ printed_at: new Date().toISOString() })
    .in('id', codeIds);

  if (updateError) {
    console.error('Error marking codes as printed:', updateError);
    // Continue anyway, codes are still valid
  }

  return { success: true, codes: codesToPrint.map(c => c.code) };
}
