interface LoginParams {
    usuario: string;
    senha: string;
}

interface LoginResponse {
    success: boolean;
    message: string;
    authorization: {
        token: string;
        type: string;
    };
    user: {
        id: number;
        nome: string;
        usuario: string;
        usuario_grupo_id: string;
        setor: string;
    };
}

export async function login({ usuario, senha }: LoginParams): Promise<LoginResponse> {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            usuario,
            senha
        }),
    });

    
    if (!response.ok) {
        const error = await response.json();
        console.log(error);

    }

    return await response.json();   
}