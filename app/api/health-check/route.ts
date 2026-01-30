import { NextResponse } from 'next/server';
import { checkAssistantHealth } from '@/services/ia/assistant';

export async function GET() {
  try {
    const healthStatus = await checkAssistantHealth();
    
    console.log(`[${new Date().toISOString()}] Health check realizado com sucesso:`, healthStatus);
    
    return NextResponse.json({ 
      success: true, 
      data: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Erro no health check:`, error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
