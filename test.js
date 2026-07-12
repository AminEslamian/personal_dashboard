const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yqehmbxzmsvacqikxehg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZWhtYnh6bXN2YWNxaWt4ZWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NTcyNjIsImV4cCI6MjA5ODUzMzI2Mn0.kdGgQSh2JbSIGlM3e5XnIZtcWJQqYF4NJ7W6O10ugvU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing GET query...");
  const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        id,
        hours,
        type,
        date,
        subject:subjects(
          name,
          macro:macros(
            name
          )
        )
      `)
      .limit(2);

  if (error) {
    console.error("GET Error:", error);
  } else {
    console.log("RAW GET Data:", JSON.stringify(sessions, null, 2));
  }

  const { data: macro, error: macroError } = await supabase
      .from('macros')
      .select('id')
      .eq('name', 'SomeNonExistentMacro')
      .single();
  
  console.log("Macro single test:");
  console.log("Data:", macro);
  console.log("Error:", macroError);
}

test();
