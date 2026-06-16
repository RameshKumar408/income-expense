export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, authorization',
};

export async function handleOptions() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}
