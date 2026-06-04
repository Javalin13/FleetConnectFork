export default async function handler(req, res) {
  // Supabase configuratie
  const supabaseUrl = 'https://rreqjjrmvytnwnsidmqi.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFqanJtdnl0bnduc2lkbXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MjAxMzcsImV4cCI6MjA5Mzk5NjEzN30.q4M3A6Dix3F_9Im2pw8DUIeE4C-INtUlvImRDM58MATA';
  const supabase = (await import('@supabase/supabase-js')).createClient(supabaseUrl, supabaseKey);

  const { token_hash, type, next } = req.query;
  const redirectTo = next || '/Paneel/partner-reset-password.html';

  if (token_hash && type) {
    // Verifieer de OTP
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    // Stuur de gebruiker door, met of zonder foutmelding
    if (error) {
      return res.redirect(`/Paneel/partner-reset-password.html?error=invalid`);
    }
    return res.redirect(`${redirectTo}?verified=true`);
  }
  
  return res.redirect('/Paneel/partner-reset-password.html?error=missing_params');
}
