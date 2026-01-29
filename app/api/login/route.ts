import api from "@/lib/axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await api.post('/auth/login', body);
    
    const data = await response.data;

    console.log(response.status);

    // Retorna a resposta com o mesmo status code
    return Response.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Erro na API Route de login:', error);
    return Response.json(
      { error: 'Erro ao processar requisição de login' },
      { status: 500 }
    );
  }
}
