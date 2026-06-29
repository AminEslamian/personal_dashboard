import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define the absolute path to your local JSON file
const dataFilePath = path.join(process.cwd(), 'db.json');

//(read)
export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const sessions = JSON.parse(fileContents);
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// (create)
export async function POST(request: Request) {
  try {
    const newSession = await request.json();
    
    // Read existing data from the file
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    let sessions = JSON.parse(fileContents);
    
    // Add the new session to the array
    sessions.unshift(newSession);
    
    // Write the updated array back to the file (with 2-space formatting for readability)
    await fs.writeFile(dataFilePath, JSON.stringify(sessions, null, 2));
    
    return NextResponse.json({ success: true, session: newSession });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

// NEW: Handle DELETE requests
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    // Read existing data
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    let sessions = JSON.parse(fileContents);
    
    // Filter out the session with the matching ID
    const updatedSessions = sessions.filter((session: any) => session.id !== id);
    
    // Write the updated array back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(updatedSessions, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}