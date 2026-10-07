import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cardNumber, plan, amount } = body;

    // Simulación de validación de Kushki Pagos (Ecuador) o Stripe
    if (!cardNumber || cardNumber.length < 14) {
      return NextResponse.json({ success: false, error: 'Tarjeta inválida' }, { status: 400 });
    }

    // Simulamos el retraso de la pasarela bancaria
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generamos un token de transacción simulado
    const transactionId = 'KSH-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    return NextResponse.json({ 
      success: true, 
      transactionId, 
      message: `Tokenización y cobro de $${amount} para el plan ${plan} exitoso.`,
      status: 'APPROVED'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error procesando el pago' }, { status: 500 });
  }
}
